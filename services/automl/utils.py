import os
import json

def get_project_id():
    current_dir = os.path.dirname(os.path.realpath(__file__))
    config_path = os.path.join(current_dir, 'config.json')
    
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"config.json doesn't exists: {config_path}")
    
    with open(config_path, 'r') as file:
        config = json.load(file)
        project_id = config.get('PROJECT_ID')
        
        if project_id is None:
            raise ValueError("'PROJECT_ID' not found in config.json.")
        
    return project_id