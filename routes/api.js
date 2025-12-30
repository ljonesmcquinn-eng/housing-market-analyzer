const express = require('express');
const router = express.Router();
const { all, get } = require('../database/db');

/**
 * GET /api/markets
 * Returns list of all available markets
 */
router.get('/markets', async (req, res) => {
    try {
        const markets = await all(
            'SELECT id, city, state FROM markets ORDER BY city'
        );

        res.json({
            success: true,
            count: markets.length,
            markets: markets
        });
    } catch (error) {
        console.error('Error fetching markets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch markets'
        });
    }
});

/**
 * GET /api/markets/:city
 * Returns detailed market data for a specific city
 */
router.get('/markets/:city', async (req, res) => {
    try {
        const cityName = req.params.city;

        // Get market data
        const market = await get(
            `SELECT * FROM markets WHERE LOWER(city) = LOWER(?)`,
            [cityName]
        );

        if (!market) {
            return res.status(404).json({
                success: false,
                error: `Market not found: ${cityName}`
            });
        }

        // Get historical data
        const historical = await all(
            `SELECT year, population, median_income, median_home_value, median_rent
             FROM historical_data
             WHERE market_id = ?
             ORDER BY year`,
            [market.id]
        );

        // Calculate rent-to-value ratio (annual rent as % of home value)
        const rentToValueRatio = market.median_home_value > 0
            ? ((market.median_rent * 12) / market.median_home_value * 100).toFixed(2)
            : 0;

        res.json({
            success: true,
            market: {
                name: market.city,
                state: market.state,
                current: {
                    population: market.population,
                    medianIncome: market.median_income,
                    medianHomeValue: market.median_home_value,
                    medianRent: market.median_rent,
                    propertyTaxRate: market.property_tax_rate,
                    vacancyRate: market.vacancy_rate,
                    rentToValueRatio: parseFloat(rentToValueRatio)
                },
                historical: historical.map(h => ({
                    year: h.year,
                    population: h.population,
                    medianIncome: h.median_income,
                    medianHomeValue: h.median_home_value,
                    medianRent: h.median_rent
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching market data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market data'
        });
    }
});

/**
 * GET /api/markets/:city/submarkets
 * Returns submarket data for a specific city
 */
router.get('/markets/:city/submarkets', async (req, res) => {
    try {
        const cityName = req.params.city;

        // Get market ID
        const market = await get(
            `SELECT id FROM markets WHERE LOWER(city) = LOWER(?)`,
            [cityName]
        );

        if (!market) {
            return res.status(404).json({
                success: false,
                error: `Market not found: ${cityName}`
            });
        }

        // Get submarkets
        const submarkets = await all(
            `SELECT name, zip_code, vacancy_rate, poverty_level, median_rent, unemployment_rate,
                    median_income, renter_occupied_pct, yoy_rent_growth, population_density,
                    median_age, avg_household_size, walk_score, school_rating
             FROM submarkets
             WHERE market_id = ?
             ORDER BY name`,
            [market.id]
        );

        res.json({
            success: true,
            city: cityName,
            count: submarkets.length,
            submarkets: submarkets.map(s => ({
                name: s.name,
                zipCode: s.zip_code,
                vacancyRate: s.vacancy_rate,
                povertyLevel: s.poverty_level,
                medianRent: s.median_rent,
                unemploymentRate: s.unemployment_rate,
                medianIncome: s.median_income,
                renterOccupiedPct: s.renter_occupied_pct,
                yoyRentGrowth: s.yoy_rent_growth,
                populationDensity: s.population_density,
                medianAge: s.median_age,
                avgHouseholdSize: s.avg_household_size,
                walkScore: s.walk_score,
                schoolRating: s.school_rating
            }))
        });
    } catch (error) {
        console.error('Error fetching submarket data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch submarket data'
        });
    }
});

module.exports = router;
