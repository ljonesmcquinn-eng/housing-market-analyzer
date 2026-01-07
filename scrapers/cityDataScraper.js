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
            },
            'Chattanooga': {
                market: {
                    city: 'Chattanooga',
                    state: 'TN',
                    population: 181099,
                    median_income: 47156,
                    median_home_value: 198500,
                    median_rent: 1050,
                    property_tax_rate: 0.82,
                    vacancy_rate: 9.3
                },
                historical: [
                    { year: 2010, population: 167674, median_income: 37059, median_home_value: 142800, median_rent: 740 },
                    { year: 2014, population: 173778, median_income: 40521, median_home_value: 158300, median_rent: 850 },
                    { year: 2018, population: 179806, median_income: 44382, median_home_value: 181200, median_rent: 970 },
                    { year: 2022, population: 181099, median_income: 47156, median_home_value: 198500, median_rent: 1050 }
                ],
                submarkets: [
                    { name: 'North Shore', zip_code: '37405', vacancy_rate: 6.8, poverty_level: 15.2, median_rent: 1180, unemployment_rate: 4.5, median_income: 52300, renter_occupied_pct: 58.4, yoy_rent_growth: 5.2, population_density: 3200, median_age: 33.1, avg_household_size: 2.1, walk_score: 74, school_rating: 6.4 },
                    { name: 'Hixson', zip_code: '37343', vacancy_rate: 7.2, poverty_level: 9.3, median_rent: 1020, unemployment_rate: 3.8, median_income: 59800, renter_occupied_pct: 42.5, yoy_rent_growth: 4.1, population_density: 2100, median_age: 38.6, avg_household_size: 2.5, walk_score: 32, school_rating: 7.2 }
                ]
            },
            'Clarksville': {
                market: {
                    city: 'Clarksville',
                    state: 'TN',
                    population: 166722,
                    median_income: 53842,
                    median_home_value: 185400,
                    median_rent: 1100,
                    property_tax_rate: 0.76,
                    vacancy_rate: 7.8
                },
                historical: [
                    { year: 2010, population: 132929, median_income: 44782, median_home_value: 138900, median_rent: 810 },
                    { year: 2014, population: 146026, median_income: 47956, median_home_value: 152300, median_rent: 920 },
                    { year: 2018, population: 158221, median_income: 50921, median_home_value: 169800, median_rent: 1020 },
                    { year: 2022, population: 166722, median_income: 53842, median_home_value: 185400, median_rent: 1100 }
                ],
                submarkets: [
                    { name: 'Downtown Clarksville', zip_code: '37040', vacancy_rate: 8.5, poverty_level: 14.6, median_rent: 980, unemployment_rate: 4.8, median_income: 45200, renter_occupied_pct: 62.1, yoy_rent_growth: 4.8, population_density: 2800, median_age: 29.4, avg_household_size: 2.3, walk_score: 58, school_rating: 5.9 },
                    { name: 'St. Bethlehem', zip_code: '37042', vacancy_rate: 6.2, poverty_level: 8.9, median_rent: 1180, unemployment_rate: 3.5, median_income: 62400, renter_occupied_pct: 38.7, yoy_rent_growth: 4.2, population_density: 1900, median_age: 35.2, avg_household_size: 2.7, walk_score: 28, school_rating: 7.5 }
                ]
            },
            'Murfreesboro': {
                market: {
                    city: 'Murfreesboro',
                    state: 'TN',
                    population: 152769,
                    median_income: 58324,
                    median_home_value: 248900,
                    median_rent: 1250,
                    property_tax_rate: 0.70,
                    vacancy_rate: 6.5
                },
                historical: [
                    { year: 2010, population: 108755, median_income: 48672, median_home_value: 168500, median_rent: 850 },
                    { year: 2014, population: 123814, median_income: 52139, median_home_value: 192300, median_rent: 980 },
                    { year: 2018, population: 141704, median_income: 55284, median_home_value: 223600, median_rent: 1150 },
                    { year: 2022, population: 152769, median_income: 58324, median_home_value: 248900, median_rent: 1250 }
                ],
                submarkets: [
                    { name: 'MTSU Area', zip_code: '37132', vacancy_rate: 7.8, poverty_level: 19.2, median_rent: 1100, unemployment_rate: 4.2, median_income: 42800, renter_occupied_pct: 68.5, yoy_rent_growth: 5.5, population_density: 3600, median_age: 24.8, avg_household_size: 2.0, walk_score: 62, school_rating: 6.2 },
                    { name: 'Gateway', zip_code: '37129', vacancy_rate: 5.1, poverty_level: 6.8, median_rent: 1350, unemployment_rate: 2.9, median_income: 72500, renter_occupied_pct: 42.3, yoy_rent_growth: 4.8, population_density: 2400, median_age: 36.9, avg_household_size: 2.6, walk_score: 35, school_rating: 8.1 }
                ]
            },
            'Franklin': {
                market: {
                    city: 'Franklin',
                    state: 'TN',
                    population: 83454,
                    median_income: 92847,
                    median_home_value: 485200,
                    median_rent: 1680,
                    property_tax_rate: 0.64,
                    vacancy_rate: 4.8
                },
                historical: [
                    { year: 2010, population: 62487, median_income: 78324, median_home_value: 342900, median_rent: 1180 },
                    { year: 2014, population: 71045, median_income: 83562, median_home_value: 389600, median_rent: 1340 },
                    { year: 2018, population: 78865, median_income: 88429, median_home_value: 438900, median_rent: 1520 },
                    { year: 2022, population: 83454, median_income: 92847, median_home_value: 485200, median_rent: 1680 }
                ],
                submarkets: [
                    { name: 'Downtown Franklin', zip_code: '37064', vacancy_rate: 4.2, poverty_level: 4.8, median_rent: 1750, unemployment_rate: 2.1, median_income: 98500, renter_occupied_pct: 38.2, yoy_rent_growth: 4.5, population_density: 2600, median_age: 39.4, avg_household_size: 2.4, walk_score: 72, school_rating: 8.8 },
                    { name: 'Cool Springs', zip_code: '37067', vacancy_rate: 5.3, poverty_level: 3.2, median_rent: 1620, unemployment_rate: 1.8, median_income: 115800, renter_occupied_pct: 28.5, yoy_rent_growth: 3.8, population_density: 2100, median_age: 42.1, avg_household_size: 2.6, walk_score: 42, school_rating: 9.3 }
                ]
            },
            'Jackson': {
                market: {
                    city: 'Jackson',
                    state: 'TN',
                    population: 68205,
                    median_income: 42156,
                    median_home_value: 132800,
                    median_rent: 850,
                    property_tax_rate: 0.88,
                    vacancy_rate: 11.2
                },
                historical: [
                    { year: 2010, population: 65211, median_income: 38942, median_home_value: 118500, median_rent: 680 },
                    { year: 2014, population: 67265, median_income: 39876, median_home_value: 122300, median_rent: 740 },
                    { year: 2018, population: 67802, median_income: 40985, median_home_value: 127600, median_rent: 800 },
                    { year: 2022, population: 68205, median_income: 42156, median_home_value: 132800, median_rent: 850 }
                ],
                submarkets: [
                    { name: 'Downtown Jackson', zip_code: '38301', vacancy_rate: 12.8, poverty_level: 22.5, median_rent: 780, unemployment_rate: 6.8, median_income: 36200, renter_occupied_pct: 58.9, yoy_rent_growth: 3.2, population_density: 2400, median_age: 32.8, avg_household_size: 2.2, walk_score: 54, school_rating: 5.1 },
                    { name: 'North Jackson', zip_code: '38305', vacancy_rate: 9.5, poverty_level: 12.3, median_rent: 920, unemployment_rate: 4.9, median_income: 51800, renter_occupied_pct: 42.1, yoy_rent_growth: 3.8, population_density: 1800, median_age: 37.5, avg_household_size: 2.5, walk_score: 32, school_rating: 6.8 }
                ]
            },
            'Johnson City': {
                market: {
                    city: 'Johnson City',
                    state: 'TN',
                    population: 71046,
                    median_income: 42987,
                    median_home_value: 168400,
                    median_rent: 920,
                    property_tax_rate: 0.79,
                    vacancy_rate: 9.8
                },
                historical: [
                    { year: 2010, population: 63152, median_income: 35628, median_home_value: 132900, median_rent: 680 },
                    { year: 2014, population: 66015, median_income: 38245, median_home_value: 145800, median_rent: 760 },
                    { year: 2018, population: 68935, median_income: 40782, median_home_value: 157200, median_rent: 850 },
                    { year: 2022, population: 71046, median_income: 42987, median_home_value: 168400, median_rent: 920 }
                ],
                submarkets: [
                    { name: 'Downtown Johnson City', zip_code: '37604', vacancy_rate: 10.5, poverty_level: 24.8, median_rent: 850, unemployment_rate: 5.8, median_income: 35900, renter_occupied_pct: 62.3, yoy_rent_growth: 4.2, population_density: 2800, median_age: 30.5, avg_household_size: 2.0, walk_score: 64, school_rating: 5.4 },
                    { name: 'West Johnson City', zip_code: '37615', vacancy_rate: 8.2, poverty_level: 11.9, median_rent: 980, unemployment_rate: 4.2, median_income: 52100, renter_occupied_pct: 38.6, yoy_rent_growth: 3.8, population_density: 1900, median_age: 39.2, avg_household_size: 2.4, walk_score: 38, school_rating: 7.1 }
                ]
            },
            'Bartlett': {
                market: {
                    city: 'Bartlett',
                    state: 'TN',
                    population: 59252,
                    median_income: 78456,
                    median_home_value: 224800,
                    median_rent: 1280,
                    property_tax_rate: 0.94,
                    vacancy_rate: 5.9
                },
                historical: [
                    { year: 2010, population: 54613, median_income: 68934, median_home_value: 182500, median_rent: 980 },
                    { year: 2014, population: 56892, median_income: 72145, median_home_value: 198300, median_rent: 1080 },
                    { year: 2018, population: 58254, median_income: 75628, median_home_value: 212600, median_rent: 1190 },
                    { year: 2022, population: 59252, median_income: 78456, median_home_value: 224800, median_rent: 1280 }
                ],
                submarkets: [
                    { name: 'North Bartlett', zip_code: '38133', vacancy_rate: 5.2, poverty_level: 5.8, median_rent: 1320, unemployment_rate: 3.2, median_income: 82300, renter_occupied_pct: 32.1, yoy_rent_growth: 3.8, population_density: 2100, median_age: 41.5, avg_household_size: 2.7, walk_score: 28, school_rating: 8.2 },
                    { name: 'Appling', zip_code: '38002', vacancy_rate: 6.8, poverty_level: 7.2, median_rent: 1240, unemployment_rate: 3.8, median_income: 72800, renter_occupied_pct: 38.9, yoy_rent_growth: 4.2, population_density: 1800, median_age: 38.6, avg_household_size: 2.6, walk_score: 24, school_rating: 7.5 }
                ]
            },
            'Hendersonville': {
                market: {
                    city: 'Hendersonville',
                    state: 'TN',
                    population: 61753,
                    median_income: 72589,
                    median_home_value: 298500,
                    median_rent: 1480,
                    property_tax_rate: 0.66,
                    vacancy_rate: 5.4
                },
                historical: [
                    { year: 2010, population: 51372, median_income: 62145, median_home_value: 218900, median_rent: 1080 },
                    { year: 2014, population: 55894, median_income: 66734, median_home_value: 248300, median_rent: 1220 },
                    { year: 2018, population: 59286, median_income: 69582, median_home_value: 276800, median_rent: 1360 },
                    { year: 2022, population: 61753, median_income: 72589, median_home_value: 298500, median_rent: 1480 }
                ],
                submarkets: [
                    { name: 'Old Hickory Lake', zip_code: '37075', vacancy_rate: 4.8, poverty_level: 4.9, median_rent: 1520, unemployment_rate: 2.8, median_income: 78900, renter_occupied_pct: 28.4, yoy_rent_growth: 4.2, population_density: 1900, median_age: 43.2, avg_household_size: 2.5, walk_score: 32, school_rating: 8.5 },
                    { name: 'Indian Lake', zip_code: '37075', vacancy_rate: 6.1, poverty_level: 6.2, median_rent: 1440, unemployment_rate: 3.2, median_income: 68200, renter_occupied_pct: 35.8, yoy_rent_growth: 3.9, population_density: 1700, median_age: 40.8, avg_household_size: 2.6, walk_score: 28, school_rating: 7.9 }
                ]
            },
            'Kingsport': {
                market: {
                    city: 'Kingsport',
                    state: 'TN',
                    population: 55442,
                    median_income: 44328,
                    median_home_value: 142600,
                    median_rent: 780,
                    property_tax_rate: 0.81,
                    vacancy_rate: 10.2
                },
                historical: [
                    { year: 2010, population: 48205, median_income: 38742, median_home_value: 118900, median_rent: 620 },
                    { year: 2014, population: 51274, median_income: 40856, median_home_value: 128500, median_rent: 680 },
                    { year: 2018, population: 53849, median_income: 42674, median_home_value: 136200, median_rent: 730 },
                    { year: 2022, population: 55442, median_income: 44328, median_home_value: 142600, median_rent: 780 }
                ],
                submarkets: [
                    { name: 'Downtown Kingsport', zip_code: '37660', vacancy_rate: 11.5, poverty_level: 19.8, median_rent: 720, unemployment_rate: 5.8, median_income: 38200, renter_occupied_pct: 55.2, yoy_rent_growth: 3.5, population_density: 2400, median_age: 36.4, avg_household_size: 2.2, walk_score: 52, school_rating: 5.6 },
                    { name: 'Colonial Heights', zip_code: '37663', vacancy_rate: 8.5, poverty_level: 10.2, median_rent: 840, unemployment_rate: 4.2, median_income: 52800, renter_occupied_pct: 38.9, yoy_rent_growth: 3.8, population_density: 1800, median_age: 42.1, avg_household_size: 2.5, walk_score: 35, school_rating: 7.2 }
                ]
            },
            'Smyrna': {
                market: {
                    city: 'Smyrna',
                    state: 'TN',
                    population: 53070,
                    median_income: 64782,
                    median_home_value: 235400,
                    median_rent: 1320,
                    property_tax_rate: 0.72,
                    vacancy_rate: 6.8
                },
                historical: [
                    { year: 2010, population: 39974, median_income: 54628, median_home_value: 162800, median_rent: 920 },
                    { year: 2014, population: 45820, median_income: 58234, median_home_value: 188900, median_rent: 1050 },
                    { year: 2018, population: 50667, median_income: 61856, median_home_value: 214600, median_rent: 1210 },
                    { year: 2022, population: 53070, median_income: 64782, median_home_value: 235400, median_rent: 1320 }
                ],
                submarkets: [
                    { name: 'Downtown Smyrna', zip_code: '37167', vacancy_rate: 7.2, poverty_level: 8.9, median_rent: 1280, unemployment_rate: 3.5, median_income: 61200, renter_occupied_pct: 48.5, yoy_rent_growth: 4.8, population_density: 2200, median_age: 34.8, avg_household_size: 2.6, walk_score: 42, school_rating: 7.1 },
                    { name: 'Lee Victory', zip_code: '37167', vacancy_rate: 6.1, poverty_level: 5.8, median_rent: 1360, unemployment_rate: 2.9, median_income: 71500, renter_occupied_pct: 42.1, yoy_rent_growth: 4.5, population_density: 1900, median_age: 36.2, avg_household_size: 2.7, walk_score: 35, school_rating: 7.8 }
                ]
            },
            'Brentwood': {
                market: {
                    city: 'Brentwood',
                    state: 'TN',
                    population: 45373,
                    median_income: 128945,
                    median_home_value: 642800,
                    median_rent: 2180,
                    property_tax_rate: 0.62,
                    vacancy_rate: 3.8
                },
                historical: [
                    { year: 2010, population: 37060, median_income: 112834, median_home_value: 498500, median_rent: 1680 },
                    { year: 2014, population: 40982, median_income: 118562, median_home_value: 548900, median_rent: 1850 },
                    { year: 2018, population: 43468, median_income: 124289, median_home_value: 598600, median_rent: 2020 },
                    { year: 2022, population: 45373, median_income: 128945, median_home_value: 642800, median_rent: 2180 }
                ],
                submarkets: [
                    { name: 'Brentwood Estates', zip_code: '37027', vacancy_rate: 3.2, poverty_level: 2.1, median_rent: 2280, unemployment_rate: 1.5, median_income: 142500, renter_occupied_pct: 18.5, yoy_rent_growth: 3.2, population_density: 1400, median_age: 48.6, avg_household_size: 2.8, walk_score: 22, school_rating: 9.7 },
                    { name: 'Governors Club', zip_code: '37027', vacancy_rate: 4.5, poverty_level: 3.2, median_rent: 2080, unemployment_rate: 1.9, median_income: 118900, renter_occupied_pct: 24.8, yoy_rent_growth: 3.5, population_density: 1200, median_age: 45.2, avg_household_size: 2.6, walk_score: 18, school_rating: 9.5 }
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
        const cities = [
            'Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville',
            'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City', 'Bartlett',
            'Hendersonville', 'Kingsport', 'Smyrna', 'Brentwood'
        ];
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
