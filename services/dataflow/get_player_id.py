import apache_beam as beam
import pandas as pd
import io
from unidecode import unidecode
from apache_beam.io import ReadFromText, WriteToText
from apache_beam.io.gcp.gcsio import GcsIO
from apache_beam.options.pipeline_options import PipelineOptions
from utils import process_endpoint_url, get_project_id

def fetch_players_from_seasons(season: str):
    """Fetch players from MLB stats API for a given season."""
    seasons_url = f'https://statsapi.mlb.com/api/v1/sports/1/players?season={season}'
    player_seasons = process_endpoint_url(seasons_url, "people")
    
    if not player_seasons.empty:
        return player_seasons
    return pd.DataFrame()

def merge_data(top_players_df, all_players_df):
    """Merge top players data with player details."""
    top_players_df = (
        top_players_df
        .merge(all_players_df, left_on='player', right_on='fullName_std', how='left')
        .pipe(lambda df: df.loc[df.groupby(['top_source', 'player'])['player_id'].idxmin().dropna().astype(int)])
        .sort_values(by=['top_idx'])
        .groupby('top_source')
        .head(20)
        .astype({'player_id': 'Int32'})
        .filter(items=['player_id', 'top_idx', 'top_source', 'fullName'])
    )
    return top_players_df

def read_csv_from_gcs(input_file):
    file_content = GcsIO().open(input_file, 'r').read()
    return pd.read_csv(io.StringIO(file_content.decode('utf-8')))

def write_to_gcs(output_file, data):
    with GcsIO().open(output_file, 'w') as f:
        data.to_csv(f, index=False)

def process_data(input_file, output_file, project_id):
    with beam.Pipeline(options=PipelineOptions(project=project_id)) as pipeline:
        input_data = (
            pipeline
            | 'Read Input Data' >> beam.Create([input_file])
            | 'Read CSV from GCS' >> beam.Map(read_csv_from_gcs)
        )
        
        enriched_data = (
            input_data
            | 'Fetch Players from Seasons' >> beam.Map(lambda df: fetch_players_from_seasons(df))
            | 'Merge Data' >> beam.Map(lambda df: merge_data(df, df))
        )
        
        enriched_data | 'Write Output Data' >> beam.Map(lambda df: write_to_gcs(output_file, df))

def main():
    input_file = 'gs://mlb-clutch-collision/raw_data/mlb_top_players.csv'
    output_file = 'gs://mlb-clutch-collision/processed_data/mlb_top_players_id.csv'
    project_id = get_project_id()
    
    process_data(input_file, output_file, project_id)

if __name__ == '__main__':
    main()