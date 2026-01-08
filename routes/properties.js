const express = require('express');
const { getDatabase } = require('../database/db');
const { requireAuth } = require('./auth');

const router = express.Router();

// POST /api/properties - Save a property analysis
router.post('/', requireAuth, async (req, res) => {
    try {
        const {
            address,
            max_purchase_price,
            purchase_price,
            down_payment_percent,
            interest_rate,
            loan_term,
            monthly_rent,
            property_tax,
            insurance,
            hoa,
            maintenance,
            capex,
            vacancy_rate,
            monthly_payment,
            monthly_noi,
            cash_on_cash_return,
            cap_rate,
            total_cash_needed,
            irr
        } = req.body;

        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Address is required'
            });
        }

        const db = getDatabase();

        const result = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO saved_properties (
                    user_id, address, max_purchase_price, purchase_price,
                    down_payment_percent, interest_rate, loan_term,
                    monthly_rent, property_tax, insurance, hoa,
                    maintenance, capex, vacancy_rate, monthly_payment,
                    monthly_noi, cash_on_cash_return, cap_rate,
                    total_cash_needed, irr
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.session.userId, address, max_purchase_price, purchase_price,
                    down_payment_percent, interest_rate, loan_term,
                    monthly_rent, property_tax, insurance, hoa,
                    maintenance, capex, vacancy_rate, monthly_payment,
                    monthly_noi, cash_on_cash_return, cap_rate,
                    total_cash_needed, irr
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve(this);
                }
            );
        });

        res.json({
            success: true,
            propertyId: result.lastID
        });
    } catch (error) {
        console.error('Save property error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save property'
        });
    }
});

// GET /api/properties - Get user's saved properties
router.get('/', requireAuth, async (req, res) => {
    try {
        const db = getDatabase();

        const properties = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM saved_properties
                WHERE user_id = ?
                ORDER BY created_at DESC`,
                [req.session.userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.json({
            success: true,
            properties
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get properties'
        });
    }
});

// DELETE /api/properties/:id - Delete a saved property
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const propertyId = req.params.id;
        const db = getDatabase();

        // Check ownership
        const property = await new Promise((resolve, reject) => {
            db.get(
                'SELECT user_id FROM saved_properties WHERE id = ?',
                [propertyId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        if (property.user_id !== req.session.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }

        await new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM saved_properties WHERE id = ?',
                [propertyId],
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
        console.error('Delete property error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete property'
        });
    }
});

module.exports = router;
