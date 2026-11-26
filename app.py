from flask import Flask, request, jsonify, render_template
import joblib
import os
import pandas as pd

app = Flask(__name__, template_folder='templates', static_folder='static')

# Load the trained pipeline (includes preprocessing and model)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'pipeline.pkl')
if os.path.exists(MODEL_PATH):
    pipeline = joblib.load(MODEL_PATH)
else:
    pipeline = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    """Accept JSON payload (single record or list) and return prediction(s).
    Returns:
        - prediction: class label(s)
        - probability: probability for the positive class (if available)
        - classes: list of possible classes (for reference)
    """
    if pipeline is None:
        return jsonify({'error': 'Model not loaded'}), 500
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON payload provided'}), 400

    # Normalise to pandas DataFrame
    if isinstance(data, list):
        df = pd.DataFrame(data)
    else:
        df = pd.DataFrame([data])

    try:
        preds = pipeline.predict(df)
        # Try to get probability for the positive class (e.g., "Yes")
        prob = None
        if hasattr(pipeline, 'predict_proba'):
            proba = pipeline.predict_proba(df)
            # Assume the positive class is the second class if binary, else take max
            if len(pipeline.classes_) == 2:
                # Identify index of class "Yes" or the class that is not the first
                pos_index = list(pipeline.classes_).index('Yes') if 'Yes' in pipeline.classes_ else 1
                prob = proba[:, pos_index].tolist()
            else:
                # For multi‑class, just return max probability per row
                prob = proba.max(axis=1).tolist()
        response = {
            'prediction': preds.tolist(),
            'probability': prob,
            'classes': pipeline.classes_.tolist()
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/predict_csv', methods=['POST'])
def predict_csv():
    """Accept a CSV file upload; predict for each row."""
    if pipeline is None:
        return jsonify({'error': 'Model not loaded'}), 500
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400
    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    try:
        df = pd.read_csv(f)
        preds = pipeline.predict(df)
        prob = None
        if hasattr(pipeline, 'predict_proba'):
            proba = pipeline.predict_proba(df)
            if len(pipeline.classes_) == 2:
                pos_index = list(pipeline.classes_).index('Yes') if 'Yes' in pipeline.classes_ else 1
                prob = proba[:, pos_index].tolist()
            else:
                prob = proba.max(axis=1).tolist()
        return jsonify({
            'prediction': preds.tolist(),
            'probability': prob,
            'classes': pipeline.classes_.tolist()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
