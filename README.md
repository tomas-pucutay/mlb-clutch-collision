# MLB Clutch Collision

![Main photo](https://raw.githubusercontent.com/tomas-pucutay/mlb-clutch-collision/refs/heads/main/frontend/src/assets/MLB_Clutch_Collision.jpg)

This repo is for Google MLB hackaton Challenge: Wildcard - Enhance fan experience.

### Summary
Ever wondered who’d win if two MLB teams that never faced off clashed? With cutting-edge data, we simulate thrilling matchups to spark engagement, excitement, and fan interaction. Play the what-ifs!

**Project architecture**
![architecture](https://raw.githubusercontent.com/tomas-pucutay/mlb-clutch-collision/refs/heads/main/media/Architecture.png)

### Quick overview.
The app lets you pit players who may have never faced off on the field against each other, creating a narrative with baseball commentator-style audio, and it supports multiple languages. For those hungry for curiosity and seeking ultra-personalized experiences.
To achieve this there are some steps to follow.
- Model to predict: The side of arquitecture for ingestion
- Google resources: The resources such as Google TTS and Gemini.
- Client-server architecture: To let the user interact.


# Quick steps to reproduce
If you don't want to read too much you can start with this quick steps to reproduce

### Download repo
```bash
git clone https://github.com/tomas-pucutay/mlb-clutch-collision.git
```
### To deploy server:

Steps in Google Cloud:
- Be sure to have a Google Cloud account
- Create a service account, get the key.json
- Enable APIs: texttospeech and aiplatform

Steps in terminal (from root folder):
```bash
cd backend
python -m venv .venv
source .venv/bin/activate # .venv/Scripts/activate for Windows
pip install -r requirements.txt
cd ../
cp [path-to-your-key.json] ./[key].json
export GOOGLE_APPLICATION_CREDENTIALS="[key].json"
python backend/server.py
```

### To deploy client:
Steps in terminal (from root folder):
```bash
cd frontend
npm install
npm start
```
*If it doesn't work, check frontend/src/pages/Match.js and change the URLs XXX.XXX.XXX.XXX:5000 to localhost:5000

# Complete step-by-step

### Requirements
- Install CLI Google Cloud [Follow the steps](https://cloud.google.com/sdk/docs/install?hl=es-419#deb)
- Python 3.10 or better
- NodeJS 18 or better

## To model deployment

Auth y base config in google cloud (fill "your-project-name"): 
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

Download repo and explore file structure
```bash
git clone https://github.com/tomas-pucutay/mlb-clutch-collision.git
```
1. backend: Connection to Google resources
2. frontend: Webapp for user
3. notebooks: All the procceses before using Google Cloud services.
4. services: Scripts for cloud functions, dataflow, bigquery, vertexai

## Folders
- Services - is the folder for the ingestion:
You will find many scripts and steps
- Notebooks - up to you, to execute from 1 to 7:
In order to reproduce all the steps in the data.
NOTICE: The purpose of this folder was not to make a perfect model but at least a proof-of-concept, the model can be improved a lot.
- Backend: It has a batch prediction from model in data. And scripts to use Google TTS and Gemini through APIS. It was deployed on Google Compute Engine.
- Frontend: With React and Javascript, it has the 2 main pages - Home and Match, it uses the APIs to enhance the experience to the final user. Deployed in Google Cloun Run