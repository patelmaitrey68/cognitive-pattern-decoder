import pandas as pd
from connect_db import sessions_collection

def fetch_sessions_data():
    sessions = list(sessions_collection.find())

    if not sessions:
        print("No session data found!")
        return pd.DataFrame()

    df = pd.DataFrame(sessions)

    # Remove MongoDB internal ID
    df = df.drop(columns=["_id"], errors="ignore")

    return df
