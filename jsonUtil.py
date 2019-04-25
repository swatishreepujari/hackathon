import json
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords  # to get a list of stopwords
from collections import Counter
from sentiment import Sentiment

class JsonUtil():

    def __init__(self, jsonData):
        self.jsonData = jsonData
        self.textSet = set()
        self.text_dict={}
        self. quotes_dict = {}


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

    def getText(self):
        sentDataList = []
        for item in self.jsonData:
            textSet = set()
            if(self.quotes_dict.keys().__contains__(item['dt'])):
                pass
            else:
                self.quotes_dict[item['dt']] = item['quote']

            if (self.text_dict.keys().__contains__(item['dt'])):
                textSet = self.text_dict[item['dt']]
                textSet.add(item['data']['t'])
                self.text_dict[item['dt']] = textSet
            else:
                textSet.add(item['data']['t'])
                self.text_dict[item['dt']] = textSet
        for k,v in self.text_dict.items():
            quotes = self.quotes_dict[k]
            sentiData = Sentiment(k,v,quotes)
            sentDataList.append(sentiData)

        return sentDataList






















