import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    console.log('Database path:', dbPath);
  }
});

// Helper function to run queries with promises
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Test database
async function testDatabase() {
  console.log('\n--- Testing Database ---\n');

  // Test users
  console.log('Users:');
  const users = await runQuery('SELECT id, username, created_at FROM users');
  console.table(users);

  // Test lines
  console.log('\nLines:');
  const lines = await runQuery('SELECT * FROM lines');
  console.table(lines);

  // Test stations
  console.log('\nStations:');
  const stations = await runQuery('SELECT * FROM stations');
  console.table(stations);

  // Test connections count
  console.log('\nConnections count:');
  const connectionCount = await runQuery('SELECT COUNT(*) as count FROM connections');
  console.log(`Total connections: ${connectionCount[0].count}`);

  // Test events
  console.log('\nEvents:');
  const events = await runQuery('SELECT * FROM events');
  console.table(events);

  // Test games
  console.log('\nGames:');
  const games = await runQuery(`
    SELECT 
      g.id,
      u.username,
      s1.name as start_station,
      s2.name as destination_station,
      g.final_score,
      g.played_at
    FROM games g
    JOIN users u ON g.user_id = u.id
    JOIN stations s1 ON g.start_station_id = s1.id
    JOIN stations s2 ON g.destination_station_id = s2.id
  `);
  console.table(games);
}

// Main execution
(async () => {
  try {
    await testDatabase();
    console.log('\n✅ All database tests passed!');
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
  } finally {
    db.close();
  }
})();