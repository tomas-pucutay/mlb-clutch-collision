# For get_player_id.py
python get_player_id.py \                                    
  --project=mlb-clutch-collision \
  --runner=DataflowRunner \
  --region=us-central1 \
  --temp_location=gs://mlb-clutch-collision/temp/ \
  --staging_location=gs://mlb-clutch-collision/staging/ \
  --worker_machine_type=n1-standard-1

# For get_player_plays.py
python get_player_plays.py \                                    
  --project=mlb-clutch-collision \
  --runner=DataflowRunner \
  --region=us-central1 \
  --temp_location=gs://mlb-clutch-collision/temp/ \
  --staging_location=gs://mlb-clutch-collision/staging/ \
  --worker_machine_type=n1-standard-1

# For get_all_stats.py
python get_all_stats.py \                                    
  --project=mlb-clutch-collision \
  --runner=DataflowRunner \
  --region=us-central1 \
  --temp_location=gs://mlb-clutch-collision/temp/ \
  --staging_location=gs://mlb-clutch-collision/staging/ \
  --worker_machine_type=n1-standard-1