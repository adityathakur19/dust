require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const EXCHANGES = {
  BINANCE: 'Binance',
  COINBASE: 'Coinbase',
  KRAKEN: 'Kraken',
  BITFINEX: 'Bitfinex',
  HUOBI: 'Huobi',
  KUCOIN: 'KuCoin',
  OKEX: 'OKEx',
  GATEIO: 'Gate.io',
  BYBIT: 'Bybit',
  GEMINI: 'Gemini',
  BITSTAMP: 'Bitstamp',
  COINGECKO: 'CoinGecko',
  ASCENDEX: 'Ascendex',
  AZBIT: 'Azbit',
  BICONOMY: 'Biconomy',
  BIGONE: 'Bigone',
  BINGX: 'Bingx',
  BITBNS: 'Bitbns',
  BITDELTA: 'Bitdelta',
  BITGET: 'Bitget',
  BITHUMB: 'Bithumb',
  BITKUB: 'Bitkub',
  BITMART: 'Bitmart',
  BITRUE: 'Bitrue',
  BITSO: 'Bitso',
  BLOCKCHAIN: 'Blockchain.com',
  BTCTURK: 'Btcturk',
  BTSE: 'Btse',
  CEXIO: 'Cex.io',
  CHANGELLY: 'Changelly',
};

const SYMBOLS = [
  'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'UNI', 'LTC', 'LINK',
  'SOL', 'MATIC', 'AVAX', 'ATOM', 'TRX', 'SHIB', 'XLM', 'BCH', 'FIL', 'EOS',
  'ICP', 'AVAX', 'NEAR', 'AAVE', 'FTM', 'BAT', 'ZEC', 'CRO', 'ALGO', 'MKR',
   'XDC', 'SAND', 'ETC', 'DASH', 'CHZ'
];

const BASE_CURRENCIES = ['USD', 'USDT', 'BTC'];

