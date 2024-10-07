import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

const API_URL = 'http://localhost:5000/arbitrage';
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT', 'DOGEUSDT', 'SHIBUSDT', 'LINKUSDT', 'TONUSDT'];
const EXCHANGES = ['Binance', 'Coinbase', 'CoinMarketCap', 'CoinGecko', 'CryptoCompare', 'Bitfinex', 'Huobi', 'Gateio', 'Bybit'];

const FETCH_INTERVAL = 60000; // 1 minute

const App = () => {
  const [result, setResult] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
  const [selectedExchanges, setSelectedExchanges] = useState({});
  const [priceHistory, setPriceHistory] = useState([]);
  const [buyOpportunity, setBuyOpportunity] = useState(null);
  const [sellOpportunity, setSellOpportunity] = useState(null);
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [profitResult, setProfitResult] = useState(null);

  const [currencyA, setCurrencyA] = useState(SYMBOLS[0]);
  const [currencyB, setCurrencyB] = useState(SYMBOLS[1]);
  const [comparisonResult, setComparisonResult] = useState({});

  const fetchArbitrage = useCallback(async () => {
    const selectedExchangeKeys = Object.keys(selectedExchanges).filter((key) => selectedExchanges[key]);
    if (selectedExchangeKeys.length === 0) return; 
    try {
      const response = await axios.get(`${API_URL}?symbol=${selectedSymbol}`);
      const filteredData = selectedExchangeKeys.reduce((obj, key) => {
        if (response.data[key]) {
          obj[key] = response.data[key];
        }
        return obj;
      }, {});

      setResult(filteredData);
      updatePriceHistory(filteredData, selectedSymbol);
      determineArbitrageOpportunities(filteredData);
    } catch (error) {
      console.error('Error fetching arbitrage data:', error);
    }
  }, [selectedSymbol, selectedExchanges]);

  const fetchComparisonResult = async () => {
    try {
      const responseA = await axios.get(`${API_URL}?symbol=${currencyA}`);
      const responseB = await axios.get(`${API_URL}?symbol=${currencyB}`);
      const pricesA = responseA.data;
      const pricesB = responseB.data;
      
      const comparison = Object.keys(pricesA).reduce((result, exchange) => {
        const priceA = pricesA[exchange];
        const priceB = pricesB[exchange];
        result[exchange] = {
          priceA: priceA,
          priceB: priceB,
          ratio: priceA && priceB ? (priceA / priceB).toFixed(8) : 'N/A'
        };
        return result;
      }, {});

      setComparisonResult(comparison);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    }
  };

  const determineArbitrageOpportunities = (data) => {
    if (!data || Object.keys(data).length === 0) return;

    const prices = Object.entries(data).map(([exchange, price]) => ({ exchange, price: parseFloat(price) }));

    const buyOpportunity = prices.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));
    const sellOpportunity = prices.reduce((prev, curr) => (curr.price > prev.price ? curr : prev));

    setBuyOpportunity(buyOpportunity);
    setSellOpportunity(sellOpportunity);
  };

  const debouncedFetchArbitrage = useCallback(debounce(fetchArbitrage, 300), [fetchArbitrage]);

  useEffect(() => {
    const intervalId = setInterval(debouncedFetchArbitrage, FETCH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [debouncedFetchArbitrage]);

  const updatePriceHistory = (data, symbol) => {
    setPriceHistory((prevHistory) => {
      const newEntry = {
        timestamp: new Date().toLocaleTimeString(),
        symbol,
        ...Object.entries(data).reduce((acc, [key, value]) => {
          if (value !== null) acc[key] = parseFloat(value);
          return acc;
        }, {}),
      };
      return [...prevHistory.slice(-19), newEntry]; // Keep last 20 entries
    });
  };

  const handleExchangeChange = (exchange) => {
    setSelectedExchanges((prev) => ({
      ...prev,
      [exchange]: !prev[exchange],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = EXCHANGES.reduce((acc, exchange) => {
      acc[exchange] = true;
      return acc;
    }, {});
    setSelectedExchanges(allSelected);
  };

  const handleClearAll = () => {
    setSelectedExchanges({});
  };

  const calculateProfit = (percentage) => {
    if (buyOpportunity && sellOpportunity) {
      const buyPrice = buyOpportunity.price;
      const sellPrice = sellOpportunity.price;
      const profit = (sellPrice - buyPrice) * (percentage / 100);
      const potentialProfit = Math.abs(profit - (buyPrice * (percentage / 100)));
      setProfitResult(potentialProfit.toFixed(2));
      setProfitPercentage(percentage);
    }
  };

  return (
    <div className="arbitrage-container">
      <h1 className="title">Crypto Arbitrage Bot</h1>

      <div className="dropdown-container">
        <h3>Select Symbol</h3>
        <select value={selectedSymbol} onChange={(e) => setSelectedSymbol(e.target.value)} className="symbol-select">
          {SYMBOLS.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>

      <div className="exchange-container">
        <h3>Select Exchanges</h3>
        <div className="button-group">
          <button onClick={handleSelectAll} className="select-button">
            Select All
          </button>
          <button onClick={handleClearAll} className="clear-button">
            Clear All
          </button>
        </div>
        <div className="checkbox-group">
          {EXCHANGES.map((exchange) => (
            <label key={exchange} className="exchange-label">
              <input
                type="checkbox"
                checked={!!selectedExchanges[exchange]}
                onChange={() => handleExchangeChange(exchange)}
              />
              {exchange}
            </label>
          ))}
        </div>
      </div>

      <button onClick={debouncedFetchArbitrage} className="fetch-button">
        Fetch Prices
      </button>

      {result && Object.keys(result).length > 0 && (
        <div className="price-card-container">
          <h3 className="section-title">Current Prices</h3>
          <table className="price-table">
            <thead>
              <tr>
                <th>Exchange</th>
                <th>Price (USD)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result).map(([source, price]) => (
                <tr key={source}>
                  <td>{source}</td>
                  <td>{price !== null ? `$${parseFloat(price).toFixed(2)}` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {buyOpportunity && sellOpportunity && (
        <div className="opportunity-container">
          <h3 className="section-title">Arbitrage Opportunities</h3>
          <div className="opportunity-box buy-opportunity">
            <p>
              <strong>Buy on:</strong> {buyOpportunity.exchange} at ${buyOpportunity.price.toFixed(2)}
            </p>
          </div>
          <div className="opportunity-box sell-opportunity">
            <p>
              <strong>Sell on:</strong> {sellOpportunity.exchange} at ${sellOpportunity.price.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="percentage-container">
        <h3 className="section-title">Select Profit Percentage</h3>
        <select
          value={profitPercentage}
          onChange={(e) => calculateProfit(Number(e.target.value))}
          className="percentage-select"
        >
          <option value="" disabled>
            Select Percentage
          </option>
          {[5, 10, 15, 20, 25, 30, 40, 50, 60].map((percentage) => (
            <option key={percentage} value={percentage}>
              {percentage}%
            </option>
          ))}
        </select>
        {profitResult !== null && (
          <div className="profit-result">
            <h4>Potential Profit at {profitPercentage}%: ${profitResult}</h4>
          </div>
        )}
      </div>

      <div className="comparison-container">
        <h3 className="section-title">Compare Currencies</h3>
        <div className="comparison-controls">
          <select
            value={currencyA}
            onChange={(e) => setCurrencyA(e.target.value)}
            className="currency-select"
          >
            {SYMBOLS.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
          <select
            value={currencyB}
            onChange={(e) => setCurrencyB(e.target.value)}
            className="currency-select"
          >
            {SYMBOLS.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
          <button onClick={fetchComparisonResult} className="compare-button">
            Compare
          </button>
        </div>
        {Object.keys(comparisonResult).length > 0 && (
          <div className="comparison-results">
            <h4>Comparison Results</h4>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Exchange</th>
                  <th>{currencyA} Price</th>
                  <th>{currencyB} Price</th>
                  <th>Ratio ({currencyA}/{currencyB})</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(comparisonResult).map(([exchange, data]) => (
                  <tr key={exchange}>
                    <td>{exchange}</td>
                    <td>${parseFloat(data.priceA).toFixed(2)}</td>
                    <td>${parseFloat(data.priceB).toFixed(2)}</td>
                    <td>{data.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {priceHistory.length > 0 && (
        <div className="chart-container">
          <h3 className="section-title">Price History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(priceHistory[0]).filter(key => key !== 'timestamp' && key !== 'symbol').map((key) => (
                <Line key={key} type="monotone" dataKey={key} stroke="#8884d8" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default App;