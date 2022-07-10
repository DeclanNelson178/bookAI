from gutenbergpy import textget
from gutenbergpy.gutenbergcache import GutenbergCache, GutenbergCacheTypes
import spacy
import coreferee
from spacytextblob.spacytextblob import SpacyTextBlob
import pandas as pd
import matplotlib.pyplot as plt
from tqdm import tqdm


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
    BEGINNNING_STRING = f"*** START OF THE PROJECT GUTENBERG EBOOK {title.upper()} ***"
    idx = book.index(BEGINNNING_STRING)
    book = book[idx + len(BEGINNNING_STRING):]

    # remove Gutenberg nonsense at the end
    ENDING_STRING = f"*** END OF THE PROJECT GUTENBERG EBOOK {title.upper()} ***"
    idx = book.index(ENDING_STRING)
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


def get_character_analysis(character, doc):
    character_sentences = get_character_sentences(character, doc)
    return [(idx, sentence._.blob.polarity) for idx, sentence in character_sentences]


def get_book_analysis(doc):
    sents = list(doc.sents)
    window = 50
    scores = []

    for i in tqdm(range(len(sents) - window)):
        text = sents[i: i + window]
        text_score = sum([sent._.blob.polarity for sent in text]) / window
        scores.append(text_score)

    return scores


if __name__ == "__main__":
    # get book from project gutenberg
    book = get_book('The Great Gatsby')

    # load book into nlp analyzer
    print('loading book into SpaCy')
    doc = nlp(book)
    print('done.')

    # get most popular characters in novel
    character_occurrences = get_characters(doc)
    characters = list(character_occurrences.keys())

    print('-----Top characters and number of references-----')
    print(character_occurrences)

    characters_analysis = {character: get_character_analysis(character, doc) for character in characters}
    for character, analysis in characters_analysis.items():
        print(f'{character} has an average polarity of {sum([score for _, score in analysis]) / len(analysis)}')

    for i, character in enumerate(characters):
        print(character)
        plt.figure(i)
        indices = [idx for idx, _ in characters_analysis[character]]
        scores = [score for _, score in characters_analysis[character]]
        plt.scatter(indices, scores, label=character)
        plt.title(character)
        plt.show()

    scores = get_book_analysis(doc)
    plt.figure(i + 1)
    plt.title('Total Book Polarity')
    plt.plot(range(len(scores)), scores)
    plt.show()
