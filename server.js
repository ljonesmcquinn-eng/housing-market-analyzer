require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { initializeDatabase } = require('./database/db');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const forumRoutes = require('./routes/forum');
const propertiesRoutes = require('./routes/properties');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - required for secure cookies on Render
app.set('trust proxy', 1);

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './database'
    }),
    secret: process.env.SESSION_SECRET || 'housing-market-analyzer-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

app.use(express.static('public'));

// API Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/properties', propertiesRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Initialize database and start server
async function start() {
    try {
        await initializeDatabase();
        console.log('✅ Database initialized');

        app.listen(PORT, () => {
            console.log(`\n🚀 Housing Market Analyzer running at http://localhost:${PORT}`);
            console.log(`   API endpoints:`);
            console.log(`   - GET /api/markets`);
            console.log(`   - GET /api/markets/:city`);
            console.log(`   - GET /api/markets/:city/submarkets\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
