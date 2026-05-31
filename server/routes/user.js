import express from "express";
import { getUserById } from "../db/queries/user-queries.js";
import { getGamesByUser } from "../db/queries/game-queries.js";

const router = express.Router();

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

// GET /api/users/me - Get current user profile
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET /api/users/me/games - Get current user's game history
router.get("/me/games", isAuthenticated, async (req, res) => {
  try {
    const games = await getGamesByUser(req.user.id);
    res.json(games);
  } catch (error) {
    console.error("Error fetching user games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

export default router;