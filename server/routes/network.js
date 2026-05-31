import express from "express";
import { 
  getAllLines, 
  getAllStations, 
  getAllConnections,
  getConnectionsByLine,
  getInterchangeStations,
  getStationById,
  getLineById
} from "../db/queries/network-queries.js";

const router = express.Router();

// GET /api/network/lines - Get all lines
router.get("/lines", async (req, res) => {
  try {
    const lines = await getAllLines();
    res.json(lines);
  } catch (error) {
    console.error("Error fetching lines:", error);
    res.status(500).json({ error: "Failed to fetch lines" });
  }
});

// GET /api/network/stations - Get all stations
router.get("/stations", async (req, res) => {
  try {
    const stations = await getAllStations();
    res.json(stations);
  } catch (error) {
    console.error("Error fetching stations:", error);
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});

// GET /api/network/connections - Get all connections
router.get("/connections", async (req, res) => {
  try {
    const connections = await getAllConnections();
    res.json(connections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
});

// GET /api/network/lines/:id - Get line by ID
router.get("/lines/:id", async (req, res) => {
  try {
    const line = await getLineById(req.params.id);
    if (!line) {
      return res.status(404).json({ error: "Line not found" });
    }
    res.json(line);
  } catch (error) {
    console.error("Error fetching line:", error);
    res.status(500).json({ error: "Failed to fetch line" });
  }
});

// GET /api/network/lines/:id/connections - Get connections for a line
router.get("/lines/:id/connections", async (req, res) => {
  try {
    const connections = await getConnectionsByLine(req.params.id);
    res.json(connections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
});

// GET /api/network/stations/:id - Get station by ID
router.get("/stations/:id", async (req, res) => {
  try {
    const station = await getStationById(req.params.id);
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }
    res.json(station);
  } catch (error) {
    console.error("Error fetching station:", error);
    res.status(500).json({ error: "Failed to fetch station" });
  }
});

// GET /api/network/interchanges - Get interchange stations
router.get("/interchanges", async (req, res) => {
  try {
    const interchanges = await getInterchangeStations();
    res.json(interchanges);
  } catch (error) {
    console.error("Error fetching interchanges:", error);
    res.status(500).json({ error: "Failed to fetch interchange stations" });
  }
});

export default router;