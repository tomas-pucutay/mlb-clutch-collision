import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from services.utils import get_project_id, get_secret

response = get_secret('BUCKET', get_project_id())
print(response)