import json
import os
import sys
from pathlib import Path

try:
    from sentence_transformers import SentenceTransformer
except ImportError as exc:
    sys.stderr.write(f"Missing Python dependency: {exc}\n")
    sys.exit(1)

MODEL_ARG_INDEX = 1

MODEL_NAME = sys.argv[MODEL_ARG_INDEX] if len(sys.argv) > MODEL_ARG_INDEX else 'sentence-transformers/all-MiniLM-L6-v2'

MODEL_PATH = MODEL_NAME

model = SentenceTransformer(MODEL_PATH)

if __name__ == '__main__':
    for raw_line in sys.stdin:
        try:
            request = json.loads(raw_line)
            request_id = request.get('requestId')
            texts = request.get('texts', [])
            if not isinstance(request_id, int) or not isinstance(texts, list):
                raise ValueError('Invalid request format')

            embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=False)
            if hasattr(embeddings, 'tolist'):
                embeddings = embeddings.tolist()

            output = json.dumps({'requestId': request_id, 'embeddings': embeddings})
            sys.stdout.write(output + '\n')
            sys.stdout.flush()
        except Exception as exc:
            sys.stderr.write(f'Embedding worker error: {exc}\n')
            sys.stderr.flush()
