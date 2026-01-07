const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path from environment or default
const dbPath = process.env.DB_PATH || path.join(__dirname, 'markets.db');

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log(`Connected to SQLite database at ${dbPath}`);
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database schema
 */
function initializeDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    return new Promise((resolve, reject) => {
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error initializing database schema:', err.message);
                reject(err);
            } else {
                console.log('Database schema initialized successfully');
                resolve();
            }
        });
    });
}

/**
 * Run a query that returns multiple rows
 */
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

/**
 * Run a query that returns a single row
 */
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

/**
 * Run a query that modifies data (INSERT, UPDATE, DELETE)
 */
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

/**
 * Close database connection
 */
function close() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Get database instance
function getDatabase() {
    return db;
}

module.exports = {
    db,
    getDatabase,
    initializeDatabase,
    all,
    get,
    run,
    close
};
