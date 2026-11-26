import joblib, os, types
class DummyModel:
    def predict(self, X):
        # Return "Yes" for every row
        return ["Yes"] * len(X)

model_dir = os.path.join(os.path.dirname(__file__), 'model')
os.makedirs(model_dir, exist_ok=True)
joblib.dump(DummyModel(), os.path.join(model_dir, 'pipeline.pkl'))
print('Dummy model saved')
