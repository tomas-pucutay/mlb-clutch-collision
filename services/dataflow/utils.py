import json
import os
import requests
import pandas as pd
from google.cloud import secretmanager

# Function to Process Results from Various MLB Stats API Endpoints
# Provided by the Google Colab from MLB Hackaton

def process_endpoint_url(endpoint_url, pop_key=None):
  """
  Fetches data from a URL, parses JSON, and optionally pops a key.

  Args:
    endpoint_url: The URL to fetch data from.
    pop_key: The key to pop from the JSON data (optional, defaults to None).

  Returns:
    A pandas DataFrame containing the processed data
  """
  json_result = requests.get(endpoint_url).content

  data = json.loads(json_result)

   # if pop_key is provided, pop key and normalize nested fields
  if pop_key:
    df_result = pd.json_normalize(data.pop(pop_key), sep = '_')
  # if pop_key is not provided, normalize entire json
  else:
    df_result = pd.json_normalize(data)

  return df_result

def get_project_id():
    current_dir = os.path.dirname(os.path.realpath(__file__))
    config_path = os.path.join(current_dir, 'config.json')
    
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"config.json doesn't exists: {config_path}")
    
    with open(config_path, 'r') as file:
        config = json.load(file)
        project_id = config.get('PROJECT_ID')
        
        if project_id is None:
            raise ValueError("'PROJECT_ID' not found in config.json.")
        
    return project_id