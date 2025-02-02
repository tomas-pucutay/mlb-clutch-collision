import pandas as pd
import requests
from bs4 import BeautifulSoup
from google.cloud import storage
import functions_framework
import os
import sys

from .secrets import get_secret, get_project_id

BUCKET_NAME = get_secret('BUCKET', get_project_id())
FILE_NAME = "mlb_top_players.csv"

def get_player_data(url, tag):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 '
                      '(KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error al hacer la solicitud: {e}")
        return pd.DataFrame()

    try:
        soup = BeautifulSoup(response.text, "html.parser")
        table = soup.find("table")
        if not table:
            print("Table not found.")
            return pd.DataFrame()

        rows = table.find_all("tr")
        row_detail = [row.find_all("td") for row in rows]

        player_list = [
            a_tag.text.strip()
            for row in row_detail
            if len(row) > 1 and (a_tag := row[1].find("a")) and a_tag.text.strip()
        ]

        return pd.DataFrame({
            'top_idx': range(1, len(player_list) + 1),
            'top_source': tag,
            'player': player_list,
        })

    except Exception as e:
        print(f"Error processing page: {e}")
        return pd.DataFrame()

@functions_framework.http
def scrape_mlb_data(request):
    """Cloud Function for web scraping and save in Cloud Storage."""

    urls = {
        "b2024": "https://www.espn.com/mlb/history/leaders/_/breakdown/season/year/2024",
        "bhist": "https://www.espn.com/mlb/history/leaders/_/sort/avg",
        "p2024": "https://www.espn.com/mlb/history/leaders/_/type/pitching/breakdown/season/year/2024/sort/ERA",
        "phist": "https://www.espn.com/mlb/history/leaders/_/type/pitching"
    }

    all_players = pd.concat([get_player_data(url, tag) for tag, url in urls.items()], ignore_index=True)

    local_file = f"/tmp/{FILE_NAME}"
    all_players.to_csv(local_file, index=False)
    
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(FILE_NAME)
    blob.upload_from_filename(local_file)
    
    return f"Datos guardados en gs://{BUCKET_NAME}/{FILE_NAME}"