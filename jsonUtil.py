import json
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords  # to get a list of stopwords
from collections import Counter

class JsonUtil():

    def __init__(self, jsonData):
        self.jsonData = jsonData
        self.textSet = set()

    def getWordCloudData(self):
        for item in self.jsonData:
            res = json.loads(item['data'])
            print(type(res))
            print(res)
            for text in item['data']:
                print(type(text))
                self.textSet.add(text["t"])
        words=[]
        for description in self.textSet:
            tokens = word_tokenize(description)
            words.extend(tokens)
        stop_words = set(stopwords.words('english'))
        words = [word for word in words if word not in stop_words and len(word) > 2]
        words_freq = Counter(words)
        print(words_freq)
        words_json = [{'text': word, 'weight': count} for word, count in words_freq.items()]
        return words_json












