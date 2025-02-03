import React, { useState } from 'react';
import Home from './pages/Home';
import Match from './pages/Match';

function App() {
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    setIsStarted(true);
  };

  return (
    <div>
      {!isStarted ? <Home onStart={handleStart} /> : <Match />}
    </div>
  );
}

export default App;