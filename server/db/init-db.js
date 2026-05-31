import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Helper function to run SQL queries with promises
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Drop existing tables
async function dropTables() {
  console.log('Dropping existing tables...');
  await runQuery('DROP TABLE IF EXISTS games');
  await runQuery('DROP TABLE IF EXISTS events');
  await runQuery('DROP TABLE IF EXISTS connections');
  await runQuery('DROP TABLE IF EXISTS stations');
  await runQuery('DROP TABLE IF EXISTS lines');
  await runQuery('DROP TABLE IF EXISTS users');
  console.log('Tables dropped successfully');
}

// Create all tables
async function createTables() {
  console.log('Creating tables...');

  // Users table
  await runQuery(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Lines table
  await runQuery(`
    CREATE TABLE lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    )
  `);

  // Stations table
  await runQuery(`
    CREATE TABLE stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  // Connections table
  await runQuery(`
    CREATE TABLE connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      line_id INTEGER NOT NULL,
      station_from_id INTEGER NOT NULL,
      station_to_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (line_id) REFERENCES lines(id),
      FOREIGN KEY (station_from_id) REFERENCES stations(id),
      FOREIGN KEY (station_to_id) REFERENCES stations(id)
    )
  `);

  // Events table
  await runQuery(`
    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      effect INTEGER NOT NULL
    )
  `);

  // Games table
  await runQuery(`
    CREATE TABLE games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      start_station_id INTEGER NOT NULL,
      destination_station_id INTEGER NOT NULL,
      final_score INTEGER NOT NULL,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (start_station_id) REFERENCES stations(id),
      FOREIGN KEY (destination_station_id) REFERENCES stations(id)
    )
  `);

  console.log('Tables created successfully');
}

// Seed data
async function seedData() {
  console.log('Seeding data...');

  // Insert users with hashed passwords
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('password456', 10);
  const hashedPassword3 = await bcrypt.hash('password789', 10);

  await runQuery('INSERT INTO users (username, password) VALUES (?, ?)', ['ali', hashedPassword1]);
  await runQuery('INSERT INTO users (username, password) VALUES (?, ?)', ['sara', hashedPassword2]);
  await runQuery('INSERT INTO users (username, password) VALUES (?, ?)', ['reza', hashedPassword3]);
  console.log('Users inserted');

  // Insert lines (Tehran Metro)
  await runQuery('INSERT INTO lines (name, color) VALUES (?, ?)', ['Red Line', '#E31E24']);
  await runQuery('INSERT INTO lines (name, color) VALUES (?, ?)', ['Blue Line', '#0066CC']);
  await runQuery('INSERT INTO lines (name, color) VALUES (?, ?)', ['Green Line', '#00A651']);
  await runQuery('INSERT INTO lines (name, color) VALUES (?, ?)', ['Yellow Line', '#FFD700']);
  console.log('Lines inserted');

  // Insert stations (18 unique stations)
  const stationNames = [
    'Tajrish', 'Vanak', 'Darvazeh', 'Farah', 'Jonub',
    'Sadeghieh', 'Mellat', 'Tehranpars',
    'Ghaem', 'Valiazr', 'Ferdowsi', 'Beheshti',
    'Pahlavi', 'Shahran', 'Eram'
  ];

  for (const name of stationNames) {
    await runQuery('INSERT INTO stations (name) VALUES (?)', [name]);
  }
  console.log('Stations inserted');

  // Helper to get station ID by name
  function getStationId(name) {
    return stationNames.indexOf(name) + 1;
  }

  // Insert connections for Line 1 (Red): Tajrish — Vanak — Darvazeh — Farah — Jonub
  const line1Connections = [
    [1, getStationId('Tajrish'), getStationId('Vanak'), 1],
    [1, getStationId('Vanak'), getStationId('Darvazeh'), 2],
    [1, getStationId('Darvazeh'), getStationId('Farah'), 3],
    [1, getStationId('Farah'), getStationId('Jonub'), 4]
  ];

  // Insert connections for Line 2 (Blue): Sadeghieh — Farah — Mellat — Darvazeh — Tehranpars
  const line2Connections = [
    [2, getStationId('Sadeghieh'), getStationId('Farah'), 1],
    [2, getStationId('Farah'), getStationId('Mellat'), 2],
    [2, getStationId('Mellat'), getStationId('Darvazeh'), 3],
    [2, getStationId('Darvazeh'), getStationId('Tehranpars'), 4]
  ];

  // Insert connections for Line 3 (Green): Ghaem — Valiazr — Ferdowsi — Mellat — Beheshti
  const line3Connections = [
    [3, getStationId('Ghaem'), getStationId('Valiazr'), 1],
    [3, getStationId('Valiazr'), getStationId('Ferdowsi'), 2],
    [3, getStationId('Ferdowsi'), getStationId('Mellat'), 3],
    [3, getStationId('Mellat'), getStationId('Beheshti'), 4]
  ];

  // Insert connections for Line 4 (Yellow): Pahlavi — Ferdowsi — Shahran — Vanak — Eram
  const line4Connections = [
    [4, getStationId('Pahlavi'), getStationId('Ferdowsi'), 1],
    [4, getStationId('Ferdowsi'), getStationId('Shahran'), 2],
    [4, getStationId('Shahran'), getStationId('Vanak'), 3],
    [4, getStationId('Vanak'), getStationId('Eram'), 4]
  ];

  const allConnections = [...line1Connections, ...line2Connections, ...line3Connections, ...line4Connections];

  for (const [lineId, fromId, toId, pos] of allConnections) {
    // Insert bidirectional connections
    await runQuery('INSERT INTO connections (line_id, station_from_id, station_to_id, position) VALUES (?, ?, ?, ?)', 
      [lineId, fromId, toId, pos]);
    await runQuery('INSERT INTO connections (line_id, station_from_id, station_to_id, position) VALUES (?, ?, ?, ?)', 
      [lineId, toId, fromId, pos]);
  }
  console.log('Connections inserted');

  // Insert events (at least 8)
  const events = [
    ['Quiet journey', 0],
    ['Found a coin on the seat', 1],
    ['Helpful passenger gave you a tip', 2],
    ['Street musician gave you a smile', 3],
    ['Found a lucky charm', 4],
    ['Wrong platform, had to backtrack', -1],
    ['Ticket inspector fine', -2],
    ['Pickpocket stole some coins', -3],
    ['Missed connection, expensive taxi', -4]
  ];

  for (const [description, effect] of events) {
    await runQuery('INSERT INTO events (description, effect) VALUES (?, ?)', [description, effect]);
  }
  console.log('Events inserted');

  // Insert sample games (2 users have played)
  await runQuery('INSERT INTO games (user_id, start_station_id, destination_station_id, final_score) VALUES (?, ?, ?, ?)', 
    [1, getStationId('Tajrish'), getStationId('Tehranpars'), 25]);
  await runQuery('INSERT INTO games (user_id, start_station_id, destination_station_id, final_score) VALUES (?, ?, ?, ?)', 
    [1, getStationId('Ghaem'), getStationId('Jonub'), 18]);
  await runQuery('INSERT INTO games (user_id, start_station_id, destination_station_id, final_score) VALUES (?, ?, ?, ?)', 
    [2, getStationId('Sadeghieh'), getStationId('Eram'), 22]);
  await runQuery('INSERT INTO games (user_id, start_station_id, destination_station_id, final_score) VALUES (?, ?, ?, ?)', 
    [2, getStationId('Pahlavi'), getStationId('Beheshti'), 15]);
  console.log('Sample games inserted');

  console.log('✅ Database seeded successfully!');
}

// Main execution
db.serialize(async () => {
  try {
    await dropTables();
    await createTables();
    await seedData();
    
    console.log('\n🎉 Database initialization complete!');
    console.log('\nTest users:');
    console.log('  - Username: ali, Password: password123');
    console.log('  - Username: sara, Password: password456');
    console.log('  - Username: reza, Password: password789');
    
  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
});