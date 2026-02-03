This folder contains model artifacts used by the Email Guard service.

- `classical/` — scikit-learn / joblib models.
- `text/` — transformer model and tokenizer files (loaded by backend if `TEXT_MODEL_PATH` points here).

Do not check large binary model files into Git; keep them in a separate storage or large-file storage if needed.
