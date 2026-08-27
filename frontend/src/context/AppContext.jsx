import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_USER_PROFILE } from '../data/sampleData';
import { fetchProfileTargets, fetchDietPlan, calculateClientTargets } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation Screen State
  const [currentScreen, setCurrentScreen] = useState(() => {
    return localStorage.getItem('nutriwise_screen') || 'welcome';
  });

  // User Profile
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('nutriwise_profile');
    return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
  });

  // Calculated Macro Targets
  const [macroTargets, setMacroTargets] = useState(() => calculateClientTargets(userProfile));

  // Generated Diet Plan
  const [dietPlan, setDietPlan] = useState(null);
  const [loadingDietPlan, setLoadingDietPlan] = useState(false);

  // Today's Intake Tracking
  const [todayLog, setTodayLog] = useState(() => {
    const saved = localStorage.getItem('nutriwise_today_log');
    if (saved) return JSON.parse(saved);
    return {
      date: new Date().toISOString().split('T')[0],
      score: 78,
      water_ml: 1750,
      water_target_ml: 2400,
      consumed_calories: 1290,
      consumed_protein_g: 58.5,
      consumed_carbs_g: 164.0,
      consumed_fat_g: 39.0,
      meals: [
        { id: 'breakfast', type: 'Breakfast', name: 'Vegetable Poha + Low-Fat Curd', calories: 330, protein: 12.5, completed: true, time: '8:30 AM' },
        { id: 'lunch', type: 'Lunch', name: 'Dal Tadka + Steamed Rice + Sabzi', calories: 480, protein: 16.0, completed: true, time: '1:15 PM' },
        { id: 'snack', type: 'Snack', name: 'Seasonal Fruit & Roasted Chana', calories: 195, protein: 8.0, completed: false, time: '4:30 PM' },
        { id: 'dinner', type: 'Dinner', name: 'Multigrain Roti with Paneer & Veg', calories: 440, protein: 22.0, completed: false, time: '8:00 PM' }
      ]
    };
  });

  // Active Scanned Food Item Result
  const [activeScanResult, setActiveScanResult] = useState(null);

  // Active Meal Improvement Result
  const [activeMealUpgrade, setActiveMealUpgrade] = useState(null);

  // App Viewport mode: 'mobile' frame or 'desktop' full screen
  const [viewportMode, setViewportMode] = useState('mobile');

  // Toasts
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('nutriwise_screen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem('nutriwise_profile', JSON.stringify(userProfile));
    const targets = calculateClientTargets(userProfile);
    setMacroTargets(targets);
    refreshDietPlan(userProfile);
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('nutriwise_today_log', JSON.stringify(todayLog));
  }, [todayLog]);

  const refreshDietPlan = async (profile) => {
    setLoadingDietPlan(true);
    try {
      const plan = await fetchDietPlan(profile);
      setDietPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDietPlan(false);
    }
  };

  const updateProfile = (updatedFields) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updatedFields };
      return next;
    });
    showToast("Profile & recommendations updated! ✨");
  };

  const toggleMealCompleted = (mealId) => {
    setTodayLog(prev => {
      const updatedMeals = prev.meals.map(m => {
        if (m.id === mealId) {
          const nextCompleted = !m.completed;
          return { ...m, completed: nextCompleted };
        }
        return m;
      });
      const completedCount = updatedMeals.filter(m => m.completed).length;
      const newScore = Math.min(96, Math.round(60 + (completedCount * 8.5) + (prev.water_ml / prev.water_target_ml * 10)));
      return {
        ...prev,
        meals: updatedMeals,
        score: newScore
      };
    });
  };

  const addWaterGlass = () => {
    setTodayLog(prev => {
      const newWater = Math.min(prev.water_target_ml + 1000, prev.water_ml + 250);
      showToast("+250ml Hydration logged! 💧");
      return {
        ...prev,
        water_ml: newWater
      };
    });
  };

  const logCustomScannedMeal = (foodItem) => {
    setTodayLog(prev => {
      const newMeal = {
        id: 'scan-' + Date.now(),
        type: 'Logged Food',
        name: foodItem.name,
        calories: foodItem.calories,
        protein: foodItem.protein_g,
        completed: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const updatedMeals = [...prev.meals, newMeal];
      const newCalories = prev.consumed_calories + foodItem.calories;
      const newProtein = Number((prev.consumed_protein_g + foodItem.protein_g).toFixed(1));
      const newScore = Math.min(98, prev.score + 4);
      return {
        ...prev,
        meals: updatedMeals,
        consumed_calories: newCalories,
        consumed_protein_g: newProtein,
        score: newScore
      };
    });
    showToast(`Logged "${foodItem.name}" to today's intake! 🥗`);
    setCurrentScreen('home');
  };

  const resetTodayLog = () => {
    setTodayLog({
      date: new Date().toISOString().split('T')[0],
      score: 75,
      water_ml: 500,
      water_target_ml: macroTargets.target_water_ml,
      consumed_calories: 330,
      consumed_protein_g: 12.5,
      consumed_carbs_g: 50.0,
      consumed_fat_g: 8.0,
      meals: [
        { id: 'breakfast', type: 'Breakfast', name: 'Vegetable Poha + Curd', calories: 330, protein: 12.5, completed: true, time: '8:30 AM' },
        { id: 'lunch', type: 'Lunch', name: 'Dal Tadka + Steamed Rice', calories: 480, protein: 16.0, completed: false, time: '1:15 PM' },
        { id: 'snack', type: 'Snack', name: 'Fruit & Roasted Chana', calories: 195, protein: 8.0, completed: false, time: '4:30 PM' },
        { id: 'dinner', type: 'Dinner', name: 'Roti with Paneer Bhurji', calories: 440, protein: 22.0, completed: false, time: '8:00 PM' }
      ]
    });
    showToast("Day reset to morning baseline!");
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      userProfile,
      setUserProfile,
      updateProfile,
      macroTargets,
      dietPlan,
      loadingDietPlan,
      todayLog,
      toggleMealCompleted,
      addWaterGlass,
      logCustomScannedMeal,
      resetTodayLog,
      activeScanResult,
      setActiveScanResult,
      activeMealUpgrade,
      setActiveMealUpgrade,
      viewportMode,
      setViewportMode,
      toastMessage,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
