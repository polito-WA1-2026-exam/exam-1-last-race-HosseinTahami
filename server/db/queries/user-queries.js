import { dbGet, dbRun } from './connection.js';
import bcrypt from 'bcrypt';

// Get user by username
export async function getUserByUsername(username) {
  return dbGet('SELECT * FROM users WHERE username = ?', [username]);
}

// Get user by ID
export async function getUserById(userId) {
  return dbGet('SELECT id, username, created_at FROM users WHERE id = ?', [userId]);
}

// Create new user
export async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return dbRun(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword]
  );
}

// Verify user password
export async function verifyPassword(username, password) {
  const user = await getUserByUsername(username);
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;
  
  // Return user without password
  return { id: user.id, username: user.username };
}