# mlb-clutch-collision

Requirements
- Install CLI Google Cloud [Follow the steps](https://cloud.google.com/sdk/docs/install?hl=es-419#deb)


First steps with google cloud

Auth y base config (fill "your-project-name"): 
```bash
gcloud auth login
gcloud projects [your-project-name] --set-as-default
PROJECT_ID=$(gcloud config get-value project)
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
```

Habilitar APIs

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
```

Create secret in Secret Manager and manager auth
```bash
BUCKET=$(echo $PROJECT_ID)
echo -n $BUCKET | gcloud secrets create BUCKET \      
    --replication-policy="automatic"
gcloud secrets add-iam-policy-binding BUCKET \
    --member="serviceAccount:$SA_DEV_EMAIL" \
    --role="roles/secretmanager.secretAccessor"
```

Create a key file for Service Account

gcloud iam service-accounts keys create key.json \
    --iam-account=$SA_DEV_EMAIL
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/key.json"