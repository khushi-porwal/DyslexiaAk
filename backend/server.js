const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const app = express();

/* ===============================
   SECURITY & BASIC MIDDLEWARES
================================ */

// Helmet (allow images for mobile/web)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS (Expo + web + mobile)
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(cookieParser());

/* ===============================
   STATIC FILES (IMAGES)
================================ */

// Example:
// http://<IP>:5000/uploads/words/apple.png
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

/* ===============================
   ROUTES
================================ */

app.use("/api/auth", require("./routes/User_routes/authRoutes"));

const historyRoutes = require("./routes/History/historyRoutes");

app.use("/api", historyRoutes);
// phonological can stay, not harmful
app.use("/api/phonological", require("././routes/Phonological_routes/phonologicalRoutes"));

/* ===============================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.send("Backend Running Securely 🚀");
});

/* ===============================
   DATABASE CONNECTION
================================ */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✔ MongoDB Connected Successfully"))
  .catch((err) =>
    console.error("❌ MongoDB Connection Error:", err.message)
  );

/* ===============================
   SERVER START
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
