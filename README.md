# mlb-clutch-collision

Requirements
- Install CLI Google Cloud [Follow the steps](https://cloud.google.com/sdk/docs/install?hl=es-419#deb)


First steps with google cloud

Auth y base config (fill "your-project-name"): 
```bash
gcloud auth login
gcloud projects [your-project-name] --set-as-default
PROJECT_ID=$(gcloud config get-value project)
echo "{\"PROJECT_ID\": \"$(gcloud config get-value project)\"}" > config.json 
```

Create service account and add IAM roles
```bash
gcloud iam service-accounts create sa-developer \
    --display-name "Developer Service Account"
SA_DEV_EMAIL=$(gcloud iam service-accounts list \
    --filter="displayName:Developer Service Account" \
    --format="value(email)")
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_DEV_EMAIL" \
    --role="roles/secretmanager.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_DEV_EMAIL" \
    --role="roles/storage.objectAdmin"
# For Dataflow
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_DEV_EMAIL" \
    --role="roles/storage.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_DEV_EMAIL" \
    --role="roles/dataflow.admin"
# General
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_DEV_EMAIL" \
    --role="roles/editor"
```

Enable APIs

```bash
# Secret manager
gcloud services enable secretmanager.googleapis.com
# Vertex AI
gcloud services enable storage-component.googleapis.com
gcloud services enable dataplex.googleapis.com
gcloud services enable dataform.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable datacatalog.googleapis.com
gcloud services enable visionai.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable notebooks.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable dataflow.googleapis.com
# Cloud functions
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
# Text to speech
gcloud services enable texttospeech.googleapis.com
```

Create secret in Secret Manager and manager auth
```bash
BUCKET=$(gcloud config get-value project)
echo -n $BUCKET | gcloud secrets create BUCKET \      
    --replication-policy="automatic"
echo -n $BUCKET | gcloud secrets versions add BUCKET --data-file=-
gcloud secrets add-iam-policy-binding BUCKET \
    --member="serviceAccount:$SA_DEV_EMAIL" \
    --role="roles/secretmanager.secretAccessor"
```

Create a key file for Service Account

```bash
gcloud iam service-accounts keys create key.json \
    --iam-account=$SA_DEV_EMAIL
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/key.json"
```

Create bucket
```bash
gsutil mb -l us-central1 gs://$(echo $PROJECT_ID)/
```

Create file structure

mlb-clutch-collision
 |--frontend
 |--services
     |--automl
     |--bigquery
     |--dataflow
     |--functions
 |--config.json


Ingestion

Get Top players

Execute Functions
- Copy file from config.json to services/functions/config.json
- Copy file from services/utils/secrets.py to services/functions/secrets.py
- Modify services/utils/secrets.py to reference the current directory
- Add authorization to google cloud functions service account
```bash
gcloud secrets add-iam-policy-binding BUCKET \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.admin"
```
- Deploy with the command in services/functions/command.sh

Create a dataset for prediction

Execute pipelines
- Copy file from config.json to services/functions/config.json
- Add authorization to dataflow topics
```bash
gcloud secrets add-iam-policy-binding BUCKET \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/storage.admin"
gcloud secrets add-iam-policy-binding BUCKET \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/dataflow.admin"
gcloud secrets add-iam-policy-binding BUCKET \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/editor"
```
- Execute each of the commands in commands.sh

Transfer data to BigQuery

- Create a BD and table in BigQuery
- Load CSV into BigQuery.
```bash
gcloud alpha bq datasets create [DATASET_ID] --project=$PROJECT_ID
bq load --source_format=CSV --autodetect --skip_leading_rows=1 $PROJECT_ID:[DATASET_ID].[TABLE_ID] [gs-URI]
```
- Follow the model of the command in services/bigquery/command.sh

Training



Virtual Machine (Backend)

Create a virtual machine in Google Cloud
Zone: us-central1-c. Machine Type

Configure Static IP
Enter to (nic0) from External IP > IP addreses > Promote to static in external. Copy IP

Configure Firewall
Side panel Cloud NGFW > Firewall politics
Create a new rule (Inbound) with origin 0.0.0.0/0, protocol TCP: 80,443

Inside SSH
Install python3.11-venv python-is-python3
Clone repository [backend]
Create virtual environment and install dependencies
Copy service account credentials and add to GOOGLE_APPLICATION_CREDENTIALS

e.g. 34.71.143.77