const getPrice = async (exchange, symbol, baseCurrency) => {
  try {
    let response;
    const tradingPair = `${symbol}${baseCurrency}`;
    switch (exchange) {
      case EXCHANGES.BINANCE:
        response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${tradingPair}`);
        return parseFloat(response.data.price) || null;
      case EXCHANGES.COINBASE:
        response = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${symbol}`);
        return parseFloat(response.data.data.rates[baseCurrency.toUpperCase()]) || null;
      case EXCHANGES.KRAKEN:
        response = await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${symbol}${baseCurrency}`);
        const krakenSymbol = Object.keys(response.data.result)[0];
        return parseFloat(response.data.result[krakenSymbol].c[0]) || null;
      case EXCHANGES.BITFINEX:
        response = await axios.get(`https://api-pub.bitfinex.com/v2/ticker/t${symbol}${baseCurrency}`);
        return parseFloat(response.data[6]) || null;
      case EXCHANGES.HUOBI:
        response = await axios.get(`https://api.huobi.pro/market/detail/merged?symbol=${symbol.toLowerCase()}${baseCurrency.toLowerCase()}`);
        return parseFloat(response.data.tick?.bid[0]) || null;
      case EXCHANGES.KUCOIN:
        response = await axios.get(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}-${baseCurrency}`);
        return parseFloat(response.data.data.price) || null;
      case EXCHANGES.OKEX:
        response = await axios.get(`https://www.okex.com/api/v5/market/ticker?instId=${symbol}-${baseCurrency}`);
        return parseFloat(response.data.data[0].last) || null;
      case EXCHANGES.GATEIO:
        response = await axios.get(`https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${symbol}_${baseCurrency}`);
        return parseFloat(response.data[0]?.last) || null;
      case EXCHANGES.BYBIT:
        response = await axios.get(`https://api.bybit.com/v2/public/tickers?symbol=${symbol}${baseCurrency}`);
        return parseFloat(response.data.result[0]?.last_price) || null;
      case EXCHANGES.GEMINI:
        response = await axios.get(`https://api.gemini.com/v1/pubticker/${symbol}${baseCurrency}`);
        return parseFloat(response.data?.last) || null;
      case EXCHANGES.BITSTAMP:
        response = await axios.get(`https://www.bitstamp.net/api/v2/ticker/${symbol.toLowerCase()}${baseCurrency.toLowerCase()}`);
        return parseFloat(response.data?.last) || null;
      case EXCHANGES.COINGECKO:
        response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=${baseCurrency.toLowerCase()}`);
        return response.data[symbol.toLowerCase()]?.[baseCurrency.toLowerCase()] || null;
      case EXCHANGES.ASCENDEX:
        response = await axios.get(`https://ascendex.com/api/pro/v1/market/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.data[0]?.last) || null;
      case EXCHANGES.AZBIT:
        response = await axios.get(`https://api.azbit.com/v1/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.data.last) || null;
      case EXCHANGES.BICONOMY:
        response = await axios.get(`https://api.biconomy.io/v1/tickers/${tradingPair}`);
        return parseFloat(response.data.price) || null;
      case EXCHANGES.BIGONE:
        response = await axios.get(`https://big.one/api/v3/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.data.last) || null;
      case EXCHANGES.BINGX:
        response = await axios.get(`https://api.bingx.com/v1/market/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.data[0]?.last) || null;
      case EXCHANGES.BITBNS:
        response = await axios.get(`https://bitbns.com/api/v2/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.data.ticker.last) || null;
      case EXCHANGES.BITDELTA:
        response = await axios.get(`https://api.bitdelta.net/api/v1/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.data.price) || null;
      case EXCHANGES.BITGET:
        response = await axios.get(`https://api.bitget.com/api/v1/market/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.data.last) || null;
      case EXCHANGES.BITHUMB:
        response = await axios.get(`https://api.bithumb.com/public/ticker/${symbol}${baseCurrency}`);
        return parseFloat(response.data.data.last_price) || null;
      case EXCHANGES.BITKUB:
        response = await axios.get(`https://api.bitkub.com/api/market/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.result.last) || null;
      case EXCHANGES.BITMART:
        response = await axios.get(`https://api-cloud.bitmart.com/spot/v1/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.data.last_price) || null;
      case EXCHANGES.BITRUE:
        response = await axios.get(`https://api.bitrue.com/api/v1/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.data.price) || null;
      case EXCHANGES.BITSO:
        response = await axios.get(`https://api.bitso.com/v3/tickers/${tradingPair}`);
        return parseFloat(response.data.payload.last) || null;
      case EXCHANGES.BLOCKCHAIN:
        response = await axios.get(`https://api.blockchain.com/v3/exchange/tickers/${tradingPair}`);
        return parseFloat(response.data.last) || null;
      case EXCHANGES.BTCTURK:
        response = await axios.get(`https://api.btcturk.com/api/v2/ticker?pair=${tradingPair}`);
        return parseFloat(response.data.data.last) || null;
      case EXCHANGES.BTSE:
        response = await axios.get(`https://api.btse.com/api/v1/ticker?symbol=${tradingPair}`);
        return parseFloat(response.data.data.last) || null;
      case EXCHANGES.CEXIO:
        response = await axios.get(`https://cex.io/api/tickers/${tradingPair}`);
        return parseFloat(response.data.data[0]?.last) || null;
      case EXCHANGES.CHANGELLY:
        response = await axios.get(`https://api.changelly.com/v1/ticker/${tradingPair}`);
        return parseFloat(response.data.result[0]?.rate) || null;
      default:
        throw new Error(`Unsupported exchange: ${exchange}`);
    }
  } catch (error) {
    console.error(`Error fetching ${exchange} price for ${symbol}${baseCurrency}:`, error.response?.data || error.message);
    return null;
  }
};

app.get('/arbitrage', async (req, res) => {
  const { symbols, exchanges, baseCurrency } = req.query;
  if (!symbols || !exchanges || !baseCurrency) {
    return res.status(400).json({ error: 'symbols, exchanges, and baseCurrency query parameters are required' });
  }

  const symbolList = symbols.split(',');
  const exchangeList = exchanges.split(',');

  console.log('Received request for symbols:', symbolList, 'exchanges:', exchangeList, 'base currency:', baseCurrency);

  try {
    const results = await Promise.all(
      symbolList.map(async (symbol) => {
        const prices = await Promise.all(
          exchangeList.map(async (exchange) => {
            const price = await getPrice(exchange, symbol, baseCurrency);
            return { [exchange]: price };
          })
        );
        return { [symbol]: Object.assign({}, ...prices) };
      })
    );

    const result = Object.assign({}, ...results);
    console.log('Prices:', result);

    res.json(result);
  } catch (error) {
    console.error('Error processing arbitrage request:', error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
