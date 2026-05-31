// imports
import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";

// Inside imports
import "./config/auth.js";
import authRoutes from "./routes/auth.js";

// init express
const app = express();
const port = 3001;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Vite dev server default port
  credentials: true
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: "last-race-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true in production with HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);

// Test route (remove later)
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});