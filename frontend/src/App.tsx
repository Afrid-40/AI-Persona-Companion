import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
// Placeholder imports for future pages
import CompanionsPage from './pages/CompanionsPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text-primary flex flex-col relative overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        
        <Routes>
          <Route path="/dashboard/*" element={null} /> {/* Handled inside DashboardLayout */}
          <Route path="*" element={<Header />} />
        </Routes>
        
        <main className="flex-grow flex flex-col z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/companions" element={<CompanionsPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard/*" element={<DashboardLayout />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
