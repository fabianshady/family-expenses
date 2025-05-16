import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import PublicPanel from './pages/PublicPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicPanel />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;