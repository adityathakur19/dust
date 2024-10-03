import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [symbol, setSymbol] = useState('');
  const [result, setResult] = useState(null);

  const handleFetchArbitrage = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/arbitrage?symbol=${symbol}`);
      console.log('Arbitrage Data:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error('Error fetching arbitrage data:', error);
      alert('Error fetching data. Please check the console for more information.');
    }
  };

  // Function to set symbol from button click
  const handleButtonClick = (value) => {
    setSymbol(value); // Set the input to the button's value
  };

  return (
    <div className="App">
      <h1>Crypto Arbitrage Bot</h1>
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="ETHUSDT, BTCUSDT, LTCUSDT"
      />
      <br />
      <button onClick={() => handleButtonClick('BTCUSDT')}>BTCUSDT</button>
      <button onClick={() => handleButtonClick('ETHUSDT')}>ETHUSDT</button>
      <button onClick={() => handleButtonClick('LTCUSDT')}>LTCUSDT</button>
      <button onClick={handleFetchArbitrage}>Check Arbitrage</button>

      {result && (
        <div>
          <h3>Results:</h3>
          <p>Binance Price: ${result.binancePrice}</p>
          <p>Coinbase Price: ${result.coinbasePrice}</p>
          <p>Price Difference: ${result.priceDifference}</p>
          <p>Kraken Price: ${result.krakenPrice}</p> {/* Corrected spelling of 'Karken' */}
          <p>Bitfinex Price: ${result.bitfinexPrice}</p> {/* Corrected spelling of 'bitfinexprice' */}
        </div>
      )}
    </div>
  );
}

export default App;
