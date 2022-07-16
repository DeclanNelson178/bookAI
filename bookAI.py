from gutenbergpy import textget
from gutenbergpy.gutenbergcache import GutenbergCache, GutenbergCacheTypes
import spacy
import coreferee
from spacytextblob.spacytextblob import SpacyTextBlob
import pandas as pd
import matplotlib.pyplot as plt
from tqdm import tqdm
import numpy as np
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

import math

cred = credentials.Certificate("firebase_admin_key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


nlp = spacy.load("en_core_web_sm")
nlp.add_pipe('coreferee')
nlp.add_pipe('spacytextblob')

# only need to create the cache once
# GutenbergCache.create()
cache = GutenbergCache.get_cache()
ENGLISH_ID = list(cache.native_query("SELECT * FROM languages WHERE name='en'"))[0][0]


def get_book(title):
    book_id = list(
        cache.native_query(f"SELECT bookid FROM titles WHERE name='{title}'")
    )[0][0]

    book_id = list(
        cache.native_query(f"SELECT gutenbergbookid FROM books WHERE id='{book_id}' AND languageid='{ENGLISH_ID}'")
    )[0][0]

    text = str(textget.get_text_by_id(book_id), 'UTF-8')
    book = clean_book(text, title)
    return book


def clean_book(book, title):
    idx = -1
    i = 0
    beginning_strings = list(textget.TEXT_START_MARKERS)
    while idx == -1:
        beginning_string = beginning_strings[i]
        idx = book.find(beginning_string)
        i += 1

    book = book[idx + len(beginning_string):]

    # remove Gutenberg nonsense at the end
    idx = -1
    i = 0
    ending_strings = list(textget.TEXT_END_MARKERS)
    while idx == -1:
        ending_string = ending_strings[i]
        idx = book.find(ending_string)
        i += 1

    book = book[: idx]

    return book


def get_characters(doc):
    # get every noun/noun phrase that is recognized as a person
    character_references = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]

    # count number of references for each character
    character_occurrences = pd.value_counts(character_references)

    # select the characters before the largest difference in occurrence count
    diffs = []
    for i in range(len(character_occurrences) - 1):
        # compare with next largest character count
        diff = character_occurrences[i] - character_occurrences[i + 1]
        diffs.append((i + 1, diff))

    # find the largest difference in consecutive character counts
    max_diff_idx, max_diff = max(diffs, key=lambda item: item[1])

    # return the most significant characters
    return character_occurrences.head(max_diff_idx)

def get_character_sentences(character, doc):
    """Get list of all sentences directly or indirectly referencing a character."""
    character_sentences = []

    for chain in doc._.coref_chains:
        # iterate over all reference chains detected
        idx = chain.most_specific_mention_index
        # find the most specific name for the character
        name = chain[idx].pretty_representation.split('(')[0]
        if name == character:
            for mention_idx in chain:
                # track all corefences of character
                mention_idx = mention_idx[0]
                token = doc[mention_idx]
                character_sentences.append((mention_idx, token.sent))

    # return references and sentences
    return character_sentences


def get_most_and_least_positive_sentences(doc, character_analysis):
    # sort polarity scores in descending order
    character_analysis = sorted(character_analysis, key=lambda item: item[1], reverse=True)

    # find the top and bottom 10 percent of sentences
    ten_percent = len(character_analysis) // 10
    most_positive_indices = character_analysis[: ten_percent]
    least_positive_indices = character_analysis[-ten_percent:]
    most_positive_sentences, least_positive_sentences = set(), set()
    for (most_positive_idx, positive_score), (least_positive_idx, negative_score) in zip(most_positive_indices, least_positive_indices):
        assert positive_score >= negative_score, 'not sorting in correct order'
        positive_text, negative_text = doc[most_positive_idx].sent.text, doc[least_positive_idx].sent.text
        if positive_text not in most_positive_sentences:
            most_positive_sentences.add(doc[most_positive_idx].sent.text)

        if negative_text not in least_positive_sentences:
            least_positive_sentences.add(doc[least_positive_idx].sent.text)

    return list(most_positive_sentences), list(least_positive_sentences)


def get_character_analysis(character, doc, doc_id):
    character_sentences = get_character_sentences(character, doc)
    analysis = [(idx, sentence._.blob.polarity, doc_id) for idx, sentence in character_sentences]
    return analysis


def get_book_analysis(window, docs):
    scores = []
    for doc in docs:
        sents = list(doc.sents)

        for i in tqdm(range(len(sents) - window)):
            text = sents[i: i + window]
            text_score = sum([sent._.blob.polarity for sent in text]) / window
            scores.append(text_score)

    return scores


def main(title, save_to_db=True):
    # get book from project gutenberg
    book = get_book(title)

    # load book into nlp analyzer
    if len(book) > 1e6:
        words = book.split()
        book_sections = np.array_split(words, math.ceil(len(book) / 1e6))
        book_sections = [' '.join(words) for words in book_sections]
    else:
        book_sections = [book]

    docs = []
    for section in tqdm(book_sections):
        docs.append(nlp(section))

    number_of_sentences = sum([len(list(doc.sents)) for doc in docs])
    number_of_words = sum([len(list(doc)) for doc in docs])

    # get most popular characters in novel
    character_occurrences = [get_characters(doc) for doc in docs]

    d1 = dict(character_occurrences[0])
    for i in range(1, len(character_occurrences)):
        d1.update(dict(character_occurrences[i]))
    character_occurrences = d1

    characters = list(character_occurrences.keys())

    all_characters_analysis = {}
    for doc_id, doc in enumerate(docs):
        characters_analysis = {character: get_character_analysis(character, doc, doc_id) for character in characters}
        for character, analysis in characters_analysis.items():
            if character in all_characters_analysis:
                all_characters_analysis[character].extend(analysis)
            else:
                all_characters_analysis[character] = analysis

    average_characters_polarity = {
        character: sum([score for _, score, _ in analysis]) / len(analysis)
        for character, analysis in all_characters_analysis.items()
    }

    book_analysis_window = 50
    book_analysis = get_book_analysis(book_analysis_window, docs)

    characters_json = []
    for character, occurrence_count in character_occurrences.items():
        characters_json.append({
            'name': character,
            'occurrence_count': int(occurrence_count),
            'avg_polarity': average_characters_polarity[character],
            'sentiment_analysis_scores': [score for _, score, _ in characters_analysis[character]],
            'sentiment_analysis_indices': [idx for idx, _, _ in characters_analysis[character]],
            'sentiment_analysis_sentences': [docs[doc_idx][token_idx].sent.text for token_idx, _, doc_idx in
                                             characters_analysis[character]],
        })

    if save_to_db:
        doc_ref = db.collection('book').document(title)
        doc_ref.set({
            'title': title,
            'word_count': number_of_words,
            'sentence_count': number_of_sentences,
            'book_analysis': book_analysis,
            'book_analysis_window': book_analysis_window,
            'characters': characters_json
        })


if __name__ == "__main__":
    popular_titles = [
        'Moby Dick; Or, The Whale',
        'Pride and Prejudice',
        'Alice\'s Adventures in Wonderland',
        'The Adventures of Sherlock Holmes',
        'Frankenstein; Or, The Modern Prometheus',
        'Dracula',
        'Ulysses',
        'The Yellow Wallpaper',
        'The Picture of Dorian Grey',
        'A Tale of Two Cities',
        'Birds from North Borneo',
        'A Modest Proposal',
        'Japanese Girls and Women',
        'The Count of Monte Christo',
        'War and Peace',
        'Crime and Punishment',
        'The Iliad',
        'Adventures of Huckleberry Finn',
        'The Odyssey'
    ]
    for title in popular_titles:
        try:
            print(f'processing: {title}...')
            main(title, save_to_db=True)
        except Exception:
            print('ERROR')
            print(Exception)
