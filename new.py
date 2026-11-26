import joblib
sc=joblib.load("C:/Users/Dell/logistic/scaler_approval.pkl")
model=joblib.load("C:/Users/Dell/logistic/loan_approval.pkl")
print("scaler and model loaded successfully")