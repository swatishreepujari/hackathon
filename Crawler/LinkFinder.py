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

#finder = LinkFinder()
#url = "https://economictimes.indiatimes.com/archivelist/year-2019,month-4,starttime-43567.cms"
#request = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
#html = urlopen(request).read()
#print(html.decode('utf-8'))
#finder.feed(html.decode('utf-8'))
#finder.feed('<HTML><HEAD><TITLE>Your Title Here</TITLE></HEAD><BODY BGCOLOR="FFFFFF"><CENTER><IMG SRC="clouds.jpg" ALIGN="BOTTOM"> </CENTER><HR><a href="http://somegreatsite.com">Infosys Q4 result impressive</a>is a link to another nifty site<H1>This is a Header</H1><H2>This is a Medium Header</H2>Send meail at <a href="mailto:support@yourcompany.com">support@tcs.com</a><P> This is a new paragraph!<P> <B>This is a new paragraph!</B><BR> <B><I>This is a new sentence without a paragraph break, in bold italics.</I></B><HR></BODY></HTML> ')
#print(finder.itemSet)
#for item in finder.itemSet:
#    print(json.dumps(item.__dict__))

#finder.close()




