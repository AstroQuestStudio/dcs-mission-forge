import sys, json
sys.stdout.reconfigure(encoding='utf-8')
from graphify.detect import detect
from pathlib import Path
result = detect(Path('C:/Users/trufa/Saved Games/DCS/dcs-mission-forge'))
print(json.dumps(result))
