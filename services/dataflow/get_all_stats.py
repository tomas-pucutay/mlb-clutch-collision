import apache_beam as beam
import pandas as pd
import numpy as np
import io
from apache_beam.io.gcp.gcsio import GcsIO
from apache_beam.options.pipeline_options import PipelineOptions
from concurrent.futures import ThreadPoolExecutor
from utils import process_endpoint_url, get_project_id

def read_csv_from_gcs(input_file):
    file_content = GcsIO().open(input_file, 'r').read()
    return pd.read_csv(io.StringIO(file_content.decode('utf-8')))

def fetch_player_stats(player_id):
    base_stats = [
        'airOuts', 'atBats', 'balks', 'baseOnBalls', 'battersFaced',
        'blownSaves', 'catchersInterference', 'caughtStealing',
        'completeGames', 'doubles', 'earnedRuns', 'gamesFinished',
        'gamesPitched', 'gamesPlayed', 'gamesStarted', 'groundIntoDoublePlay',
        'groundOuts', 'hitBatsmen', 'hitByPitch', 'hits', 'holds', 'homeRuns',
        'inheritedRunners', 'inheritedRunnersScored', 'inningsPitched',
        'intentionalWalks', 'leftOnBase', 'losses', 'numberOfPitches', 'outs',
        'pickoffs', 'plateAppearances', 'rbi', 'runs', 'sacBunts', 'sacFlies',
        'saveOpportunities', 'saves', 'shutouts', 'stolenBases', 'strikeOuts',
        'strikes', 'totalBases', 'triples', 'wildPitches', 'wins'
    ]
    base_season_stats = ['season', 'player_id'] + base_stats

    player_url = f'https://statsapi.mlb.com/api/v1/people/{player_id}/stats?stats=yearByYear'
    player_data = process_endpoint_url(player_url, "stats")
    player_stats_df = pd.DataFrame(columns=base_season_stats)

    if not player_data.empty:
        player_data = player_data.loc[0, 'splits']
        for p in player_data:
            p_dict = {**{'season': p['season'], 'player_id': p['player']['id']}, **p['stat']}
            p_dict_filtered = {k: v for k, v in p_dict.items() if k in base_season_stats}
            p_data = pd.DataFrame(p_dict_filtered, index=[0])
            player_stats_df = pd.concat([player_stats_df, p_data], ignore_index=True)
        
        player_stats_df.iloc[:, 2:] = player_stats_df.iloc[:, 2:].cumsum()
        player_stats_df = player_stats_df.assign(
            singles=player_stats_df['hits'] - player_stats_df['doubles'] - player_stats_df['triples'] - player_stats_df['homeRuns'],
            ops=player_stats_df['obp'] + player_stats_df['slg']
        )
    
    return player_stats_df

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
        
        player_ids = (
            input_data
            | 'Extract Player IDs' >> beam.Map(lambda df: list(set(df['batter_id'].tolist() + df['pitcher_id'].tolist())))
        )
        
        player_stats = (
            player_ids
            | 'Fetch Player Stats' >> beam.FlatMap(lambda ids: [fetch_player_stats(pid) for pid in ids])
        )
        
        player_stats | 'Write Output Data' >> beam.Map(lambda df: write_to_gcs(output_file, df))

def main():
    input_file = 'gs://mlb-clutch-collision/processed_data/mlb_top_players_plays.csv'
    output_file = 'gs://mlb-clutch-collision/processed_data/all_player_stats.csv'
    project_id = get_project_id()
    
    process_data(input_file, output_file, project_id)

if __name__ == '__main__':
    main()