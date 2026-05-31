import { dbAll, dbGet } from './connection.js';

// Get all lines
export async function getAllLines() {
  return dbAll('SELECT * FROM lines');
}

// Get all stations
export async function getAllStations() {
  return dbAll('SELECT * FROM stations');
}

// Get all connections with full details
export async function getAllConnections() {
  return dbAll(`
    SELECT 
      c.id,
      c.line_id,
      l.name as line_name,
      l.color as line_color,
      c.station_from_id,
      s1.name as station_from_name,
      c.station_to_id,
      s2.name as station_to_name,
      c.position
    FROM connections c
    JOIN lines l ON c.line_id = l.id
    JOIN stations s1 ON c.station_from_id = s1.id
    JOIN stations s2 ON c.station_to_id = s2.id
    ORDER BY c.line_id, c.position
  `);
}

// Get connections for a specific line
export async function getConnectionsByLine(lineId) {
  return dbAll(`
    SELECT 
      c.id,
      c.station_from_id,
      s1.name as station_from_name,
      c.station_to_id,
      s2.name as station_to_name,
      c.position
    FROM connections c
    JOIN stations s1 ON c.station_from_id = s1.id
    JOIN stations s2 ON c.station_to_id = s2.id
    WHERE c.line_id = ?
    ORDER BY c.position
  `, [lineId]);
}

// Get interchange stations (stations on multiple lines)
export async function getInterchangeStations() {
  return dbAll(`
    SELECT 
      s.id,
      s.name,
      COUNT(DISTINCT c.line_id) as line_count,
      GROUP_CONCAT(DISTINCT l.name) as lines
    FROM stations s
    JOIN connections c ON s.id = c.station_from_id
    JOIN lines l ON c.line_id = l.id
    GROUP BY s.id
    HAVING line_count > 1
  `);
}

// Get station by ID
export async function getStationById(stationId) {
  return dbGet('SELECT * FROM stations WHERE id = ?', [stationId]);
}

// Get line by ID
export async function getLineById(lineId) {
  return dbGet('SELECT * FROM lines WHERE id = ?', [lineId]);
}