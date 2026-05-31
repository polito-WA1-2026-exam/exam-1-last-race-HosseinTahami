import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'db', 'database.db');

// Open database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Auth module connected to database");
  }
});

// Helper function to promisify database queries
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Configure Passport Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    // Find user by username
    const user = await dbGet("SELECT * FROM users WHERE username = ?", [username]);
    
    if (!user) {
      return done(null, false, { message: "Incorrect username or password" });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return done(null, false, { message: "Incorrect username or password" });
    }
    
    // Success - return user object (without password)
    return done(null, { id: user.id, username: user.username });
    
  } catch (err) {
    return done(err);
  }
}));

// Serialize user (store user.id in session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user (retrieve user from session)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await dbGet("SELECT id, username FROM users WHERE id = ?", [id]);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;