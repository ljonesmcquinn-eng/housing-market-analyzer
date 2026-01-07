require('dotenv').config();
const CityDataScraper = require('./cityDataScraper');
const { initializeDatabase, run, close } = require('../database/db');

/**
 * Populate database with scraped market data
 */
async function populateDatabase() {
    try {
        console.log('Initializing database...');
        await initializeDatabase();

        console.log('Starting scraper...');
        const scraper = new CityDataScraper();
        const citiesData = await scraper.scrapeAllCities();

        console.log(`\nProcessing ${citiesData.length} cities...`);

        for (const cityData of citiesData) {
            const { market, historical, submarkets } = cityData;

            console.log(`\nProcessing ${market.city}, ${market.state}...`);

            // Insert or update market
            const marketResult = await run(
                `INSERT OR REPLACE INTO markets
                (city, state, population, median_income, median_home_value, median_rent, property_tax_rate, vacancy_rate, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [
                    market.city,
                    market.state,
                    market.population,
                    market.median_income,
                    market.median_home_value,
                    market.median_rent,
                    market.property_tax_rate,
                    market.vacancy_rate
                ]
            );

            const marketId = marketResult.id;
            console.log(`  ✓ Market data inserted (ID: ${marketId})`);

            // Insert historical data
            if (historical && historical.length > 0) {
                for (const record of historical) {
                    await run(
                        `INSERT OR REPLACE INTO historical_data
                        (market_id, year, population, median_income, median_home_value, median_rent)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            marketId,
                            record.year,
                            record.population,
                            record.median_income,
                            record.median_home_value,
                            record.median_rent
                        ]
                    );
                }
                console.log(`  ✓ ${historical.length} historical records inserted`);
            }

            // Insert submarkets
            if (submarkets && submarkets.length > 0) {
                for (const submarket of submarkets) {
                    await run(
                        `INSERT OR REPLACE INTO submarkets
                        (market_id, name, zip_code, vacancy_rate, poverty_level, median_rent, unemployment_rate,
                         median_income, renter_occupied_pct, yoy_rent_growth, population_density,
                         median_age, avg_household_size, walk_score, school_rating, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                        [
                            marketId,
                            submarket.name,
                            submarket.zip_code,
                            submarket.vacancy_rate,
                            submarket.poverty_level,
                            submarket.median_rent,
                            submarket.unemployment_rate,
                            submarket.median_income,
                            submarket.renter_occupied_pct,
                            submarket.yoy_rent_growth,
                            submarket.population_density,
                            submarket.median_age,
                            submarket.avg_household_size,
                            submarket.walk_score,
                            submarket.school_rating
                        ]
                    );
                }
                console.log(`  ✓ ${submarkets.length} submarkets inserted`);
            }
        }

        console.log('\n✅ Database population complete!');
        console.log(`Total cities processed: ${citiesData.length}`);

    } catch (error) {
        console.error('❌ Error populating database:', error);
        process.exit(1);
    } finally {
        await close();
        console.log('Database connection closed.');
    }
}

// Run if called directly
if (require.main === module) {
    populateDatabase();
}

module.exports = { populateDatabase };
