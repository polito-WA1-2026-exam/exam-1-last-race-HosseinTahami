import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  }
});

// Helper function to promisify database queries
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Main test function
async function testDatabase() {
  try {
    console.log('Connected to database\n');

    console.log('=== LINES ===');
    const lines = await query('SELECT * FROM lines');
    console.table(lines);

    console.log('\n=== STATIONS ===');
    const stations = await query('SELECT * FROM stations');
    console.table(stations);

    console.log('\n=== INTERCHANGE STATIONS (appear in multiple lines) ===');
    const interchanges = await query(`
      SELECT s.name, COUNT(DISTINCT c.line_id) as line_count
      FROM stations s
      JOIN connections c ON s.id = c.station_from_id
      GROUP BY s.id
      HAVING line_count > 1
      ORDER BY line_count DESC
    `);
    console.table(interchanges);

    console.log('\n=== EVENTS ===');
    const events = await query('SELECT * FROM events');
    console.table(events);

    console.log('\n=== USERS ===');
    const users = await query('SELECT id, username, created_at FROM users');
    console.table(users);

    console.log('\n=== GAMES (RANKING) ===');
    const games = await query(`
      SELECT u.username, s1.name as start, s2.name as destination, g.final_score
      FROM games g
      JOIN users u ON g.user_id = u.id
      JOIN stations s1 ON g.start_station_id = s1.id
      JOIN stations s2 ON g.destination_station_id = s2.id
      ORDER BY g.final_score DESC
    `);
    console.table(games);

    console.log('\n✅ Database test complete!');
    
  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      }
    });
  }
}

// Run the test
testDatabase();