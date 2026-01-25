import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from fetch_data import fetch_sessions_data
from preprocess import preprocess_data

print("Fetching data...")
df = fetch_sessions_data()

if df.empty:
    print("No data found.")
    exit()

X = preprocess_data(df)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = KMeans(n_clusters=3, random_state=42)
labels = model.fit_predict(X_scaled)

pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

plt.scatter(X_pca[:, 0], X_pca[:, 1], c=labels)
plt.title("Cognitive Coding Behavior Clusters")
plt.xlabel("PCA 1")
plt.ylabel("PCA 2")
plt.show()
