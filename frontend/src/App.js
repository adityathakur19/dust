import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import './App.css';

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
  COINGECKO: 'CoinGecko'
};

const SYMBOLS = [
  'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'UNI', 'LTC', 'LINK',
  'SOL', 'MATIC', 'AVAX', 'ATOM', 'TRX', 'SHIB', 'XLM', 'BCH', 'FIL', 'EOS'
];

const BASE_CURRENCIES = ['BTC', 'USD'];

const ARBITRAGE_PERCENTAGES = [
  {value: 0, label: '0%'},
  { value: 0.01, label: '0.01%' },
  { value: 0.05, label: '0.05%' },
  { value: 0.1, label: '0.1%' },
  { value: 0.15, label: '0.15%' },
  { value: 0.2, label: '0.2%' },
  { value: 0.25, label: '0.25%' },
  { value: 0.5, label: '0.5%' },
  { value: 1, label: '1%' },
  { value: 2, label: '2%' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 100, label: '100%' },
];

const ArbitrageFinderBot = () => {
  const [selectedExchanges, setSelectedExchanges] = useState([]);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [minArbitragePercentage, setMinArbitragePercentage] = useState(0.01);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExchangeToggle = useCallback((exchange) => {
    setSelectedExchanges(prev =>
      prev.includes(exchange)
        ? prev.filter(e => e !== exchange)
        : [...prev, exchange]
    );
  }, []);

  const handleSelectAllExchanges = useCallback(() => {
    setSelectedExchanges(Object.values(EXCHANGES));
  }, []);

  const handleClearAllExchanges = useCallback(() => {
    setSelectedExchanges([]);
  }, []);

  const fetchArbitrageOpportunities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/arbitrage', {
        params: {
          symbols: SYMBOLS.join(','),
          exchanges: selectedExchanges.join(','),
          baseCurrency
        }
      });
      setResults(response.data);
    } catch (error) {
      setError('Failed to fetch arbitrage opportunities. Please try again.');
    }
    setLoading(false);
  }, [selectedExchanges, baseCurrency]);

  const calculateArbitrage = useCallback((prices) => {
    const validPrices = Object.values(prices).filter(price => price !== null);
    if (validPrices.length < 2) return null;
    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);
    return ((maxPrice - minPrice) / minPrice) * 100;  
  }, []);

  const arbitrageOpportunitiesCount = useMemo(() => {
    return Object.values(results).filter(prices => {
      const arbitragePercentage = calculateArbitrage(prices);
      return arbitragePercentage !== null && arbitragePercentage >= minArbitragePercentage;
    }).length;
  }, [results, minArbitragePercentage, calculateArbitrage]);

  return (
    <div className="container">
      <h1 className="title">Arbitrage Opportunity Finder</h1>

      <div className="settings-panel">
        <h2 className="subtitle">Settings</h2>
        <div className="settings-grid">
          <div className="exchange-selection">
            <h3 className="section-title">Select Exchanges</h3>
            <div className="exchange-buttons">
              <button onClick={handleSelectAllExchanges} className="exchange-button">Select All</button>
              <button onClick={handleClearAllExchanges} className="exchange-button">Clear All</button>
            </div>
            <div className="exchange-grid">
              {Object.entries(EXCHANGES).map(([key, value]) => (
                <label key={key} className="exchange-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedExchanges.includes(value)}
                    onChange={() => handleExchangeToggle(value)}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="other-settings">
            <div className="setting">
              <label htmlFor="baseCurrency" className="setting-label">Base Currency</label>
              <select
                id="baseCurrency"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="select-input"
              >
                {BASE_CURRENCIES.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
            <div className="setting">
              <label htmlFor="minArbitrage" className="setting-label">Minimum Arbitrage</label>
              <select
                id="minArbitrage"
                value={minArbitragePercentage}
                onChange={(e) => setMinArbitragePercentage(parseFloat(e.target.value))}
                className="select-input"
              >
                {ARBITRAGE_PERCENTAGES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={fetchArbitrageOpportunities} 
              disabled={loading || selectedExchanges.length < 2}
              className="fetch-button"
            >
              {loading ? 'Fetching...' : 'Find Opportunities'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="results-summary">
          <strong>Selected min Arbitrage:</strong> {ARBITRAGE_PERCENTAGES.find(ap => ap.value === minArbitragePercentage)?.label} |{' '}
          <strong>Selected Base Currency:</strong> {baseCurrency} |{' '}
          <strong>Arbitrage opportunities found:</strong> {arbitrageOpportunitiesCount}
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="results-table">
          <table>
            <thead>
              <tr>
                <th>Coin</th>
                {selectedExchanges.map(exchange => (
                  <th key={exchange}>{exchange}</th>
                ))}
                <th>Arbitrage (%)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(results).map(([symbol, prices]) => {
                const arbitragePercentage = calculateArbitrage(prices);
                if (arbitragePercentage === null || arbitragePercentage < minArbitragePercentage) return null;

                const validPrices = Object.entries(prices).filter(([, price]) => price !== null);
                const minPrice = Math.min(...validPrices.map(([, price]) => price));
                const maxPrice = Math.max(...validPrices.map(([, price]) => price));

                return (
                  <tr key={symbol}>
                    <td className="coin-symbol">{symbol}</td>
                    {selectedExchanges.map(exchange => {
                      const price = prices[exchange];
                      let cellClass = "price";
                      if (price === minPrice) cellClass += " min-price";
                      if (price === maxPrice) cellClass += " max-price";
                      return (
                        <td key={exchange} className={cellClass}>
                          {price !== null ? price.toFixed(6) : '-'}
                        </td>
                      );
                    })}
                    <td className="arbitrage-percentage">
                      {arbitragePercentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArbitrageFinderBot;