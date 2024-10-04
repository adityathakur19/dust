import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/arbitrage';
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT'];
const FETCH_INTERVAL = 60000; // 1 minute

const App = () => {
  const [result, setResult] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);

  const fetchArbitrage = useCallback(async (symbol) => {
    try {
      const response = await axios.get(`${API_URL}?symbol=${symbol}`);
      setResult(response.data);
      setSelectedSymbol(symbol);
      updatePriceHistory(response.data, symbol);
    } catch (error) {
      console.error('Error fetching arbitrage data:', error);
    }
  }, []);

  const debouncedFetchArbitrage = useCallback(
    debounce(fetchArbitrage, 300),
    []
  );

  useEffect(() => {
    if (selectedSymbol) {
      const intervalId = setInterval(() => fetchArbitrage(selectedSymbol), FETCH_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [selectedSymbol, fetchArbitrage]);

  const updatePriceHistory = (data, symbol) => {
    setPriceHistory(prevHistory => {
      const newEntry = {
        timestamp: new Date().toLocaleTimeString(),
        symbol,
        ...Object.entries(data).reduce((acc, [key, value]) => {
          if (value !== null) acc[key] = parseFloat(value);
          return acc;
        }, {})
      };
      return [...prevHistory.slice(-19), newEntry];
    });
  };

  const getRelevantCoinGeckoPrice = (data) => {
    if (!data || !selectedSymbol) return null;
    const currency = selectedSymbol.slice(0, 3).toLowerCase();
    return data.coinGeckoPrices?.[currency]?.usd;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Crypto Arbitrage Bot</h1>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {SYMBOLS.map((symbol) => (
          <button
            key={symbol}
            onClick={() => debouncedFetchArbitrage(symbol)}
            className={`px-4 py-2 rounded ${
              selectedSymbol === symbol
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            } hover:bg-blue-500 hover:text-white transition-colors`}
          >
            {symbol}
          </button>
        ))}
      </div>

      {result && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Current Prices:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(result).map(([source, price]) => (
              <div key={source} className="bg-gray-100 p-4 rounded">
                <h4 className="font-medium">{source.replace('Price', '')}</h4>
                <p className="text-lg">
                  {price !== null
                    ? `$${parseFloat(price).toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {priceHistory.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Price History</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(priceHistory[0])
                .filter(key => key !== 'timestamp' && key !== 'symbol')
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={`hsl(${index * 30}, 70%, 50%)`}
                    dot={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default App;