import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { StarfieldBackground } from './components/duel/StarFieldBackground';
import { CreateDuelPage } from './pages/CreateDuelPage';
import { DuelExplorerPage } from './pages/DuelExplorerPage';
import { DuelDetailsPage } from './pages/DuelDetailsPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <StarfieldBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateDuelPage />} />
          <Route path="/explorer" element={<DuelExplorerPage />} />
          <Route path="/duel/:id" element={<DuelDetailsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;