from html.parser import HTMLParser
from urllib.request import Request, urlopen
from urllib import parse
from Crawler.items import Items
import json



class LinkFinder(HTMLParser):

    def __init__(self, stocks, baseUrl):
        super().__init__()
        self.keyword_list = stocks
        self.base_url = baseUrl
        #self.dt = dt
        self.recording = 0
        self.itemSet = set()
        #self.links = set()

    # When we call HTMLParser feed() this function is called when it encounters an opening tag <a>
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            for(attr, value) in attrs:
                if attr == 'href':
                    self.recording = 1
                    self.link = 'http://'+self.base_url+value


    def handle_endtag(self, tag):
        if tag == 'a':
            self.recording -= 1

    def handle_data(self, data):
        if self.recording:
            for word in self.keyword_list:
                if word in data.lower():
                    item = Items(word,self.link,data)
                    #print(data)
                    self.itemSet.add(item)

    def getItems(self):
        return self.itemSet

