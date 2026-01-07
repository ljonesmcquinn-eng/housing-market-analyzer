require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api', apiRoutes);

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
