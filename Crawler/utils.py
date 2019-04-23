import os

BASE_PATH="/home/vizdata/Documents/data"

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




