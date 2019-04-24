import os
from nsepy import get_history
from datetime import datetime
import json

from Crawler.quote import Quote

BASE_PATH="/home/vizdata/Documents/data"

def getQuote(symbol, start):
    dt =  datetime.strptime(start, "%d/%B/%Y").date()
    quote_json = get_history(symbol=symbol, start=dt, end=dt).to_dict()
    #quote_json = quoteData.to_dict()
    quote = Quote(str(start),
                  quote_json['Open'][dt],
                  quote_json['High'][dt],
                  quote_json['Low'][dt],
                  quote_json['Close'][dt],
                  quote_json['Volume'][dt])

    return quote


#each tag has separate directory
def create_crawl_directory(dirName):
    if not os.path.exists(BASE_PATH+"/"+dirName):
        print("Creating directory "+  dirName)
        os.makedirs(BASE_PATH+"/"+dirName)

# create data files
def create_data_files(tagName, data):
    fileName = BASE_PATH+"/"+tagName+"/"+"data.txt"
    if os.path.isfile(fileName):
        write_to_file(fileName,data)

# Create a new file
def write_to_file(fileName, data):
    with open(fileName, 'w') as f:
        f.write(data)

