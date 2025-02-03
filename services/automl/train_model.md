In Vertex AI > Datasets
Click dataset and Train ML > AutoML on pipelines

Configurations:
- Process details: Default values
- Runtime environment: Bucket as output directory.
- Training method:
  - Objective: Clasification
  - Col Objective: event_type
  - Model name: 20250202_mlb_event
  - Advanced: Stratified with event_type 70/20/10
- Training options:
  - Advanced: Optimization objective AUC PRC