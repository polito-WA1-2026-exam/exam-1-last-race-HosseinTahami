import express from "express";
import {
  getAllEvents,
  getRandomEvent,
  saveGame,
  getTopScores,
  getGameById
} from "../db/queries/game-queries.js";

const router = express.Router();

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

// GET /api/games/events - Get all events
router.get("/events", async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET /api/games/events/random - Get random event
router.get("/events/random", async (req, res) => {
  try {
    const event = await getRandomEvent();
    res.json(event);
  } catch (error) {
    console.error("Error fetching random event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// POST /api/games - Save a new game (requires authentication)
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { startStationId, destinationStationId, finalScore } = req.body;
    
    if (!startStationId || !destinationStationId || finalScore === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = await saveGame(
      req.user.id,
      startStationId,
      destinationStationId,
      finalScore
    );
    
    res.status(201).json({ 
      id: result.lastID,
      message: "Game saved successfully" 
    });
  } catch (error) {
    console.error("Error saving game:", error);
    res.status(500).json({ error: "Failed to save game" });
  }
});

// GET /api/games/leaderboard - Get top scores
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topScores = await getTopScores(limit);
    res.json(topScores);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// GET /api/games/:id - Get game by ID
router.get("/:id", async (req, res) => {
  try {
    const game = await getGameById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

export default router;