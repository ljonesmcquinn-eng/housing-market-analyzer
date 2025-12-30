# Housing Market Analyzer

A web application for analyzing real estate markets with comprehensive demographic and economic data. Features interactive charts, historical trends, and neighborhood-level submarket analysis.

## Features

### Market-Level Analysis
- **Population growth** tracking over 10+ years
- **Household income trends** with historical data
- **Home value appreciation** charts
- **Rental market metrics** including median rent
- **Property tax rates** by market
- **Rent-to-value ratio** calculation

### Submarket Analysis
- Neighborhood-level data with ZIP codes
- Vacancy rates
- Poverty levels
- Median rent by neighborhood
- Unemployment rates
- Sortable comparison table

### Market Comparison
- **Bookmark multiple markets** for quick access
- **Side-by-side comparison** of all key metrics
- **Comparison charts** showing historical trends across markets
- **Color-coded legends** to distinguish between cities
- Saved in browser (persists across sessions)

### Property Investment Analysis
- **Long-term rental analysis** with Rentcast.io integration
- **IRR (Internal Rate of Return)** calculation with 5-year holding period
- **Cash on Cash Return** calculations
- **Maximum purchase price calculator** based on target yields
- **Comprehensive financing options:**
  - Cash purchase vs. financing toggle
  - Fixed rate mortgages
  - ARM (Adjustable Rate Mortgages) with 10+ types
  - Custom amortization terms
  - Bi-weekly payment options
  - Prepayment penalty modeling
- **Operating expense modeling:**
  - Auto-calculated property tax by city
  - Insurance, HOA, CapEx, and maintenance
  - Vacancy rate adjustments
- **Detailed cash flow analysis:**
  - Monthly and annual projections
  - NOI (Net Operating Income) calculations
  - Cap rate calculations

### Prototype Markets
Currently includes data for three Tennessee cities:
- **Nashville** - 6 submarkets
- **Memphis** - 6 submarkets
- **Knoxville** - 6 submarkets

## Technology Stack

**Backend:**
- Node.js + Express
- SQLite database
- RESTful API

**Frontend:**
- Vanilla JavaScript (no frameworks)
- HTML5 Canvas for charts
- Responsive CSS design

**Data:**
- Sample data for prototype (structured for easy expansion)
- Web scraper framework ready for city-data.com integration

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Setup Steps

1. **Navigate to project directory:**
   ```bash
   cd housing-market-analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Populate the database:**
   ```bash
   npm run scrape
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

That's it! The application should now be running.

## Usage

### Analyzing a Market

1. Select a city from the dropdown menu
2. Click "Analyze Market" button
3. View comprehensive market data including:
   - Current population, income, home values, and rent
   - Property tax rate and rent-to-value ratio
   - Historical trend charts for key metrics

### Exploring Submarkets

1. After viewing market data, click "Analyze Submarkets" button
2. Browse neighborhood-level data in an interactive table
3. Click column headers to sort by any metric
4. Color coding indicates:
   - **Green** - Favorable conditions
   - **Orange** - Average conditions
   - **Red** - Areas of concern

### Bookmarking and Comparing Markets

1. **Bookmark a market:**
   - After analyzing a market, click the **☆ Bookmark** button
   - Button changes to **★ Bookmarked** when saved
   - Bookmarked markets appear in a panel at the top

2. **Compare markets:**
   - Bookmark 2 or more markets
   - Click **Compare Markets →** button in the bookmarks panel
   - View side-by-side comparison cards with all current metrics
   - See historical trend charts comparing all bookmarked markets

3. **Manage bookmarks:**
   - Click the **×** next to any bookmarked city to remove it
   - Bookmarks are saved in your browser (persist across sessions)

### Navigation

- **Back to Market View** - Return to city-level data
- **Back to Selection** - Choose a different city
- **Compare Markets** - View side-by-side comparison (when 2+ bookmarked)

## Project Structure

```
housing-market-analyzer/
├── database/
│   ├── db.js                 # Database connection and queries
│   ├── schema.sql            # Database table definitions
│   └── markets.db            # SQLite database (created on first run)
├── scrapers/
│   ├── cityDataScraper.js    # Web scraper logic
│   └── scrapeRunner.js       # Database population script
├── routes/
│   └── api.js                # API endpoints
├── public/
│   └── index.html            # Frontend application
├── server.js                 # Express server
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
└── README.md                 # This file
```

## API Endpoints

