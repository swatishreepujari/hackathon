import string
import re
import pickle
import random

from nltk.corpus import twitter_samples
from nltk import word_tokenize,FreqDist

from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tag import pos_tag

from nltk.classify.scikitlearn import SklearnClassifier
from sklearn.naive_bayes import MultinomialNB,BernoulliNB
from sklearn.linear_model import LogisticRegression,SGDClassifier
from nltk.classify import ClassifierI
from statistics import mode
from nltk import NaiveBayesClassifier,classify

stemmer = PorterStemmer()
stop_words = list(set(stopwords.words('english')))

pos_tweets = twitter_samples.strings('positive_tweets.json')
neg_tweets = twitter_samples.strings('negative_tweets.json')
all_tweets = twitter_samples.strings('tweets.20150430-223406.json')

allowed_word_types = ["J"]
all_words = []
documents = []

for p in pos_tweets:

    # create a list of tuples where the first element of each tuple is a review
    # the second element is the label
    documents.append((p, "pos"))

    # remove punctuations
    cleaned = re.sub(r'[^(a-zA-Z)\s]', '', p)

    # tokenize
    tokenized = word_tokenize(cleaned)

    # remove stopwords
    stopped = [w for w in tokenized if not w in stop_words]

    # parts of speech tagging for each word
    pos = pos_tag(stopped)

    # make a list of  all adjectives identified by the allowed word types list above
    for w in pos:
        if w[1][0] in allowed_word_types:
            all_words.append(w[0].lower())

for p in neg_tweets:
    # create a list of tuples where the first element of each tuple is a review
    # the second element is the label
    documents.append((p, "neg"))

    # remove punctuations
    cleaned = re.sub(r'[^(a-zA-Z)\s]', '', p)

    # tokenize
    tokenized = word_tokenize(cleaned)

    # remove stopwords
    stopped = [w for w in tokenized if not w in stop_words]

    # parts of speech tagging for each word
    neg = pos_tag(stopped)

    # make a list of  all adjectives identified by the allowed word types list above
    for w in neg:
        if w[1][0] in allowed_word_types:
            all_words.append(w[0].lower())
pos_A = []
for w in pos:
    if w[1][0] in allowed_word_types:
        pos_A.append(w[0].lower())
pos_N = []
for w in neg:
    if w[1][0] in allowed_word_types:
        pos_N.append(w[0].lower())

save_documents = open("pickled/documents.pickle","wb")
pickle.dump(documents, save_documents)
save_documents.close()

# creating a frequency distribution of each adjectives.
BOW = FreqDist(all_words)

# listing the 5000 most frequent words
word_features = list(BOW.keys())[:5000]

save_word_features = open("pickled/word_features5k.pickle","wb")
pickle.dump(word_features, save_word_features)
save_word_features.close()

def find_features(document):
    words = word_tokenize(document)
    features = {}
    for w in word_features:
        features[w] = (w in words)

    return features

# Creating features for each review
featuresets = [(find_features(rev), category) for (rev, category) in documents]

# Shuffling the documents
random.shuffle(featuresets)

training_set = featuresets[:20000]
testing_set = featuresets[20000:]
print(testing_set.shape())



classifier = NaiveBayesClassifier.train(training_set)
accuracy = classify.accuracy(classifier, testing_set)

MNB_clf = SklearnClassifier(MultinomialNB())
MNB_clf.train(training_set)
print("MNB_classifier accuracy percent:", (classify.accuracy(MNB_clf, testing_set))*100)

BNB_clf = SklearnClassifier(BernoulliNB())
BNB_clf.train(training_set)
print("BernoulliNB_classifier accuracy percent:", (classify.accuracy(BNB_clf, testing_set))*100)

LogReg_clf = SklearnClassifier(LogisticRegression())
LogReg_clf.train(training_set)
print("LogisticRegression_classifier accuracy percent:", (classify.accuracy(LogReg_clf, testing_set))*100)

SGD_clf = SklearnClassifier(SGDClassifier())
SGD_clf.train(training_set)


def create_pickle(c, file_name):
    save_classifier = open(file_name, 'wb')
    pickle.dump(c, save_classifier)
    save_classifier.close()

classifiers_dict = {'ONB': [classifier, 'pickled/ONB_clf.pickle'],
                    'MNB': [MNB_clf, 'pickled/MNB_clf.pickle'],
                    'BNB': [BNB_clf, 'pickled/BNB_clf.pickle'],
                    'LOGREG': [LogReg_clf, 'pickled/LogReg_clf.pickle'],
                    'SGD': [SGD_clf, 'pickled/SGD_clf.pickle'],
                    }
for clf, models in classifiers_dict.items():
    create_pickle(models[0], models[1])

def load_model(file_path):
    classifier_f = open(file_path, "rb")
    classifier = pickle.load(classifier_f)
    classifier_f.close()
    return classifier


class EnsembleClassifier(ClassifierI):

    def __init__(self, *classifiers):
        self._classifiers = classifiers

    # returns the classification based on majority of votes
    def classify(self, features):
        votes = []
        for c in self._classifiers:
            v = c.classify(features)
            votes.append(v)
        return mode(votes)

    # a simple measurement the degree of confidence in the classification
    def confidence(self, features):
        votes = []
        for c in self._classifiers:
            v = c.classify(features)
            votes.append(v)

        choice_votes = votes.count(mode(votes))
        conf = choice_votes / len(votes)
        return conf




# Original Naive Bayes Classifier
ONB_Clf = load_model('pickled/ONB_clf.pickle')

# Multinomial Naive Bayes Classifier
MNB_Clf = load_model('pickled/MNB_clf.pickle')


# Bernoulli  Naive Bayes Classifier
BNB_Clf = load_model('pickled/BNB_clf.pickle')

# Logistic Regression Classifier
LogReg_Clf = load_model('pickled/LogReg_clf.pickle')

# Stochastic Gradient Descent Classifier
SGD_Clf = load_model('pickled/SGD_clf.pickle')



# Initializing the ensemble classifier
ensemble_clf = EnsembleClassifier(ONB_Clf, MNB_Clf, BNB_Clf, LogReg_Clf, SGD_Clf)
