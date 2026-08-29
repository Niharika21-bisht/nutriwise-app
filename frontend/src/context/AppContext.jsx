import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { DEFAULT_USER_PROFILE } from '../data/sampleData';
import { fetchProfileTargets, fetchDietPlan, calculateClientTargets } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation Screen State
  const [currentScreen, setCurrentScreen] = useState(() => {
    return localStorage.getItem('nutriwise_screen') || 'welcome';
  });

  // Logged-in Session State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const session = localStorage.getItem('nutriwise_session');
    return session ? JSON.parse(session) : true;
  });

  // User Profile
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('nutriwise_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_USER_PROFILE, ...parsed };
    }
    return DEFAULT_USER_PROFILE;
  });

  // Calculated Macro Targets
  const [macroTargets, setMacroTargets] = useState(() => calculateClientTargets(userProfile));

  // Generated Diet Plan (7-Day Blueprint)
  const [dietPlan, setDietPlan] = useState(null);
  const [loadingDietPlan, setLoadingDietPlan] = useState(false);

  // Clean Fresh Today's Log (Zero Dummy Values - Strictly Real User Inputs)
  const [todayLog, setTodayLog] = useState(() => {
    const saved = localStorage.getItem('nutriwise_today_log_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const todayStr = new Date().toISOString().split('T')[0];
        if (parsed.date === todayStr) return parsed;
      } catch (e) {}
    }
    return {
      date: new Date().toISOString().split('T')[0],
      score: 0,
      water_ml: 0,
      water_target_ml: 2400,
      consumed_calories: 0,
      consumed_protein_g: 0,
      consumed_carbs_g: 0,
      consumed_fat_g: 0,
      meals: [
        { id: 'breakfast', type: 'Breakfast', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '08:30', diet_fit: null, fit_message: null },
        { id: 'lunch', type: 'Lunch', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '13:15', diet_fit: null, fit_message: null },
        { id: 'snack', type: 'Snack', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '16:30', diet_fit: null, fit_message: null },
        { id: 'dinner', type: 'Dinner', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '20:00', diet_fit: null, fit_message: null }
      ]
    };
  });

  // Clean Calendar History (Zero Dummy Values)
  const [calendarHistory, setCalendarHistory] = useState(() => {
    const saved = localStorage.getItem('nutriwise_calendar_history_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
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
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nutriwise_screen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem('nutriwise_session', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('nutriwise_profile', JSON.stringify(userProfile));
    const targets = calculateClientTargets(userProfile);
    setMacroTargets(targets);
    refreshDietPlan(userProfile);
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('nutriwise_today_log_v2', JSON.stringify(todayLog));
    
    const hasUserActivity = (todayLog.meals || []).some(m => m.status === 'completed' || m.status === 'skipped') || todayLog.water_ml > 0;
    
    if (hasUserActivity) {
      const currentDayNum = new Date().getDate();
      setCalendarHistory(prev => {
        const updated = {
          ...prev,
          [currentDayNum]: {
            score: todayLog.score,
            status: todayLog.score >= 82 ? 'optimal' : todayLog.score >= 70 ? 'good' : 'moderate',
            meals_logged: (todayLog.meals || []).filter(m => m.status === 'completed').length,
            skipped: (todayLog.meals || []).filter(m => m.status === 'skipped').length,
            water_ml: todayLog.water_ml
          }
        };
        localStorage.setItem('nutriwise_calendar_history_v2', JSON.stringify(updated));
        return updated;
      });
    }
  }, [todayLog]);

  const triggerNotification = (title, body) => {
    showToast(`${title}: ${body}`);
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/2927/2927347.png'
        });
      } catch (e) {
        console.warn("Notification error:", e);
      }
    }
  };

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
    setUserProfile(prev => ({ ...prev, ...updatedFields }));
    showToast("Profile & recommendations updated! ✨");
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('nutriwise_session');
    showToast("Logged out successfully 👋");
    setCurrentScreen('welcome');
  };

  // Dynamic composite score calculation (Starts at 0, strictly accumulates earned points):
  const recalculateDayScore = (mealsList, waterMl, targetWater) => {
    const totalMeals = Math.max(1, mealsList.length);
    const maxMealPoints = 80;
    const pointsPerMeal = maxMealPoints / totalMeals;

    let earnedMealPoints = 0;
    let hasAnyAction = false;

    mealsList.forEach(m => {
      if (m.status === 'completed' || m.completed) {
        hasAnyAction = true;
        let multiplier = 1.0;
        if (m.diet_fit === 'minor_variance') multiplier = 0.85;
        if (m.diet_fit === 'divergent') multiplier = 0.65;
        earnedMealPoints += pointsPerMeal * multiplier;
      } else if (m.status === 'skipped') {
        hasAnyAction = true;
        earnedMealPoints += 0;
      }
    });

    const hydrationPoints = Math.min(20, (waterMl / Math.max(1000, targetWater || 2400)) * 20);
    if (waterMl > 0) hasAnyAction = true;

    if (!hasAnyAction) return 0;

    return Math.min(98, Math.max(5, Math.round(earnedMealPoints + hydrationPoints)));
  };

  // 1-Tap Log Planned Meal for a specific slot
  const logPlannedMeal = (slotId) => {
    const plannedDayMeals = dietPlan?.days?.[0]?.meals || dietPlan?.meals || [];
    const planned = plannedDayMeals.find(m => m.meal_type.toLowerCase() === slotId.toLowerCase()) || {
      title: `${slotId.charAt(0).toUpperCase() + slotId.slice(1)} Meal`,
      calories: slotId === 'breakfast' ? 330 : slotId === 'lunch' ? 480 : slotId === 'snack' ? 195 : 440,
      protein_g: slotId === 'breakfast' ? 14 : slotId === 'lunch' ? 18 : slotId === 'snack' ? 8 : 22
    };

    setTodayLog(prev => {
      const updatedMeals = prev.meals.map(m => {
        if (m.id.toLowerCase() === slotId.toLowerCase() || m.type.toLowerCase() === slotId.toLowerCase()) {
          return {
            ...m,
            name: planned.title,
            calories: planned.calories,
            protein: planned.protein_g,
            completed: true,
            status: 'completed',
            diet_fit: 'fits_plan',
            fit_message: `Logged planned ${slotId} (${planned.calories} kcal, ${planned.protein_g}g protein).`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return m;
      });

      const completedMeals = updatedMeals.filter(m => m.status === 'completed');
      const newCalories = completedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const newProtein = Number(completedMeals.reduce((sum, m) => sum + (m.protein || 0), 0).toFixed(1));
      const newScore = recalculateDayScore(updatedMeals, prev.water_ml, macroTargets.target_water_ml);

      return {
        ...prev,
        meals: updatedMeals,
        consumed_calories: newCalories,
        consumed_protein_g: newProtein,
        score: newScore
      };
    });

    showToast(`Logged planned ${planned.title} (${planned.calories} kcal)! 🥗`);
  };

  // Reset or Unlog meal
  const unlogMeal = (mealId) => {
    setTodayLog(prev => {
      const updatedMeals = prev.meals.map(m => {
        if (m.id === mealId) {
          return {
            ...m,
            name: '',
            calories: 0,
            protein: 0,
            completed: false,
            status: 'pending',
            diet_fit: null,
            fit_message: null
          };
        }
        return m;
      });

      const completedMeals = updatedMeals.filter(m => m.status === 'completed');
      const newCalories = completedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const newProtein = Number(completedMeals.reduce((sum, m) => sum + (m.protein || 0), 0).toFixed(1));
      const newScore = recalculateDayScore(updatedMeals, prev.water_ml, macroTargets.target_water_ml);

      return {
        ...prev,
        meals: updatedMeals,
        consumed_calories: newCalories,
        consumed_protein_g: newProtein,
        score: newScore
      };
    });

    showToast("Meal reset to unlogged.");
  };

  const toggleMealCompleted = (mealId) => {
    const meal = todayLog.meals.find(m => m.id === mealId);
    if (meal && (meal.status === 'completed' || meal.completed)) {
      unlogMeal(mealId);
    } else {
      logPlannedMeal(mealId);
    }
  };

  const skipMeal = (mealId) => {
    setTodayLog(prev => {
      const updatedMeals = prev.meals.map(m => {
        if (m.id === mealId) {
          return {
            ...m,
            completed: false,
            status: 'skipped',
            diet_fit: null,
            fit_message: 'Meal skipped by user (0 points assigned).'
          };
        }
        return m;
      });

      const completedMeals = updatedMeals.filter(m => m.status === 'completed');
      const newCalories = completedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const newProtein = Number(completedMeals.reduce((sum, m) => sum + (m.protein || 0), 0).toFixed(1));
      const newScore = recalculateDayScore(updatedMeals, prev.water_ml, macroTargets.target_water_ml);
      
      showToast("Meal skipped — 0 pts recorded for this time slot ⚠️");
      return {
        ...prev,
        meals: updatedMeals,
        consumed_calories: newCalories,
        consumed_protein_g: newProtein,
        score: newScore
      };
    });
  };

  const addWaterGlass = () => {
    setTodayLog(prev => {
      const newWater = Math.min((macroTargets.target_water_ml || 2400) + 1000, prev.water_ml + 250);
      const newScore = recalculateDayScore(prev.meals, newWater, macroTargets.target_water_ml);
      showToast("+250ml Hydration logged! 💧");
      return {
        ...prev,
        water_ml: newWater,
        score: newScore
      };
    });
  };

  // Evaluate if scanned food fits into user's diet plan blueprint
  const evaluateDietPlanFit = (foodItem, targetSlot = 'lunch') => {
    const plannedMeal = dietPlan?.days?.[0]?.meals?.find(m => m.meal_type.toLowerCase() === targetSlot.toLowerCase()) ||
                        dietPlan?.meals?.find(m => m.meal_type.toLowerCase() === targetSlot.toLowerCase());

    const plannedCalories = plannedMeal ? plannedMeal.calories : 480;
    const plannedProtein = plannedMeal ? plannedMeal.protein_g : 18.0;

    const calDiff = Math.abs(foodItem.calories - plannedCalories);
    const proteinRatio = foodItem.protein_g / Math.max(1, plannedProtein);

    if (calDiff <= 140 && proteinRatio >= 0.8) {
      return {
        verdict: 'fits_plan',
        badge: '✅ Fits Diet Plan Blueprint',
        color: 'text-emerald-700 bg-emerald-100 border-emerald-300',
        message: `Excellent! This ${foodItem.name} matches your scheduled ${targetSlot} target (${plannedCalories} kcal, ${plannedProtein}g protein) within optimal range.`
      };
    } else if (calDiff <= 250 && proteinRatio >= 0.5) {
      return {
        verdict: 'minor_variance',
        badge: '🟡 Can Fit with Adjustment',
        color: 'text-amber-700 bg-amber-100 border-amber-300',
        message: `Slight variance from planned ${targetSlot}. Contains ${foodItem.calories} kcal vs ${plannedCalories} kcal planned. Keep remaining meals slightly lighter.`
      };
    } else {
      return {
        verdict: 'divergent',
        badge: '🔴 Diverges from Plan Target',
        color: 'text-rose-700 bg-rose-100 border-rose-300',
        message: `High calorie/macro divergence for ${targetSlot}. Adjusted your remaining day targets to balance net daily energy.`
      };
    }
  };

  const logCustomScannedMeal = (foodItem, targetSlot = 'lunch') => {
    const fitEval = evaluateDietPlanFit(foodItem, targetSlot);

    setTodayLog(prev => {
      let slotUpdated = false;
      const updatedMeals = prev.meals.map(m => {
        if (m.type.toLowerCase() === targetSlot.toLowerCase() || m.id.toLowerCase() === targetSlot.toLowerCase()) {
          slotUpdated = true;
          return {
            ...m,
            name: foodItem.name,
            calories: foodItem.calories,
            protein: foodItem.protein_g,
            completed: true,
            status: 'completed',
            diet_fit: fitEval.verdict,
            fit_message: fitEval.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return m;
      });

      if (!slotUpdated) {
        updatedMeals.push({
          id: 'scan-' + Date.now(),
          type: targetSlot.charAt(0).toUpperCase() + targetSlot.slice(1),
          name: foodItem.name,
          calories: foodItem.calories,
          protein: foodItem.protein_g,
          completed: true,
          status: 'completed',
          diet_fit: fitEval.verdict,
          fit_message: fitEval.message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      // Sum only completed meals
      const completedMeals = updatedMeals.filter(m => m.status === 'completed');
      const newCalories = completedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const newProtein = Number(completedMeals.reduce((sum, m) => sum + (m.protein || 0), 0).toFixed(1));
      const newScore = recalculateDayScore(updatedMeals, prev.water_ml, macroTargets.target_water_ml);

      return {
        ...prev,
        meals: updatedMeals,
        consumed_calories: newCalories,
        consumed_protein_g: newProtein,
        score: newScore
      };
    });

    showToast(`Logged as ${targetSlot}! ${fitEval.badge}`);
    setCurrentScreen('home');
  };

  const resetTodayLog = () => {
    localStorage.removeItem('nutriwise_today_log_v2');
    localStorage.removeItem('nutriwise_calendar_history_v2');
    setTodayLog({
      date: new Date().toISOString().split('T')[0],
      score: 0,
      water_ml: 0,
      water_target_ml: macroTargets.target_water_ml,
      consumed_calories: 0,
      consumed_protein_g: 0,
      consumed_carbs_g: 0,
      consumed_fat_g: 0,
      meals: [
        { id: 'breakfast', type: 'Breakfast', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '08:30', diet_fit: null, fit_message: null },
        { id: 'lunch', type: 'Lunch', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '13:15', diet_fit: null, fit_message: null },
        { id: 'snack', type: 'Snack', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '16:30', diet_fit: null, fit_message: null },
        { id: 'dinner', type: 'Dinner', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '20:00', diet_fit: null, fit_message: null }
      ]
    });
    setCalendarHistory({});
    showToast("Reset to clean day! No dummy values.");
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      isLoggedIn,
      setIsLoggedIn,
      logout,
      userProfile,
      setUserProfile,
      updateProfile,
      macroTargets,
      dietPlan,
      loadingDietPlan,
      todayLog,
      calendarHistory,
      toggleMealCompleted,
      logPlannedMeal,
      unlogMeal,
      skipMeal,
      addWaterGlass,
      logCustomScannedMeal,
      evaluateDietPlanFit,
      resetTodayLog,
      activeScanResult,
      setActiveScanResult,
      activeMealUpgrade,
      setActiveMealUpgrade,
      viewportMode,
      setViewportMode,
      toastMessage,
      showToast,
      triggerNotification
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
