
import requests
for x in range(200):
  resp = requests.post('http://localhost:8080/terms/person%d/person' % x)
  print(resp)

for x in range(1000):
  resp = requests.post('http://localhost:8080/terms/doc%d/document' % x)
  print(resp, resp.content)

for x in range(10):
  resp = requests.post('http://localhost:8080/terms/context%d/context' % x)
  print(resp, resp.content)

for x in range(10):
  resp = requests.post('http://localhost:8080/facts/(is-assigned wf1, to document, in context%d)' % x)
  print(resp, resp.content)

for x in range(1000):
  if (x+1) % 10 == 0:
    resp = requests.post('http://localhost:8080/facts/(located doc%d, in context0)' % x)
    print(resp, resp.content)

for y in range(9):
  for x in range(1000):
    if (x+2+y) % 10 == 0:
      resp = requests.post('http://localhost:8080/facts/(located doc%d, in context%d)' % (x, y+1))
      print(resp, resp.content)

for x in range(1000):
    resp = requests.post('http://localhost:8080/facts/(has-status doc%d,which private)' % x)
    print(resp, resp.content)

import random
def get_role():
    roles = ('visitor', 'editor', 'reviewer', 'manager')
    weights = (10, 6, 3, 1)
    rnd = random.random() * sum(weights)
    for i, w in enumerate(weights):
        rnd -= w
        if rnd < 0:
            return roles[i]

for x in range(10):
  for y in range(200):
    if (x+y) % 10 == 0:
      resp = requests.post('http://localhost:8080/facts/(has-role person%d, which %s, where context%d)' % (y, get_role(), x))

