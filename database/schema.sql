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

-- Users table: stores user accounts for authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active INTEGER DEFAULT 1
);

-- Forum categories table: stores the main forum sections
CREATE TABLE IF NOT EXISTS forum_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Forum threads table: stores discussion threads
CREATE TABLE IF NOT EXISTS forum_threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    is_locked INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forum posts table: stores individual posts/replies in threads
CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    is_edited INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Post likes table: tracks which users liked which posts
CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id)
);

-- Create indexes for forum tables
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_threads_user ON forum_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_thread ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

-- Saved properties table: stores user's saved property analyses
CREATE TABLE IF NOT EXISTS saved_properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    address TEXT NOT NULL,
    max_purchase_price REAL,
    purchase_price REAL,
    down_payment_percent REAL,
    interest_rate REAL,
    loan_term INTEGER,
    monthly_rent REAL,
    property_tax REAL,
    insurance REAL,
    hoa REAL,
    maintenance REAL,
    capex REAL,
    vacancy_rate REAL,
    monthly_payment REAL,
    monthly_noi REAL,
    cash_on_cash_return REAL,
    cap_rate REAL,
    total_cash_needed REAL,
    irr REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON saved_properties(user_id);

-- Insert default forum categories
INSERT OR IGNORE INTO forum_categories (id, name, description, icon, display_order) VALUES
(1, 'Market Discussion', 'Discuss housing markets, trends, and investment opportunities', '📊', 1),
(2, 'Real Estate Strategies', 'Share strategies, tips, and experiences in real estate investing', '💡', 2),
(3, 'Professional Hub', 'Connect with brokers, agents, lenders, contractors, and tax professionals', '🤝', 3),
(4, 'Feature Requests & Feedback', 'Suggest new features and provide feedback on the platform', '💬', 4);
