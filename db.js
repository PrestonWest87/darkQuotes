/**
 * db.js
 * 
 * Database module for the Dark Humor Quotes project.
 * Uses mysql2 (promise-based) to connect to a Cloud SQL instance on GCP.
 *
 * Required environment variables:
 *   - DB_HOST: Hostname or Cloud SQL socket path
 *   - DB_USER: Database user
 *   - DB_PASS: Database password
 *   - DB_NAME: Database name
 *
 * License: Apache-2.0
 * Author: Your Name <your.email@example.com>
 */

const mysql = require('mysql2/promise');

if (
  !process.env.DB_HOST ||
  !process.env.DB_USER ||
  !process.env.DB_PASS ||
  !process.env.DB_NAME
) {
  throw new Error('Please set DB_HOST, DB_USER, DB_PASS, and DB_NAME environment variables.');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,        // e.g., "127.0.0.1" or Cloud SQL socket path
  user: process.env.DB_USER,        // e.g., "mydbuser"
  password: process.env.DB_PASS,    // e.g., "mydbpassword"
  database: process.env.DB_NAME,    // e.g., "mydbname"
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Initializes the "users" table if it doesn't already exist.
 */
async function initialize() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE,
      displayName VARCHAR(255),
      email VARCHAR(255),
      isPaying TINYINT(1) DEFAULT 0,
      dailyCount INT DEFAULT 0,
      lastReset DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(createTableQuery);
  console.log('Users table initialized.');
}

/**
 * Retrieves a user by their Google ID.
 * @param {string} googleId
 * @returns {Promise<Object>} User record.
 */
async function getUserByGoogleId(googleId) {
  const [rows] = await pool.query("SELECT * FROM users WHERE google_id = ?", [googleId]);
  return rows[0];
}

/**
 * Creates a new user record.
 * @param {Object} userData - Contains google_id, displayName, email, isPaying, dailyCount, lastReset.
 * @returns {Promise<Object>} Created user record.
 */
async function createUser(userData) {
  const query = `
    INSERT INTO users (google_id, displayName, email, isPaying, dailyCount, lastReset)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    userData.google_id,
    userData.displayName,
    userData.email,
    userData.isPaying ? 1 : 0,
    userData.dailyCount,
    userData.lastReset
  ];
  const [result] = await pool.query(query, params);
  userData.id = result.insertId;
  return userData;
}

/**
 * Updates an existing user record.
 * @param {Object} userData - Contains google_id, displayName, email, isPaying, dailyCount, lastReset.
 * @returns {Promise<Object>} Updated user record.
 */
async function updateUser(userData) {
  const query = `
    UPDATE users
    SET displayName = ?, email = ?, isPaying = ?, dailyCount = ?, lastReset = ?
    WHERE google_id = ?
  `;
  const params = [
    userData.displayName,
    userData.email,
    userData.isPaying ? 1 : 0,
    userData.dailyCount,
    userData.lastReset,
    userData.google_id
  ];
  await pool.query(query, params);
  return userData;
}

module.exports = {
  pool,
  initialize,
  getUserByGoogleId,
  createUser,
  updateUser
};
