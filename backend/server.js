


const express = require('express');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

const API_KEY = '6CfaYVp2mv8mkfQPndT5kspSohDS_oGr';
const stocksListFile = 'stocks.json';

app.use(express.json());
app.use(cors());

let stocksData = [];

// Fetches the list of 20 stocks 
async function fetchStocksData() {
  try {
    const response = await axios.get( `https://api.polygon.io/v2/aggs/ticker/TSLA/range/1/minute/2023-08-01/2023-08-01?limit=20&apiKey=${API_KEY}`);
    
    
    console.log(response.data);
    const stocks = response.data.results.map(stock => ({ ticker: stock.ticker, openPrice: stock.c }));
    stocksData = stocks.map(stock => ({ ...stock, refreshInterval: Math.floor(Math.random() * 5) + 1, price: parseFloat(stock.openPrice) })); // Initialize price with openPrice as a float
    fs.writeFileSync(stocksListFile, JSON.stringify(stocksData));
    console.log('Stocks data fetched and saved.');
  } catch (error) {
    console.error('Error fetching stocks data:', error.message);
  }
}

// Updates stock prices 
function updateStockPrices() {
  setInterval(() => {
    stocksData.forEach(stock => {
      stock.price = (parseFloat(stock.openPrice) * (1 + Math.random() * 0.1)).toFixed(2); // Convert openPrice to float before calculation
    });
    fs.writeFileSync(stocksListFile, JSON.stringify(stocksData));
  }, 1000);
}

// Fetch stock prices
app.get('/stocks', (req, res) => {
  try {
    const stocks = JSON.parse(fs.readFileSync(stocksListFile, 'utf8'));
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

fetchStocksData();
updateStockPrices();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

















