from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(title="Credit Card Fraud Detection API", description="Hackathon Project Backend")

# Setup CORS for the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production, e.g., ["http://localhost:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the pre-trained Machine Learning Model
MODEL_PATH = "models/best_fraud_model.pkl"
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    else:
        model = None
        print(f"Warning: Model file not found at {MODEL_PATH}. Prediction endpoints will fail until a model is trained and saved.")
except Exception as e:
    model = None
    print(f"Error loading model: {e}")

# Define the expected request body schema using Pydantic
class TransactionData(BaseModel):
    # Depending on how the frontend sends data, we accept the core 30 features
    Scaled_Amount: float
    Scaled_Time: float
    V1: float
    V2: float
    V3: float
    V4: float
    V5: float
    V6: float
    V7: float
    V8: float
    V9: float
    V10: float
    V11: float
    V12: float
    V13: float
    V14: float
    V15: float
    V16: float
    V17: float
    V18: float
    V19: float
    V20: float
    V21: float
    V22: float
    V23: float
    V24: float
    V25: float
    V26: float
    V27: float
    V28: float

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Credit Card Fraud API is running smoothly!"}

@app.post("/predict")
def predict_fraud(transaction: TransactionData):
    """
    Accepts transaction data, runs it through the ML model,
    and returns whether it is 'Legitimate' or 'Fraudulent'.
    """
    if model is None:
         raise HTTPException(status_code=503, detail="Model is not loaded. Please train the model and export it to models/best_fraud_model.pkl first.")
    
    # 1. Prepare data vector
    # Order must match exactly how the model was trained
    features = [
        transaction.Scaled_Amount,
        transaction.Scaled_Time,
        transaction.V1, transaction.V2, transaction.V3, transaction.V4, transaction.V5,
        transaction.V6, transaction.V7, transaction.V8, transaction.V9, transaction.V10,
        transaction.V11, transaction.V12, transaction.V13, transaction.V14, transaction.V15,
        transaction.V16, transaction.V17, transaction.V18, transaction.V19, transaction.V20,
        transaction.V21, transaction.V22, transaction.V23, transaction.V24, transaction.V25,
        transaction.V26, transaction.V27, transaction.V28
    ]
    
    # Reshape for sklearn input
    feature_vector = np.array(features).reshape(1, -1)
    
    # 2. Make prediction
    try:
        prediction = model.predict(feature_vector)
        
        # In scikit-learn, 0 is typically Legitimate, and 1 is Fraudulent (based on our dataset)
        result = "Fraudulent" if prediction[0] == 1 else "Legitimate"
        
        return {
            "prediction": result,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing prediction: {str(e)}")

# Add a requirements string for user helper
# uvicorn app:app --reload
