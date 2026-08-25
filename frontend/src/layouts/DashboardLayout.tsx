import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import DashboardPage from '../pages/DashboardPage';
import ChatPage from '../pages/ChatPage';
import VoicePage from '../pages/VoicePage';
import GoalsPage from '../pages/GoalsPage';
import HabitsPage from '../pages/HabitsPage';
import JournalPage from '../pages/JournalPage';
import MoodPage from '../pages/MoodPage';
import RecommendationsPage from '../pages/RecommendationsPage';
import MemoriesPage from '../pages/MemoriesPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import AdminPage from '../pages/AdminPage';

export const DashboardLayout = () => {
  return (
    <div className="flex bg-background min-h-screen relative overflow-hidden">
      
      {/* Background Orbs specific to dashboard */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <Sidebar />

      <div className="flex-1 ml-64 p-6 md:p-8 relative z-10 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <DashboardHeader />

        {/* Dynamic Route View */}
        <div className="flex-1 min-h-0">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/voice" element={<VoicePage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/reflection" element={<JournalPage />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;
