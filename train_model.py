import pandas as pd
import os
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
import joblib

# Paths
BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, 'loan_data.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'model')
MODEL_PATH = os.path.join(MODEL_DIR, 'pipeline.pkl')

# Load dataset
print('Loading data…')
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f'Dataset not found at {DATA_PATH}')

df = pd.read_csv(DATA_PATH)

# Target column
TARGET = 'Loan_Approved'
if TARGET not in df.columns:
    raise KeyError(f"Target column '{TARGET}' not found in dataset")

y = df[TARGET].fillna('No')
X = df.drop(columns=[TARGET, 'Applicant_ID'])

# Identify column types
numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
categorical_cols = X.select_dtypes(include=['object']).columns.tolist()

# Simple imputation for missing values
X[numeric_cols] = X[numeric_cols].fillna(X[numeric_cols].median())
X[categorical_cols] = X[categorical_cols].fillna('Missing')

# Preprocess + model pipeline
preprocess = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
    ]
)

pipeline = Pipeline([
    ('preprocess', preprocess),
    ('clf', GaussianNB())
])

print('Training Naïve Bayes model…')
pipeline.fit(X, y)

# Save the pipeline
os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(pipeline, MODEL_PATH)
print(f'✅ Model saved to {MODEL_PATH}')
