# bookAI

This project seeks leverage natural language processing to gain insight into classic works of fiction. Works used are available through Project Gutenberg (https://gutenberg.org).

## Analysis

The analysis of each text occurs through the backend, where a Python script analyzes a given novel.
The script utilizes SpaCy and Coreferee for sentiment analysis and coreference handling.

The novel is initialy analyze using sentiment analysis. To maintain context, a sliding window approach is taken. We group 50 consecutive sentences together and record the sentiment of this chunk of text. We then remove the first sentence and add the next sentence into the sliding window.

We determine main characters through entity recognition with SpaCy. This is an imperfect solution and many returned entities are not characters in the novel. Therefore, we take character names which occur the most for analysis.

For each character, we get all sentences in which their name is mentioned or they are referenced. Coreferee is used to handle sentences where a characters name does not appear. Each sentence is then given a polarity score.

Finally, data is stored in a Google Firestore database. Since the analysis only needs to be performed once, we forwent an backend API and instead read directly from the database.


## Data Display

We use React and Material-UI to create a front-end dash board for each text. Users can select which text they are interested in and compare characters changing sentiments throughout the novel.
