import joblib
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from fetch_data import fetch_sessions_data
from preprocess import preprocess_data

print("Fetching data...")
df = fetch_sessions_data()

if df.empty:
    print("No data found.")
    exit()

print("Preprocessing...")
X = preprocess_data(df)

# 🔹 Normalize data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("Training KMeans...")
model = KMeans(n_clusters=3, random_state=42)
model.fit(X_scaled)

# Save both model and scaler
joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("Model and scaler saved!")
