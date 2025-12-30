const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes market data from city-data.com
 * Falls back to sample data if scraping fails
 */
class CityDataScraper {
    constructor() {
        this.baseUrl = 'https://www.city-data.com';
        this.delay = 2000; // 2 second delay between requests
    }

    /**
     * Sleep helper for rate limiting
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get sample data for Tennessee cities (fallback)
     */
    getSampleData(city) {
        const sampleData = {
            'Nashville': {
                market: {
                    city: 'Nashville',
                    state: 'TN',
                    population: 694144,
                    median_income: 64015,
                    median_home_value: 315900,
                    median_rent: 1350,
                    property_tax_rate: 0.68,
                    vacancy_rate: 6.2
                },
                historical: [
                    { year: 2010, population: 601222, median_income: 47372, median_home_value: 187500, median_rent: 850 },
                    { year: 2012, population: 624496, median_income: 48977, median_home_value: 198400, median_rent: 900 },
                    { year: 2014, population: 644014, median_income: 52028, median_home_value: 215700, median_rent: 975 },
                    { year: 2016, population: 667560, median_income: 56377, median_home_value: 251800, median_rent: 1090 },
                    { year: 2018, population: 678851, median_income: 60378, median_home_value: 283400, median_rent: 1200 },
                    { year: 2020, population: 689447, median_income: 62300, median_home_value: 298900, median_rent: 1280 },
                    { year: 2022, population: 694144, median_income: 64015, median_home_value: 315900, median_rent: 1350 }
                ],
                submarkets: [
                    { name: 'East Nashville', zip_code: '37206', vacancy_rate: 4.8, poverty_level: 12.3, median_rent: 1450, unemployment_rate: 3.2, median_income: 58400, renter_occupied_pct: 62.5, yoy_rent_growth: 7.2, population_density: 4200, median_age: 32.4, avg_household_size: 2.1, walk_score: 78, school_rating: 6.5 },
                    { name: 'The Gulch', zip_code: '37203', vacancy_rate: 5.1, poverty_level: 6.5, median_rent: 1850, unemployment_rate: 2.8, median_income: 82300, renter_occupied_pct: 78.2, yoy_rent_growth: 5.8, population_density: 5800, median_age: 29.1, avg_household_size: 1.8, walk_score: 92, school_rating: 7.2 },
                    { name: 'Green Hills', zip_code: '37215', vacancy_rate: 3.9, poverty_level: 5.2, median_rent: 1650, unemployment_rate: 2.1, median_income: 95200, renter_occupied_pct: 38.5, yoy_rent_growth: 4.3, population_density: 3100, median_age: 42.7, avg_household_size: 2.3, walk_score: 64, school_rating: 8.9 },
                    { name: 'Germantown', zip_code: '37208', vacancy_rate: 4.5, poverty_level: 8.7, median_rent: 1550, unemployment_rate: 3.0, median_income: 72500, renter_occupied_pct: 55.3, yoy_rent_growth: 6.5, population_density: 3800, median_age: 34.2, avg_household_size: 2.0, walk_score: 85, school_rating: 7.4 },
                    { name: 'Music Row', zip_code: '37212', vacancy_rate: 6.2, poverty_level: 9.4, median_rent: 1400, unemployment_rate: 3.5, median_income: 62100, renter_occupied_pct: 68.9, yoy_rent_growth: 5.9, population_density: 4500, median_age: 30.8, avg_household_size: 1.9, walk_score: 88, school_rating: 6.8 },
                    { name: 'Donelson', zip_code: '37214', vacancy_rate: 5.8, poverty_level: 11.2, median_rent: 1280, unemployment_rate: 4.1, median_income: 54200, renter_occupied_pct: 52.1, yoy_rent_growth: 4.8, population_density: 2800, median_age: 38.5, avg_household_size: 2.4, walk_score: 42, school_rating: 6.2 },
                    { name: 'Sylvan Park', zip_code: '37209', vacancy_rate: 4.2, poverty_level: 7.8, median_rent: 1520, unemployment_rate: 2.9, median_income: 78900, renter_occupied_pct: 45.7, yoy_rent_growth: 6.1, population_density: 3600, median_age: 35.9, avg_household_size: 2.2, walk_score: 72, school_rating: 7.8 },
                    { name: 'Crieve Hall', zip_code: '37211', vacancy_rate: 6.5, poverty_level: 10.5, median_rent: 1320, unemployment_rate: 3.7, median_income: 56800, renter_occupied_pct: 48.3, yoy_rent_growth: 5.2, population_density: 3200, median_age: 36.4, avg_household_size: 2.3, walk_score: 38, school_rating: 6.5 },
                    { name: 'Oak Hill', zip_code: '37220', vacancy_rate: 3.5, poverty_level: 4.8, median_rent: 1680, unemployment_rate: 2.4, median_income: 102500, renter_occupied_pct: 28.4, yoy_rent_growth: 3.9, population_density: 2100, median_age: 44.2, avg_household_size: 2.6, walk_score: 28, school_rating: 9.2 },
                    { name: 'Belle Meade', zip_code: '37205', vacancy_rate: 3.2, poverty_level: 2.9, median_rent: 2100, unemployment_rate: 1.8, median_income: 138700, renter_occupied_pct: 22.6, yoy_rent_growth: 3.2, population_density: 1800, median_age: 48.5, avg_household_size: 2.4, walk_score: 32, school_rating: 9.6 }
                ]
            },
            'Memphis': {
                market: {
                    city: 'Memphis',
                    state: 'TN',
                    population: 633104,
                    median_income: 42742,
                    median_home_value: 98200,
                    median_rent: 920,
                    property_tax_rate: 1.02,
                    vacancy_rate: 12.4
                },
                historical: [
                    { year: 2010, population: 646889, median_income: 39436, median_home_value: 92500, median_rent: 730 },
                    { year: 2012, population: 653450, median_income: 38982, median_home_value: 88900, median_rent: 750 },
                    { year: 2014, population: 653024, median_income: 37730, median_home_value: 85400, median_rent: 780 },
                    { year: 2016, population: 652236, median_income: 38230, median_home_value: 87200, median_rent: 820 },
                    { year: 2018, population: 650618, median_income: 40285, median_home_value: 91800, median_rent: 860 },
                    { year: 2020, population: 638700, median_income: 41228, median_home_value: 95100, median_rent: 890 },
                    { year: 2022, population: 633104, median_income: 42742, median_home_value: 98200, median_rent: 920 }
                ],
                submarkets: [
                    { name: 'Midtown', zip_code: '38104', vacancy_rate: 8.5, poverty_level: 18.7, median_rent: 1050, unemployment_rate: 5.8, median_income: 48200, renter_occupied_pct: 65.8, yoy_rent_growth: 4.5, population_density: 3900, median_age: 31.2, avg_household_size: 2.0, walk_score: 82, school_rating: 5.8 },
                    { name: 'East Memphis', zip_code: '38119', vacancy_rate: 6.2, poverty_level: 7.3, median_rent: 1180, unemployment_rate: 3.9, median_income: 72400, renter_occupied_pct: 42.3, yoy_rent_growth: 3.8, population_density: 2600, median_age: 40.5, avg_household_size: 2.3, walk_score: 48, school_rating: 8.1 },
                    { name: 'Germantown (Memphis)', zip_code: '38138', vacancy_rate: 4.1, poverty_level: 4.2, median_rent: 1450, unemployment_rate: 2.8, median_income: 98500, renter_occupied_pct: 24.7, yoy_rent_growth: 2.9, population_density: 1900, median_age: 45.3, avg_household_size: 2.7, walk_score: 35, school_rating: 9.3 },
                    { name: 'Downtown Memphis', zip_code: '38103', vacancy_rate: 11.3, poverty_level: 24.5, median_rent: 950, unemployment_rate: 7.2, median_income: 38900, renter_occupied_pct: 72.1, yoy_rent_growth: 5.2, population_density: 4200, median_age: 29.7, avg_household_size: 1.8, walk_score: 88, school_rating: 4.9 },
                    { name: 'Cordova', zip_code: '38016', vacancy_rate: 7.8, poverty_level: 9.8, median_rent: 1120, unemployment_rate: 4.5, median_income: 62300, renter_occupied_pct: 38.9, yoy_rent_growth: 4.1, population_density: 2200, median_age: 37.8, avg_household_size: 2.5, walk_score: 32, school_rating: 7.2 },
                    { name: 'Bartlett', zip_code: '38134', vacancy_rate: 5.9, poverty_level: 8.2, median_rent: 1080, unemployment_rate: 4.2, median_income: 68700, renter_occupied_pct: 35.4, yoy_rent_growth: 3.6, population_density: 2100, median_age: 39.2, avg_household_size: 2.6, walk_score: 28, school_rating: 7.6 },
                    { name: 'Parkway Village', zip_code: '38115', vacancy_rate: 10.5, poverty_level: 21.3, median_rent: 920, unemployment_rate: 6.8, median_income: 42100, renter_occupied_pct: 58.3, yoy_rent_growth: 3.2, population_density: 3200, median_age: 33.4, avg_household_size: 2.4, walk_score: 42, school_rating: 5.3 },
                    { name: 'Whitehaven', zip_code: '38109', vacancy_rate: 13.2, poverty_level: 28.9, median_rent: 850, unemployment_rate: 8.4, median_income: 35800, renter_occupied_pct: 48.7, yoy_rent_growth: 2.8, population_density: 2800, median_age: 36.1, avg_household_size: 2.7, walk_score: 38, school_rating: 4.2 },
                    { name: 'High Point Terrace', zip_code: '38111', vacancy_rate: 9.1, poverty_level: 17.4, median_rent: 980, unemployment_rate: 6.2, median_income: 46500, renter_occupied_pct: 52.6, yoy_rent_growth: 3.5, population_density: 3100, median_age: 34.8, avg_household_size: 2.2, walk_score: 45, school_rating: 5.7 },
                    { name: 'Raleigh', zip_code: '38117', vacancy_rate: 7.4, poverty_level: 14.6, median_rent: 1020, unemployment_rate: 5.5, median_income: 51200, renter_occupied_pct: 44.2, yoy_rent_growth: 4.2, population_density: 2700, median_age: 35.6, avg_household_size: 2.5, walk_score: 38, school_rating: 6.1 }
                ]
            },
            'Knoxville': {
                market: {
                    city: 'Knoxville',
                    state: 'TN',
                    population: 190740,
                    median_income: 45013,
                    median_home_value: 181200,
                    median_rent: 980,
                    property_tax_rate: 0.74,
                    vacancy_rate: 8.7
                },
                historical: [
                    { year: 2010, population: 178874, median_income: 35492, median_home_value: 138900, median_rent: 690 },
                    { year: 2012, population: 180130, median_income: 37156, median_home_value: 142300, median_rent: 720 },
                    { year: 2014, population: 184281, median_income: 38924, median_home_value: 148700, median_rent: 760 },
                    { year: 2016, population: 186239, median_income: 40782, median_home_value: 159400, median_rent: 820 },
                    { year: 2018, population: 187487, median_income: 42589, median_home_value: 168900, median_rent: 890 },
                    { year: 2020, population: 189339, median_income: 43821, median_home_value: 175200, median_rent: 940 },
                    { year: 2022, population: 190740, median_income: 45013, median_home_value: 181200, median_rent: 980 }
                ],
                submarkets: [
                    { name: 'Downtown Knoxville', zip_code: '37902', vacancy_rate: 7.2, poverty_level: 22.4, median_rent: 1100, unemployment_rate: 5.1, median_income: 41200, renter_occupied_pct: 68.5, yoy_rent_growth: 5.8, population_density: 3600, median_age: 30.4, avg_household_size: 1.9, walk_score: 84, school_rating: 5.2 },
                    { name: 'Sequoyah Hills', zip_code: '37919', vacancy_rate: 4.3, poverty_level: 3.8, median_rent: 1350, unemployment_rate: 2.3, median_income: 118500, renter_occupied_pct: 22.1, yoy_rent_growth: 3.1, population_density: 1600, median_age: 47.2, avg_household_size: 2.3, walk_score: 52, school_rating: 9.4 },
                    { name: 'Bearden', zip_code: '37919', vacancy_rate: 5.8, poverty_level: 6.5, median_rent: 1150, unemployment_rate: 3.4, median_income: 72800, renter_occupied_pct: 41.7, yoy_rent_growth: 4.5, population_density: 2400, median_age: 38.9, avg_household_size: 2.2, walk_score: 58, school_rating: 8.2 },
                    { name: 'West Knoxville', zip_code: '37922', vacancy_rate: 6.4, poverty_level: 8.9, median_rent: 1050, unemployment_rate: 3.8, median_income: 58900, renter_occupied_pct: 45.3, yoy_rent_growth: 4.2, population_density: 2200, median_age: 36.5, avg_household_size: 2.3, walk_score: 42, school_rating: 7.1 },
                    { name: 'Farragut', zip_code: '37934', vacancy_rate: 4.9, poverty_level: 4.1, median_rent: 1280, unemployment_rate: 2.7, median_income: 92300, renter_occupied_pct: 28.6, yoy_rent_growth: 3.6, population_density: 1800, median_age: 43.1, avg_household_size: 2.6, walk_score: 28, school_rating: 9.1 },
                    { name: 'North Knoxville', zip_code: '37917', vacancy_rate: 9.8, poverty_level: 17.6, median_rent: 850, unemployment_rate: 6.2, median_income: 38700, renter_occupied_pct: 52.8, yoy_rent_growth: 3.8, population_density: 2900, median_age: 33.7, avg_household_size: 2.4, walk_score: 48, school_rating: 5.4 },
                    { name: 'South Knoxville', zip_code: '37916', vacancy_rate: 8.5, poverty_level: 15.3, median_rent: 920, unemployment_rate: 5.8, median_income: 42800, renter_occupied_pct: 48.9, yoy_rent_growth: 4.6, population_density: 2700, median_age: 34.2, avg_household_size: 2.3, walk_score: 52, school_rating: 5.8 },
                    { name: 'East Knoxville', zip_code: '37920', vacancy_rate: 10.2, poverty_level: 19.8, median_rent: 800, unemployment_rate: 6.5, median_income: 36200, renter_occupied_pct: 55.3, yoy_rent_growth: 3.4, population_density: 3100, median_age: 32.8, avg_household_size: 2.5, walk_score: 44, school_rating: 4.9 },
                    { name: 'Fort Sanders', zip_code: '37921', vacancy_rate: 6.1, poverty_level: 28.5, median_rent: 950, unemployment_rate: 4.2, median_income: 28900, renter_occupied_pct: 82.4, yoy_rent_growth: 5.1, population_density: 4800, median_age: 22.3, avg_household_size: 1.7, walk_score: 76, school_rating: 6.2 },
                    { name: 'Fountain City', zip_code: '37918', vacancy_rate: 7.8, poverty_level: 11.9, median_rent: 980, unemployment_rate: 4.8, median_income: 51200, renter_occupied_pct: 42.1, yoy_rent_growth: 4.1, population_density: 2500, median_age: 37.4, avg_household_size: 2.4, walk_score: 38, school_rating: 6.8 },
                    { name: 'Cedar Bluff', zip_code: '37923', vacancy_rate: 5.2, poverty_level: 5.7, median_rent: 1220, unemployment_rate: 3.1, median_income: 81400, renter_occupied_pct: 35.2, yoy_rent_growth: 3.9, population_density: 2000, median_age: 41.6, avg_household_size: 2.4, walk_score: 34, school_rating: 8.4 }
                ]
            }
        };

        return sampleData[city] || null;
    }