### GET /api/markets
Returns list of all available markets.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "markets": [
    { "id": 1, "city": "Nashville", "state": "TN" },
    ...
  ]
}
```

### GET /api/markets/:city
Returns detailed market data for a specific city.

**Example:** `/api/markets/Nashville`

**Response:**
```json
{
  "success": true,
  "market": {
    "name": "Nashville",
    "state": "TN",
    "current": {
      "population": 694144,
      "medianIncome": 64015,
      "medianHomeValue": 315900,
      "medianRent": 1350,
      "propertyTaxRate": 0.68,
      "vacancyRate": 6.2,
      "rentToValueRatio": 5.13
    },
    "historical": [
      {
        "year": 2010,
        "population": 601222,
        "medianIncome": 47372,
        "medianHomeValue": 187500,
        "medianRent": 850
      },
      ...
    ]
  }
}
```

### GET /api/markets/:city/submarkets
Returns submarket data for a specific city.

**Example:** `/api/markets/Nashville/submarkets`

**Response:**
```json
{
  "success": true,
  "city": "Nashville",
  "count": 6,
  "submarkets": [
    {
      "name": "East Nashville",
      "zipCode": "37206",
      "vacancyRate": 4.8,
      "povertyLevel": 12.3,
      "medianRent": 1450,
      "unemploymentRate": 3.2
    },
    ...
  ]
}
```

## Environment Variables

Create or modify `.env` file:

```bash
PORT=3000                        # Server port (default: 3000)
DB_PATH=./database/markets.db    # Database location
NODE_ENV=development             # Environment (development/production)
```

## NPM Scripts

- `npm start` - Start the Express server
- `npm run scrape` - Run scraper to populate database

## Expanding the Dataset

### Adding New Cities

1. **Edit the scraper** (`scrapers/cityDataScraper.js`):
   - Add new city data to `getSampleData()` method
   - Or implement real scraping logic (commented structure provided)

2. **Add to scraper runner** (`scrapers/scrapeRunner.js`):
   - Add city name to `cities` array in `scrapeAllCities()`

3. **Run the scraper:**
   ```bash
   npm run scrape
   ```

### Implementing Live Scraping

The scraper includes a framework for scraping city-data.com:

1. Uncomment the scraping code in `cityDataScraper.js`
2. Implement data extraction methods:
   - `extractPopulation($)`
   - `extractIncome($)`
   - `extractHomeValue($)`
   - etc.

3. **Important:** Be respectful of website terms of service and implement:
   - Rate limiting (already included)
   - User-agent rotation
   - Error handling
   - Caching

## Future Enhancements

### Planned Features
- [ ] Real-time data from Census Bureau API
- [ ] Additional markets (all US cities)
- [ ] Market comparison (side-by-side)
- [ ] Export to CSV/PDF
- [ ] User authentication and saved searches
- [ ] Email alerts for market changes
- [ ] Mobile app version
- [ ] Investment analysis tools

### Data Sources
- **Current:** Sample data based on typical market patterns
- **Future:**
  - Census Bureau API (free, official)
  - city-data.com (web scraping)
  - Real estate APIs (Zillow, Realtor.com - requires subscription)

## Deployment

### Deploy to Render.com (Recommended - Free Tier Available)

This app is configured for one-click deployment to Render.com:

1. **Push code to GitHub:**
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com) and sign up/log in
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Render will auto-detect the configuration from `render.yaml`
   - Click **"Create Web Service"**

3. **Your site will be live at:**
   ```
   https://your-app-name.onrender.com
   ```

4. **Optional: Add custom domain:**
   - Go to your service settings
   - Add custom domain
   - Update DNS records as instructed

**Note:** Free tier sleeps after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

### Alternative Deployment Options

#### Railway (Free Tier)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

#### Vercel (Edge Functions)
```bash
npm install -g vercel
vercel
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Auto-detect Node.js app
3. Deploy

### Local Development
Already configured! Just run `npm start`

## Troubleshooting

### Database errors
- Ensure `database/` directory exists
- Run `npm run scrape` to recreate database
- Check file permissions

### Port already in use
- Change PORT in `.env` file
- Or kill existing process: `lsof -ti:3000 | xargs kill`

### Charts not displaying
- Check browser console for JavaScript errors
- Ensure Canvas API is supported (all modern browsers)

### API not responding
- Verify server is running: `npm start`
- Check console for error messages
- Test endpoints directly: `curl http://localhost:3000/api/markets`

## License

MIT License - feel free to use and modify for your projects.

## Contributing

This is a prototype application. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For questions or issues:
- Check this README
- Review code comments
- Test API endpoints with `curl` or Postman

---

**Built with ❤️ for real estate market analysis**
