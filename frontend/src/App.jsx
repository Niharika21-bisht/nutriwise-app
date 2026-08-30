import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';

// Pages
import WelcomeScreen from './pages/WelcomeScreen';
import AuthScreen from './pages/AuthScreen';
import QuestionnaireScreen from './pages/QuestionnaireScreen';
import ProfileCreatedScreen from './pages/ProfileCreatedScreen';
import HomeScreen from './pages/HomeScreen';
import ProfileScreen from './pages/ProfileScreen';
import ProgressScreen from './pages/ProgressScreen';
import DietPlanScreen from './pages/DietPlanScreen';
import ScanScreen from './pages/ScanScreen';
import FoodAnalysisScreen from './pages/FoodAnalysisScreen';
import MakeMealBetterScreen from './pages/MakeMealBetterScreen';
import WaterTrackerScreen from './pages/WaterTrackerScreen';
import ProteinTrackerScreen from './pages/ProteinTrackerScreen';
import MealBalanceScreen from './pages/MealBalanceScreen';

function AppContent() {
  const { currentScreen, viewportMode } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'auth':
        return <AuthScreen />;
      case 'questionnaire':
        return <QuestionnaireScreen />;
      case 'profile_created':
        return <ProfileCreatedScreen />;
      case 'home':
        return <HomeScreen />;
      case 'water_tracker':
        return <WaterTrackerScreen />;
      case 'protein_tracker':
        return <ProteinTrackerScreen />;
      case 'meal_balance':
        return <MealBalanceScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'progress':
        return <ProgressScreen />;
      case 'diet_plan':
        return <DietPlanScreen />;
      case 'scan':
        return <ScanScreen />;
      case 'food_analysis':
        return <FoodAnalysisScreen />;
      case 'make_meal_better':
        return <MakeMealBetterScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 md:p-6 transition-all duration-300">
      {/* Toast Notification Container */}
      <Toast />

      {/* Main Container: Mobile phone mockup or responsive wide mode */}
      <div
        className={`w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-all duration-300 ${
          viewportMode === 'mobile'
            ? 'max-w-md md:rounded-[40px] md:shadow-2xl md:border-8 md:border-slate-800 dark:md:border-slate-800 md:min-h-[844px] min-h-screen flex flex-col justify-between'
            : 'max-w-4xl md:rounded-3xl md:shadow-2xl min-h-screen flex flex-col justify-between'
        }`}
      >
        {/* Top Simulated Mobile Speaker / Notch on Mobile frame */}
        {viewportMode === 'mobile' && (
          <div className="hidden md:flex justify-center pt-2 pb-1 bg-slate-800">
            <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-950/80 mr-2" />
              <div className="w-8 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>
        )}

        {/* Global App Header Bar */}
        <Navbar />

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 overflow-y-auto page-enter">
          {renderScreen()}
        </main>

        {/* Global Floating Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
