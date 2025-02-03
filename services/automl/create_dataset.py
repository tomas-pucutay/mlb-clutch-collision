from google.cloud import aiplatform
from utils import get_project_id

project_id = get_project_id
dataset_name = "mlb_event_predict"
database = "MLB"
table = "merged_data"

aiplatform.init(project=project_id, location="us-central1")

dataset = aiplatform.TabularDataset.create(
    display_name=dataset_name,
    bq_source="bq://{project_id}.{database}.{table}",
)