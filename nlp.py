from nltk.classify import ClassifierI
from statistics import mode
import pickle
from nltk import word_tokenize


def load_model(file_path):
    classifier_f = open(file_path, "rb")
    classifier = pickle.load(classifier_f)
    classifier_f.close()
    return classifier

def sentiment(text):
    ensemble_model = getClassifier()
    word_features = load_model('pickled/word_features5k.pickle')
    #print("debug5:"+str(len(word_features)))
    words = word_tokenize(text)
    #print(str(words))
    features = {}
    for w in word_features:
        features[w] = (w in words)
    filtered_dict = {k: v for k, v in features.items() if k == True}
    return ensemble_model.classify(features), ensemble_model.confidence(features), filtered_dict


def getClassifier():
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
    return ensemble_clf

class NLP():

    def __init__(self):
        pass

    def getScore(self,s):
        (dt, sentences)= s.get_date(), s.get_text()
        sent_data_list = []
        for sent in sentences:
            #print(sent)
            (senti, polarity, features) = sentiment(sent)
            sent_data = {"dt": dt,"qt":s.get_quotes(), "text": sent, "score": senti, "confi":polarity, "feature":features}
            sent_data_list.append(sent_data)
        return sent_data_list
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




