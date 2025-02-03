import apache_beam as beam
import pandas as pd
import io
from apache_beam.io.gcp.gcsio import GcsIO
from apache_beam.options.pipeline_options import PipelineOptions
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
from utils import process_endpoint_url, get_project_id

def read_csv_from_gcs(input_file):
    file_content = GcsIO().open(input_file, 'r').read()
    return pd.read_csv(io.StringIO(file_content.decode('utf-8')))

def fetch_player_season_team(player_id):
    player_url = f'https://statsapi.mlb.com/api/v1/people/{player_id}/stats?stats=yearByYear'
    player_data = process_endpoint_url(player_url, "stats")
    if not player_data.empty:
        player_data = player_data.loc[0, 'splits']
        player_data_df = (
            pd.DataFrame(player_data)
            .drop_duplicates(subset=['season'], keep='first')
            .assign(
                player_id=player_id,
                team_id=lambda x: x['team'].apply(lambda y: y['id'] if isinstance(y, dict) and 'id' in y else None)
            )
            .filter(['player_id', 'team_id', 'season'])
        )
        return player_data_df
    return pd.DataFrame()

def fetch_games(season_team_serie):
    season = season_team_serie['season']
    team_id = season_team_serie['team_id']
    schedule_endpoint_url = f'https://statsapi.mlb.com/api/v1/schedule?sportId=1&season={season}'
    schedule_dates = process_endpoint_url(schedule_endpoint_url, "dates")
    if not schedule_dates.empty:
        games = (
            pd.json_normalize(schedule_dates.explode('games').reset_index(drop=True).loc[:, 'games'])
            .pipe(lambda df: df[df['gameType'] == 'R'])
            .pipe(lambda df: df[df['teams.away.team.id'].isin(team_id) | df['teams.home.team.id'].isin(team_id)])
            .filter(['gamePk', 'gameGuid', 'season', 'teams.away.team.id', 'teams.home.team.id'])
        )
        return games
    return pd.DataFrame()

def process_data(input_file, output_file, project_id):
    with beam.Pipeline(options=PipelineOptions(project=project_id)) as pipeline:
        input_data = (
            pipeline
            | 'Read Input Data' >> beam.Create([input_file])
            | 'Read CSV from GCS' >> beam.Map(read_csv_from_gcs)
        )
        player_season_team = (
            input_data
            | 'Fetch Player Season Team' >> beam.FlatMap(lambda df: [fetch_player_season_team(pid) for pid in df['player_id'].tolist()])
        )
        games_data = (
            player_season_team
            | 'Fetch Games' >> beam.FlatMap(fetch_games)
        )
        games_data | 'Write Output Data' >> beam.Map(lambda df: df.to_csv(output_file, index=False))

def main():
    input_file = 'gs://mlb-clutch-collision/processed_data/mlb_top_players_id.csv'
    output_file = 'gs://mlb-clutch-collision/processed_data/mlb_top_players_plays.csv'
    project_id = get_project_id()
    process_data(input_file, output_file, project_id)

if __name__ == '__main__':
    main()