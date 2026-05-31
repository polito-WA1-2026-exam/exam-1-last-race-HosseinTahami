import { dbAll, dbGet, dbRun } from './connection.js';

// Get all events
export async function getAllEvents() {
  return dbAll('SELECT * FROM events');
}

// Get random event
export async function getRandomEvent() {
  return dbGet('SELECT * FROM events ORDER BY RANDOM() LIMIT 1');
}

// Get event by ID
export async function getEventById(eventId) {
  return dbGet('SELECT * FROM events WHERE id = ?', [eventId]);
}

// Save a new game
export async function saveGame(userId, startStationId, destinationStationId, finalScore) {
  return dbRun(
    'INSERT INTO games (user_id, start_station_id, destination_station_id, final_score) VALUES (?, ?, ?, ?)',
    [userId, startStationId, destinationStationId, finalScore]
  );
}

// Get all games for a user
export async function getGamesByUser(userId) {
  return dbAll(`
    SELECT 
      g.id,
      g.user_id,
      s1.name as start_station,
      s2.name as destination_station,
      g.final_score,
      g.played_at
    FROM games g
    JOIN stations s1 ON g.start_station_id = s1.id
    JOIN stations s2 ON g.destination_station_id = s2.id
    WHERE g.user_id = ?
    ORDER BY g.played_at DESC
  `, [userId]);
}

// Get top scores (leaderboard)
export async function getTopScores(limit = 10) {
  return dbAll(`
    SELECT 
      u.username,
      s1.name as start_station,
      s2.name as destination_station,
      g.final_score,
      g.played_at
    FROM games g
    JOIN users u ON g.user_id = u.id
    JOIN stations s1 ON g.start_station_id = s1.id
    JOIN stations s2 ON g.destination_station_id = s2.id
    ORDER BY g.final_score DESC
    LIMIT ?
  `, [limit]);
}

// Get game by ID
export async function getGameById(gameId) {
  return dbGet(`
    SELECT 
      g.id,
      g.user_id,
      u.username,
      g.start_station_id,
      s1.name as start_station,
      g.destination_station_id,
      s2.name as destination_station,
      g.final_score,
      g.played_at
    FROM games g
    JOIN users u ON g.user_id = u.id
    JOIN stations s1 ON g.start_station_id = s1.id
    JOIN stations s2 ON g.destination_station_id = s2.id
    WHERE g.id = ?
  `, [gameId]);
}