from flask import Flask, render_template, json, jsonify,request
import os
from urllib.request import Request, urlopen

from jsonUtil import JsonUtil
from Crawler.LinkFinder import LinkFinder
from Crawler.finalData import FinalData,ComplexEncoder

SITE_ROOT = os.path.realpath(os.path.dirname(__file__))

app = Flask(__name__)

@app.route('/')
def index():
    data = readConfig()
    return render_template("index.html", data=data)


@app.route('/crawler')
def crawler():
    config_data = os.path.join(SITE_ROOT, "config", "config.json")
    data = json.load(open(config_data))
    return render_template("crawler.html",data=data)


def buildFinalItems(dt,item):
    return FinalData(dt,item)


def getJsonFileName(final):
    keyWord = final.get_item().get_keyWord()
    file =  os.path.join(SITE_ROOT, "data", keyWord+".json")
    if os.path.exists(file):
        return file
    else:
        with open(file, 'w'):
            pass
        return file


def writeToJsonFile(newContent, jsonFileName):
    print("debug 1")
    if os.stat(jsonFileName).st_size > 0:
        with open(jsonFileName, 'r') as f:
            file_data = json.load(f)
            #print(file_data)
            print("debug 2")
        f.close()
        print(len(file_data))
        json_content=[]

        for content in file_data:
            json_content.append(content)
        json_content.append(newContent.reprJSON())

        with open(jsonFileName, 'w') as json_file:
            json.dump(json_content, json_file)
        json_file.close()
    else:
        print("debug 3")
        with open(jsonFileName, 'w') as json_file:
            json.dump([newContent.reprJSON()], json_file)
        json_file.close()

@app.route('/crawlData', methods=['GET', 'POST'])
def crawlData():
    print("Crawler activated..")
    dt = request.args['dt']
    stocks = request.args.getlist('stocks[]')
    print(stocks)
    sources = request.args.getlist('sources[]')
    print(sources)
    finalItems = []

    for source in sources:
        finder = LinkFinder(stocks,source)
        url = buildUrl(source)
        httpRequest = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urlopen(httpRequest).read()
        finder.feed(html.decode('utf-8'))
        #print(finder.getItems())
        print("Items: "+str(len(finder.getItems())))
        for item in finder.getItems():
            finalItem = buildFinalItems(dt,item)
            #print(json.dumps(item.__dict__))
            finalItems.append(finalItem)
        finder.close()
        print("final: " + str(len(finalItems)))
        result=[]
        for final in finalItems:
            jsonFileName = getJsonFileName(final)
            writeToJsonFile(final,jsonFileName)
            result.append(json.dumps(final.reprJSON()))
        #print(json.dumps(result.__dict__))

    return jsonify(result=result)

def buildUrl(url):
    return "https://economictimes.indiatimes.com/archivelist/year-2019,month-4,starttime-43567.cms"

@app.route('/getData', methods=['GET', 'POST'])
def getData():
    print("received....")
    #print(request)
    name = request.args['name']
    print(name)
    data_file = os.path.join(SITE_ROOT, "data", name+".json")
    data = json.load(open(data_file))
    jsonUtil = JsonUtil(data)
    wordCloud = jsonUtil.getWordCloudData()
    #print(jsonify(result=wordCloud))
    return jsonify(result=wordCloud)

@app.route('/wordCloud', methods=['GET'])
def wordCloud():
    data=u'[{"text":"police","weight":5},{"text":"parents","weight":3},{"text":"policekil","weight":8},{"text":"parents66","weight":7},{"text":"policedfd","weight":5},{"text":"parentsgg","weight":3},{"text":"police5","weight":8},{"text":"parents4","weight":7}]'
    print(data)
    return data




def readConfig():
    config_data = os.path.join(SITE_ROOT, "config", "config.json")
    data = json.load(open(config_data))
    return data

if __name__ =="__main__":
    app.run(debug=True)