    /**
     * Attempt to scrape real data from city-data.com
     * Currently returns sample data, but structure is in place for real scraping
     */
    async scrapeCity(cityName) {
        console.log(`Scraping data for ${cityName}...`);

        try {
            // For now, use sample data
            // In the future, this would make actual HTTP requests to city-data.com
            console.log(`Using sample data for ${cityName}`);
            return this.getSampleData(cityName);

            /*
            // Real scraping implementation (commented out for now):
            const url = `${this.baseUrl}/city/${cityName}-Tennessee.html`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);

            // Extract data from page
            const market = {
                city: cityName,
                state: 'TN',
                population: this.extractPopulation($),
                median_income: this.extractIncome($),
                median_home_value: this.extractHomeValue($),
                median_rent: this.extractRent($),
                property_tax_rate: this.extractTaxRate($),
                vacancy_rate: this.extractVacancyRate($)
            };

            // Add delay before next request
            await this.sleep(this.delay);

            return { market, historical: [], submarkets: [] };
            */

        } catch (error) {
            console.error(`Error scraping ${cityName}:`, error.message);
            console.log('Falling back to sample data');
            return this.getSampleData(cityName);
        }
    }

    /**
     * Scrape all Tennessee prototype cities
     */
    async scrapeAllCities() {
        const cities = ['Nashville', 'Memphis', 'Knoxville'];
        const results = [];

        for (const city of cities) {
            const data = await this.scrapeCity(city);
            if (data) {
                results.push(data);
            }
            await this.sleep(this.delay);
        }

        return results;
    }
}

module.exports = CityDataScraper;
