require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const notificationRoutes = require("./routes/notification.routes");
const authRoutes = require("./routes/auth.routes");
const sessionRoutes = require("./routes/session.routes");
const projectRoutes = require("./routes/project.routes");
const mlResultRoutes = require("./routes/mlresult.routes");
const historyRoutes = require("./routes/history.routes");
const analysisRoutes = require("./routes/analysis.routes");
const app = express();

const corsOptions = {
  origin: '*', // Allows any origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allows all standard methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Ensures headers for JSON/Auth work
  credentials: true
};

app.use(cors());
// DB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/mlresults", mlResultRoutes);
app.use("/api/history", historyRoutes);
app.use("/api", notificationRoutes);
app.use("/api/analysis", analysisRoutes);


app.get("/", (req, res) => {
  res.send("Cognitive Pattern Decoder Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

//testing extension connection with backend
//test connection with NGROK