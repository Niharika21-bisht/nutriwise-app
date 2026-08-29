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

  // Generated Diet Plan (3-Day Blueprint)
  const [dietPlan, setDietPlan] = useState(null);
  const [loadingDietPlan, setLoadingDietPlan] = useState(false);

  // Dynamic Today's Log (with skipped meal 0-point logic)
  const [todayLog, setTodayLog] = useState(() => {
    const saved = localStorage.getItem('nutriwise_today_log');
    if (saved) return JSON.parse(saved);
    return {
      date: new Date().toISOString().split('T')[0],
      score: 75,
      water_ml: 1250,
      water_target_ml: 2400,
      consumed_calories: 810,
      consumed_protein_g: 28.5,
      consumed_carbs_g: 128.0,
      consumed_fat_g: 19.5,
      meals: [
        { id: 'breakfast', type: 'Breakfast', name: 'Vegetable Poha + Low-Fat Curd', calories: 330, protein: 12.5, status: 'completed', completed: true, time: '08:30', diet_fit: 'fits_plan', fit_message: 'Matches planned breakfast target nicely' },
        { id: 'lunch', type: 'Lunch', name: 'Dal Tadka + Steamed Rice + Sabzi', calories: 480, protein: 16.0, status: 'completed', completed: true, time: '13:15', diet_fit: 'fits_plan', fit_message: 'Optimal midday glycogen and protein balance' },
        { id: 'snack', type: 'Snack', name: 'Seasonal Fruit & Roasted Chana', calories: 195, protein: 8.0, status: 'pending', completed: false, time: '16:30', diet_fit: null, fit_message: null },
        { id: 'dinner', type: 'Dinner', name: 'Multigrain Roti with Paneer & Veg', calories: 440, protein: 22.0, status: 'pending', completed: false, time: '20:00', diet_fit: null, fit_message: null }
      ]
    };
  });

  // Dynamic Calendar Day Scores History
  const [calendarHistory, setCalendarHistory] = useState(() => {
    const saved = localStorage.getItem('nutriwise_calendar_history');
    if (saved) return JSON.parse(saved);
    // Keep 5 historic days for context
    return {
      22: { score: 76, status: 'moderate', meals_logged: 3, skipped: 1 },
      23: { score: 82, status: 'good', meals_logged: 4, skipped: 0 },
      24: { score: 78, status: 'good', meals_logged: 3, skipped: 1 },
      25: { score: 82, status: 'good', meals_logged: 4, skipped: 0 },
      26: { score: 76, status: 'moderate', meals_logged: 3, skipped: 1 }
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
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Notification Timer ref
  const notificationTimerRef = useRef(null);

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
    localStorage.setItem('nutriwise_today_log', JSON.stringify(todayLog));
    // Synchronize today's day 27/28/29 into calendar history dynamically
    const currentDayNum = new Date().getDate();
    setCalendarHistory(prev => {
      const updated = {
        ...prev,
        [currentDayNum]: {
          score: todayLog.score,
          status: todayLog.score >= 82 ? 'optimal' : todayLog.score >= 70 ? 'good' : 'moderate',
          meals_logged: todayLog.meals.filter(m => m.status === 'completed').length,
          skipped: todayLog.meals.filter(m => m.status === 'skipped').length
        }
      };
      localStorage.setItem('nutriwise_calendar_history', JSON.stringify(updated));
      return updated;
    });
  }, [todayLog]);

  // Periodic Hydration & Meal Notifications Engine
  useEffect(() => {
    if (userProfile.notifications_enabled) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Check meal reminders every minute
      const interval = setInterval(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Match meal timings
        const timings = userProfile.meal_timings || DEFAULT_USER_PROFILE.meal_timings;
        if (currentTime === timings.breakfast) {
          triggerNotification("🍽️ Breakfast Reminder", "Time for Breakfast! Scan or mark your morning meal in NutriWise.");
        } else if (currentTime === timings.lunch) {
          triggerNotification("🍽️ Lunch Reminder", "Time for Lunch! Log your meal to maintain your nutrition score.");
        } else if (currentTime === timings.dinner) {
          triggerNotification("🍽️ Dinner Reminder", "Time for Dinner! Complete your daily nutrition target.");
        }
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [userProfile.notifications_enabled, userProfile.meal_timings]);

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

  // Dynamic composite score calculation:
  // - Completed meals get up to 20 pts each (based on whether fit is good/mod/divergent)
  // - Skipped meals explicitly get 0 points!
  // - Hydration provides up to 20 pts
  const recalculateDayScore = (mealsList, waterMl, targetWater) => {
    const totalMeals = Math.max(1, mealsList.length);
    const maxMealPoints = 80;
    const pointsPerMeal = maxMealPoints / totalMeals;

    let earnedMealPoints = 0;
    mealsList.forEach(m => {
      if (m.status === 'completed' || m.completed) {
        let multiplier = 1.0;
        if (m.diet_fit === 'minor_variance') multiplier = 0.85;
        if (m.diet_fit === 'divergent') multiplier = 0.65;
        earnedMealPoints += pointsPerMeal * multiplier;
      } else if (m.status === 'skipped') {
        // Explicit 0 points for skipped meals
        earnedMealPoints += 0;
      }
    });

    const hydrationPoints = Math.min(20, (waterMl / Math.max(1000, targetWater)) * 20);
    return Math.min(98, Math.max(10, Math.round(earnedMealPoints + hydrationPoints)));
  };

  const toggleMealCompleted = (mealId) => {
    setTodayLog(prev => {
      const updatedMeals = prev.meals.map(m => {
        if (m.id === mealId) {
          const nextCompleted = !m.completed;
          return {
            ...m,
            completed: nextCompleted,
            status: nextCompleted ? 'completed' : 'pending',
            diet_fit: nextCompleted ? (m.diet_fit || 'fits_plan') : null
          };
        }
        return m;
      });

      const newScore = recalculateDayScore(updatedMeals, prev.water_ml, macroTargets.target_water_ml);
      return {
        ...prev,
        meals: updatedMeals,
        score: newScore
      };
    });
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

      const newScore = recalculateDayScore(updatedMeals, prev.water_ml, macroTargets.target_water_ml);
      showToast("Meal skipped — score adjusted to 0 pts for this slot ⚠️");
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
      const newScore = recalculateDayScore(prev.meals, newWater, prev.water_target_ml);
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
      // Find if targetSlot exists in meals or append
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

      const newCalories = prev.consumed_calories + foodItem.calories;
      const newProtein = Number((prev.consumed_protein_g + foodItem.protein_g).toFixed(1));
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
    setTodayLog({
      date: new Date().toISOString().split('T')[0],
      score: 50,
      water_ml: 500,
      water_target_ml: macroTargets.target_water_ml,
      consumed_calories: 330,
      consumed_protein_g: 12.5,
      consumed_carbs_g: 50.0,
      consumed_fat_g: 8.0,
      meals: [
        { id: 'breakfast', type: 'Breakfast', name: 'Vegetable Poha + Curd', calories: 330, protein: 12.5, status: 'completed', completed: true, time: '08:30', diet_fit: 'fits_plan', fit_message: 'Healthy morning meal' },
        { id: 'lunch', type: 'Lunch', name: 'Dal Tadka + Steamed Rice', calories: 480, protein: 16.0, status: 'pending', completed: false, time: '13:15', diet_fit: null, fit_message: null },
        { id: 'snack', type: 'Snack', name: 'Fruit & Roasted Chana', calories: 195, protein: 8.0, status: 'pending', completed: false, time: '16:30', diet_fit: null, fit_message: null },
        { id: 'dinner', type: 'Dinner', name: 'Roti with Paneer Bhurji', calories: 440, protein: 22.0, status: 'pending', completed: false, time: '20:00', diet_fit: null, fit_message: null }
      ]
    });
    showToast("Day reset to morning baseline!");
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
