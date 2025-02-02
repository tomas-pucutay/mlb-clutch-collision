gcloud functions deploy scrape_mlb_data \
  --runtime python310 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point scrape_mlb_data