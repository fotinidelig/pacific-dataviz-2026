"""
This script gets all the dataflowIDs of all existing dataflows in the Pacific Data Hub .Stat API
"""
import requests
from bs4 import BeautifulSoup

base_url = 'https://stats-nsi-stable.pacificdata.org/rest/'

def get_endpoints(base_url):
  """
  Get the dataflowIDs of all existing dataflows in PDH .Stat API
        :param base_url: the API's base URL
        :return: list of strings
  """
  endpoints = []
  resources_url = base_url + 'dataflow/all/all/latest?detail=full'
  resp = requests.get(resources_url, verify=False)
  soup = BeautifulSoup(resp.text, 'xml')
  for name in soup.findAll('Dataflow'):
    endpoints.append(name['id'])
  return endpoints

df_ids = get_endpoints(base_url)
print(df_ids)