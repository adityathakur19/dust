require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import CORS

// Load API keys from environment variables
const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_SECRET = process.env.BINANCE_SECRET;
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;
const BITFINEX_API_KEY = process.env.BITFINEX_API_KEY;
const KRAKEN_API_KEY = process.env.KRAKEN_API_KEY;

const app = express();
app.use(cors()); 

const PORT = process.env.PORT || 5000;

app.use(express.json());

// Fetch price from Binance
const getBinancePrice = async (symbol) => {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    return parseFloat(response.data.price);
  } catch (error) {
    console.error('Error fetching Binance price:', error.response ? error.response.data : error.message);
    return null;
  }
};

// Fetch price from Coinbase
const getCoinbasePrice = async (symbol) => {
  try {
    const response = await axios.get(`https://api.coinbase.com/v2/prices/${symbol}/spot`);
    return parseFloat(response.data.data.amount);
  } catch (error) {
    console.error('Error fetching Coinbase price:', error.response ? error.response.data : error.message);
    return null;
  }
};

// Fetch price from Kraken
const getKrakenPrice = async (symbol) => {
  try {
    const response = await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${symbol}`);
    return parseFloat(response.data.result[symbol.toUpperCase()]['c'][0]);
  } catch (error) {
    console.error('Error fetching Kraken price:', error.response ? error.response.data : error.message);
    return null;
  }
};

// Fetch price from Bitfinex
const getBitfinexPrice = async (symbol) => {
  try {
    const response = await axios.get(`https://api.bitfinex.com/v2/tickers/${symbol}`);
    return parseFloat(response.data[0][7]); // Corrected to access the right value
  } catch (error) {
    console.error('Error fetching Bitfinex price:', error.response ? error.response.data : error.message);
    return null;
  }
};

app.get('/arbitrage', async (req, res) => {
  const { symbol } = req.query; 
  console.log('Received request for symbol:', symbol); 

  const binancePrice = await getBinancePrice(symbol);
  const coinbasePrice = await getCoinbasePrice(symbol); // Assuming 'symbol' is correct for Coinbase
  const krakenPrice = await getKrakenPrice(symbol);
  const bitfinexPrice = await getBitfinexPrice(symbol);

  console.log(`Binance Price: ${binancePrice}, Coinbase Price: ${coinbasePrice}, Kraken Price: ${krakenPrice}, Bitfinex Price: ${bitfinexPrice}`);

  // Respond with the prices or handle the error appropriately
  if (binancePrice && coinbasePrice && krakenPrice && bitfinexPrice) {
    res.json({
      binancePrice,
      coinbasePrice,
      krakenPrice,
      bitfinexPrice
    });
  } else {
    console.error('Error: Could not fetch all prices');
    res.status(500).json({ error: 'Error fetching prices.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
