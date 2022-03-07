from elasticsearch7 import Elasticsearch
import requests
 
r = requests.get("https://api.github.com/repos/elastic/beats/issues")
es = Elasticsearch([{'host': 'localhost', 'port': 9200}])
 
for doc in r.json():
	res = es.index(index="github-beat-issues", document=doc)



# import json
# from datetime import datetime
# from xml.dom.minidom import Document
# from elasticsearch7 import Elasticsearch
# import requests

# es = Elasticsearch([{'host': 'localhost', 'port': 9200}])

# doc = {
#     'author': 'author_name',
#     'text': 'Interensting content...',
#     'timestamp': datetime.now(),
# }
# resp = es.index(index="test-index", id=1, document=doc)
# print(resp['result'])

# r = requests.get('http://localhost:9200') 
# i = 18
# while r.status_code == 200:
#     r = requests.get('http://swapi.co/api/people/'+ str(i))
#     # es.index(index='sw', doc_type='people', id=i, body=json.loads(r.content))
#     i=i+1
#     print(r)
# print(i)


# r = requests.get("https://api.github.com/repos/elastic/elasticsearch/issues")
# es = Elasticsearch([{'host': 'localhost', 'port': 9200}])

# from doc in r.json():
#     res = es.index(index="github-es-issues", document=doc)