import express from "express";
import passport from "passport";

const router = express.Router();

// POST /api/auth/login - Login user
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ error: info.message || "Authentication failed" });
    }
    
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }
      return res.json({ id: user.id, username: user.username });
    });
  })(req, res, next);
});

// POST /api/auth/logout - Logout user
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// GET /api/auth/current - Get current logged-in user
router.get("/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ id: req.user.id, username: req.user.username });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;