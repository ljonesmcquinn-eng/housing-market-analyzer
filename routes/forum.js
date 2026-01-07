const express = require('express');
const { getDatabase } = require('../database/db');
const { requireAuth } = require('./auth');

const router = express.Router();

// GET /api/forum/categories - Get all forum categories
router.get('/categories', async (req, res) => {
    try {
        const db = getDatabase();

        const categories = await new Promise((resolve, reject) => {
            db.all(
                `SELECT
                    c.id,
                    c.name,
                    c.description,
                    c.icon,
                    COUNT(DISTINCT t.id) as thread_count,
                    COUNT(DISTINCT p.id) as post_count
                FROM forum_categories c
                LEFT JOIN forum_threads t ON c.id = t.category_id
                LEFT JOIN forum_posts p ON t.id = p.thread_id
                GROUP BY c.id
                ORDER BY c.display_order ASC`,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get categories'
        });
    }
});

// GET /api/forum/categories/:id/threads - Get threads in a category
router.get('/categories/:id/threads', async (req, res) => {
    try {
        const db = getDatabase();
        const categoryId = req.params.id;

        const threads = await new Promise((resolve, reject) => {
            db.all(
                `SELECT
                    t.id,
                    t.title,
                    t.is_pinned,
                    t.is_locked,
                    t.view_count,
                    t.created_at,
                    t.updated_at,
                    u.username as author,
                    COUNT(p.id) as reply_count,
                    MAX(p.created_at) as last_reply_at
                FROM forum_threads t
                JOIN users u ON t.user_id = u.id
                LEFT JOIN forum_posts p ON t.id = p.thread_id
                WHERE t.category_id = ?
                GROUP BY t.id
                ORDER BY t.is_pinned DESC, t.updated_at DESC`,
                [categoryId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.json({
            success: true,
            threads
        });
    } catch (error) {
        console.error('Get threads error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get threads'
        });
    }
});

// GET /api/forum/threads/:id - Get thread with all posts
router.get('/threads/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const threadId = req.params.id;

        // Get thread info
        const thread = await new Promise((resolve, reject) => {
            db.get(
                `SELECT
                    t.id,
                    t.title,
                    t.is_locked,
                    t.view_count,
                    t.created_at,
                    t.category_id,
                    c.name as category_name,
                    u.username as author,
                    u.id as author_id
                FROM forum_threads t
                JOIN users u ON t.user_id = u.id
                JOIN forum_categories c ON t.category_id = c.id
                WHERE t.id = ?`,
                [threadId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!thread) {
            return res.status(404).json({
                success: false,
                error: 'Thread not found'
            });
        }

        // Get all posts in thread
        const posts = await new Promise((resolve, reject) => {
            db.all(
                `SELECT
                    p.id,
                    p.content,
                    p.is_edited,
                    p.created_at,
                    p.updated_at,
                    u.username as author,
                    u.id as author_id
                FROM forum_posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.thread_id = ?
                ORDER BY p.created_at ASC`,
                [threadId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        // Increment view count
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE forum_threads SET view_count = view_count + 1 WHERE id = ?',
                [threadId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            success: true,
            thread,
            posts
        });
    } catch (error) {
        console.error('Get thread error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get thread'
        });
    }
});

// POST /api/forum/threads - Create new thread
router.post('/threads', requireAuth, async (req, res) => {
    try {
        const { categoryId, title, content } = req.body;

        if (!categoryId || !title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Category, title, and content are required'
            });
        }

        if (title.length < 5) {
            return res.status(400).json({
                success: false,
                error: 'Title must be at least 5 characters'
            });
        }

        if (content.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Content must be at least 10 characters'
            });
        }

        const db = getDatabase();

        // Create thread
        const threadResult = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO forum_threads (category_id, user_id, title) VALUES (?, ?, ?)',
                [categoryId, req.session.userId, title],
                function(err) {
                    if (err) reject(err);
                    else resolve(this);
                }
            );
        });

        const threadId = threadResult.lastID;

        // Create first post
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO forum_posts (thread_id, user_id, content) VALUES (?, ?, ?)',
                [threadId, req.session.userId, content],
                function(err) {
                    if (err) reject(err);
                    else resolve(this);
                }
            );
        });

        res.json({
            success: true,
            threadId
        });
    } catch (error) {
        console.error('Create thread error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create thread'
        });
    }
});

// POST /api/forum/posts - Create new post (reply)
router.post('/posts', requireAuth, async (req, res) => {
    try {
        const { threadId, content } = req.body;

        if (!threadId || !content) {
            return res.status(400).json({
                success: false,
                error: 'Thread ID and content are required'
            });
        }

        if (content.length < 1) {
            return res.status(400).json({
                success: false,
                error: 'Content cannot be empty'
            });
        }

        const db = getDatabase();

        // Check if thread exists and is not locked
        const thread = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id, is_locked FROM forum_threads WHERE id = ?',
                [threadId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!thread) {
            return res.status(404).json({
                success: false,
                error: 'Thread not found'
            });
        }

        if (thread.is_locked) {
            return res.status(403).json({
                success: false,
                error: 'Thread is locked'
            });
        }

        // Create post
        const result = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO forum_posts (thread_id, user_id, content) VALUES (?, ?, ?)',
                [threadId, req.session.userId, content],
                function(err) {
                    if (err) reject(err);
                    else resolve(this);
                }
            );
        });

        // Update thread's updated_at timestamp
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE forum_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [threadId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            success: true,
            postId: result.lastID
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create post'
        });
    }
});

// DELETE /api/forum/posts/:id - Delete a post (own posts only)
router.delete('/posts/:id', requireAuth, async (req, res) => {
    try {
        const postId = req.params.id;
        const db = getDatabase();

        // Check if post belongs to user
        const post = await new Promise((resolve, reject) => {
            db.get(
                'SELECT user_id FROM forum_posts WHERE id = ?',
                [postId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found'
            });
        }

        if (post.user_id !== req.session.userId) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own posts'
            });
        }

        // Delete post
        await new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM forum_posts WHERE id = ?',
                [postId],
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
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete post'
        });
    }
});

module.exports = router;
