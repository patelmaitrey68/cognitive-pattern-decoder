import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI not found. Check your .env file")

client = MongoClient(MONGO_URI)

db = client["cognitiveDB"]

sessions_collection = db["sessions"]
users_collection = db["users"]
projects_collection = db["projects"]
