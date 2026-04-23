import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Background from './components/Background';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import StudySpace from './pages/StudySpace';
import TestMode from './pages/TestMode';
import Performance from './pages/Performance';

function App() {
  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-black selection:bg-white selection:text-black">
      {/* Persistent global background */}
      <Background />
      
      {/* Route Switching Logic */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/study/:noteId" element={<StudySpace />} />
        <Route path="/test/:noteId" element={<TestMode />} />
        <Route path="/performance" element={<Performance />} />
      </Routes>
    </div>
  );
}

export default App;
