from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from fetch_data import fetch_sessions_data
from preprocess import preprocess_data

df = fetch_sessions_data()
X = preprocess_data(df)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = KMeans(n_clusters=3, random_state=42)
labels = model.fit_predict(X_scaled)

score = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {score:.3f}")
