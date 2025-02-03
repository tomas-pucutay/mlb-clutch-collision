import apache_beam as beam
import pandas as pd
import io
from apache_beam.io.gcp.gcsio import GcsIO
from apache_beam.options.pipeline_options import PipelineOptions

def read_csv_from_gcs(input_file):
    file_content = GcsIO().open(input_file, 'r').read()
    return pd.read_csv(io.StringIO(file_content.decode('utf-8')))

def write_to_gcs(output_file, data):
    with GcsIO().open(output_file, 'w') as f:
        data.to_csv(f, index=False)

def process_data(all_player_stats_df, top_players_plays_df):
    valid_ids = set(all_player_stats_df['player_id'])
    filtered_plays = top_players_plays_df[
        (top_players_plays_df['batter_id'].isin(valid_ids)) & 
        (top_players_plays_df['pitcher_id'].isin(valid_ids))
    ]

    batter_stats = all_player_stats_df.copy().add_prefix("b_")
    pitcher_stats = all_player_stats_df.copy().add_prefix("p_")

    batter_stats = batter_stats.rename(columns={'b_player_id': 'batter_id', 'b_season': 'season'})
    pitcher_stats = pitcher_stats.rename(columns={'p_player_id': 'pitcher_id', 'p_season': 'season'})

    merged_data = (
        filtered_plays
        .filter([
            'season', 'batter_id', 'pitcher_id', 
            'event_type', 'vs_RHB', 'vs_LHB', 
            'vs_SHB', 'vs_RHP', 'vs_LHP'
        ])
        .merge(batter_stats, on=['season', 'batter_id'], how='left')
        .merge(pitcher_stats, on=['season', 'pitcher_id'], how='left')
    )

    null_percentage = merged_data.isnull().mean() * 100
    merged_data = merged_data.loc[:, null_percentage <= 65]


    merged_data = merged_data.drop(columns=['batter_id', 'pitcher_id', 'season'])
    
    return merged_data

def run_pipeline(input_all_player_stats, input_top_players_plays, output_file, project_id):
    options = PipelineOptions(project=project_id)
    
    with beam.Pipeline(options=options) as pipeline:

        all_player_stats_data = (
            pipeline
            | 'Read All Player Stats' >> beam.Create([input_all_player_stats])
            | 'Read All Player Stats CSV' >> beam.Map(read_csv_from_gcs)
        )

        top_players_plays_data = (
            pipeline
            | 'Read Top Players Plays' >> beam.Create([input_top_players_plays])
            | 'Read Top Players Plays CSV' >> beam.Map(read_csv_from_gcs)
        )

        merged_data = (
            {
                'all_player_stats': all_player_stats_data,
                'top_players_plays': top_players_plays_data
            }
            | 'CoGroupByKey' >> beam.CoGroupByKey()
            | 'Merge Data' >> beam.Map(lambda data: process_data(data['all_player_stats'], data['top_players_plays']))
        )

        merged_data | 'Write Output Data' >> beam.Map(lambda df: write_to_gcs(output_file, df))

def main():
    input_all_player_stats = 'gs://mlb-clutch-collision/processed_data/all_player_stats.csv'
    input_top_players_plays = 'gs://mlb-clutch-collision/processed_data/mlb_top_players_plays.csv'
    output_file = 'gs://mlb-clutch-collision/processed_data/all_plays_merged_data.csv'
    project_id = 'your-gcp-project-id'
    
    run_pipeline(input_all_player_stats, input_top_players_plays, output_file, project_id)

if __name__ == '__main__':
    main()