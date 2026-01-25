def preprocess_data(df):
    if df.empty:
        return df

    # Select useful features
    features = [
        "typingSpeed",
        "typedChars",
        "backspaceCount",
        "pasteCount",
      
        "avgPauseTime",
        "sessionTime"
    ]

    df = df[features]

    # Fill missing values
    df = df.fillna(0)

    return df
