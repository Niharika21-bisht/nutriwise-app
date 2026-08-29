import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Gamification & Challenges State
  const [userGamification, setUserGamification] = useState(() => {
    const saved = localStorage.getItem('nutriwise_gamification');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      xp: 280,
      level: 2,
      level_name: "Habit Builder",
      active_challenges: {
        'hydration_7day': { joined: true, current_day: 3, total_days: 7, completed: false, last_logged_date: null },
        'veggie_boost': { joined: true, current_day: 2, total_days: 7, completed: false, last_logged_date: null }
      },
      vegetables_tracked: [
        "Spinach (Palak)", "Tomato", "Cucumber", "Green Peas", "Bhindi (Okra)", "Carrots"
      ],
      unlocked_badges: [
        { id: 'first_scan', title: 'First Food Scan', icon: '📸', desc: 'Analyzed first meal with AI ML classifier' },
        { id: 'hydration_streak', title: 'Hydration Starter', icon: '💧', desc: 'Hit 2.4L water goal' }
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

  useEffect(() => {
    localStorage.setItem('nutriwise_gamification', JSON.stringify(userGamification));
  }, [userGamification]);

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
        if (m.diet_fit === 'divergent') multiplier = 0.50;
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

  // 1-Tap Log Planned Meal
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

    // Award Gamification XP
    awardXP(30, `Logged planned ${slotId}`);
    showToast(`Logged planned ${planned.title} (${planned.calories} kcal)! 🥗 +30 XP`);
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
      showToast("+250ml Hydration logged! 💧 +10 XP");
      awardXP(10, "Logged hydration");
      return {
        ...prev,
        water_ml: newWater,
        score: newScore
      };
    });
  };

  const logCustomScannedMeal = (foodItem, targetSlot = 'lunch') => {
    const isUnhealthy = (foodItem.name || "").toLowerCase().includes("samosa") ||
                        (foodItem.name || "").toLowerCase().includes("pakora") ||
                        (foodItem.name || "").toLowerCase().includes("pizza") ||
                        (foodItem.name || "").toLowerCase().includes("burger") ||
                        (foodItem.name || "").toLowerCase().includes("fries");

    const verdict = isUnhealthy ? 'divergent' : 'fits_plan';
    const message = isUnhealthy
      ? `Logged ${foodItem.name} (${foodItem.calories} kcal) — Diverges from plan target.`
      : `Logged ${foodItem.name} (${foodItem.calories} kcal, ${foodItem.protein_g}g protein) — Fits plan target.`;

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
            diet_fit: verdict,
            fit_message: message,
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
          diet_fit: verdict,
          fit_message: message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

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

    awardXP(isUnhealthy ? 15 : 40, `Logged ${targetSlot}`);
    showToast(`Logged as ${targetSlot}! ${isUnhealthy ? '⚠️ High Calorie' : '✅ Good Choice!'} +${isUnhealthy ? 15 : 40} XP`);
    setCurrentScreen('home');
  };

  // Gamification Actions
  const awardXP = (points, reason) => {
    setUserGamification(prev => {
      const newXP = prev.xp + points;
      const newLevel = Math.floor(newXP / 200) + 1;
      let level_name = prev.level_name;
      if (newLevel === 1) level_name = "Nutrition Rookie";
      else if (newLevel === 2) level_name = "Habit Builder";
      else if (newLevel === 3) level_name = "Consistency Pro";
      else if (newLevel >= 4) level_name = "Wellness Champion";

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        level_name
      };
    });
  };

  const joinChallenge = (challengeId, totalDays = 7) => {
    setUserGamification(prev => {
      const current = prev.active_challenges || {};
      const updated = {
        ...current,
        [challengeId]: {
          joined: true,
          current_day: 1,
          total_days: totalDays,
          completed: false,
          last_logged_date: new Date().toISOString().split('T')[0]
        }
      };
      return {
        ...prev,
        active_challenges: updated
      };
    });
    awardXP(50, `Joined challenge ${challengeId}`);
    showToast("Challenge Joined! 🎮 Let's build healthy habits together! +50 XP");
  };

  const advanceChallengeDay = (challengeId) => {
    setUserGamification(prev => {
      const ch = prev.active_challenges?.[challengeId];
      if (!ch) return prev;

      const newDay = ch.current_day + 1;
      const isCompleted = newDay >= ch.total_days;

      const updated = {
        ...prev.active_challenges,
        [challengeId]: {
          ...ch,
          current_day: Math.min(ch.total_days, newDay),
          completed: isCompleted,
          last_logged_date: new Date().toISOString().split('T')[0]
        }
      };

      if (isCompleted) {
        awardXP(300, `Completed ${challengeId}`);
        showToast("🏆 Congratulations! Challenge Complete! +300 XP 🎉");
      } else {
        awardXP(40, `Day completed in ${challengeId}`);
        showToast(`Day ${newDay}/${ch.total_days} check-in recorded! 🌟 +40 XP`);
      }

      return {
        ...prev,
        active_challenges: updated
      };
    });
  };

  const toggleVegetableTracked = (vegName) => {
    setUserGamification(prev => {
      const list = prev.vegetables_tracked || [];
      let updated;
      if (list.includes(vegName)) {
        updated = list.filter(v => v !== vegName);
      } else {
        updated = [...list, vegName];
        awardXP(15, `Added vegetable ${vegName}`);
        showToast(`Added ${vegName} to your diversity list! 🥦 +15 XP`);
      }
      return {
        ...prev,
        vegetables_tracked: updated
      };
    });
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
      userGamification,
      joinChallenge,
      advanceChallengeDay,
      toggleVegetableTracked,
      awardXP,
      toggleMealCompleted,
      logPlannedMeal,
      unlogMeal,
      skipMeal,
      addWaterGlass,
      logCustomScannedMeal,
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
