const express = require('express');
const bcrypt = require('bcrypt');
const { getDatabase } = require('../database/db');

const router = express.Router();
const SALT_ROUNDS = 10;

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    next();
}

// POST /api/auth/signup - Create new user account
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required'
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Username must be at least 3 characters'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        // Email validation (basic)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        const db = getDatabase();

        // Check if username already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [username, email],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Username or email already exists'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const result = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                [username, email, passwordHash],
                function(err) {
                    if (err) reject(err);
                    else resolve(this);
                }
            );
        });

        // Create session
        req.session.userId = result.lastID;
        req.session.username = username;

        res.json({
            success: true,
            user: {
                id: result.lastID,
                username,
                email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create account'
        });
    }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const db = getDatabase();

        // Find user
        const user = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id, username, email, password_hash, is_active FROM users WHERE email = ?',
                [email],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                error: 'Account is disabled'
            });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [user.id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Create session
        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
});

// POST /api/auth/logout - Logout user
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Failed to logout'
            });
        }
        res.json({
            success: true
        });
    });
});

// GET /api/auth/me - Get current user
router.get('/me', requireAuth, async (req, res) => {
    try {
        const db = getDatabase();

        const user = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id, username, email, created_at FROM users WHERE id = ?',
                [req.session.userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user'
        });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { name, bio, username } = req.body;
        const db = getDatabase();

        // Check if username is taken (if changing)
        if (username) {
            const existing = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id FROM users WHERE username = ? AND id != ?',
                    [username, req.session.userId],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already taken'
                });
            }
        }

        // Update profile
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (bio !== undefined) {
            updates.push('bio = ?');
            params.push(bio);
        }
        if (username) {
            updates.push('username = ?');
            params.push(username);
            req.session.username = username;
        }

        params.push(req.session.userId);

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                params,
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            success: true
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

// PUT /api/auth/password - Change password
router.put('/password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current and new password required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters'
            });
        }

        const db = getDatabase();

        // Get current password hash
        const user = await new Promise((resolve, reject) => {
            db.get(
                'SELECT password_hash FROM users WHERE id = ?',
                [req.session.userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        // Verify current password
        const match = await bcrypt.compare(currentPassword, user.password_hash);
        if (!match) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update password
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [newHash, req.session.userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            success: true
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password'
        });
    }
});

// GET /api/auth/user/:id - Get public user profile
router.get('/user/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const userId = req.params.id;

        const user = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id, username, name, bio, created_at FROM users WHERE id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get user's post count
        const stats = await new Promise((resolve, reject) => {
            db.get(
                `SELECT
                    COUNT(DISTINCT t.id) as thread_count,
                    COUNT(p.id) as post_count
                FROM users u
                LEFT JOIN forum_threads t ON u.id = t.user_id
                LEFT JOIN forum_posts p ON u.id = p.user_id
                WHERE u.id = ?`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        res.json({
            success: true,
            user: {
                ...user,
                ...stats
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user profile'
        });
    }
});

module.exports = router;
module.exports.requireAuth = requireAuth;
