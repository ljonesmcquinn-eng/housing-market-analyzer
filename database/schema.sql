-- Markets table: stores city-level market data
CREATE TABLE IF NOT EXISTS markets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    population INTEGER,
    median_income INTEGER,
    median_home_value INTEGER,
    median_rent INTEGER,
    property_tax_rate REAL,
    vacancy_rate REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(city, state)
);

-- Historical data table: stores time-series data for markets
CREATE TABLE IF NOT EXISTS historical_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    population INTEGER,
    median_income INTEGER,
    median_home_value INTEGER,
    median_rent INTEGER,
    FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE,
    UNIQUE(market_id, year)
);

-- Submarkets table: stores neighborhood/ZIP code level data
CREATE TABLE IF NOT EXISTS submarkets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    zip_code TEXT,
    vacancy_rate REAL,
    poverty_level REAL,
    median_rent INTEGER,
    unemployment_rate REAL,
    median_income INTEGER,
    renter_occupied_pct REAL,
    yoy_rent_growth REAL,
    population_density INTEGER,
    median_age REAL,
    avg_household_size REAL,
    walk_score INTEGER,
    school_rating REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE,
    UNIQUE(market_id, name)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_markets_city_state ON markets(city, state);
CREATE INDEX IF NOT EXISTS idx_historical_market_year ON historical_data(market_id, year);
CREATE INDEX IF NOT EXISTS idx_submarkets_market ON submarkets(market_id);
