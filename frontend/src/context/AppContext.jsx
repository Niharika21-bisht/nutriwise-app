import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_USER_PROFILE } from '../data/sampleData';
import { fetchDietPlan, calculateClientTargets } from '../services/api';
import { generateAvatarUrl } from '../services/googleAuth';

const AppContext = createContext();

// Helper to sanitize email for localStorage keys
const getUserKey = (email) => {
  if (!email) return 'guest';
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
};

const createDefaultTodayLog = () => ({
  date: new Date().toISOString().split('T')[0],
  score: 0,
  water_ml: 0,
  water_target_ml: 2500,
  steps: 0,
  step_target: 10000,
  meals: [
    { id: 'breakfast', type: 'Breakfast', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '08:30', diet_fit: null, fit_message: null },
    { id: 'lunch', type: 'Lunch', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '13:15', diet_fit: null, fit_message: null },
    { id: 'snack', type: 'Snack', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '16:30', diet_fit: null, fit_message: null },
    { id: 'dinner', type: 'Dinner', name: '', calories: 0, protein: 0, status: 'pending', completed: false, time: '20:00', diet_fit: null, fit_message: null }
  ]
});

const createDefaultGamification = () => ({
  xp: 100,
  level: 1,
  level_name: "Nutrition Rookie",
  active_challenges: {
    'hydration_7day': { joined: true, current_day: 1, total_days: 7, completed: false, last_logged_date: null },
    'veggie_boost': { joined: true, current_day: 1, total_days: 7, completed: false, last_logged_date: null }
  },
  vegetables_tracked: [],
  unlocked_badges: [
    { id: 'welcome_badge', title: 'NutriWise Explorer', icon: '🌟', desc: 'Joined NutriWise with Google account' }
  ]
});

export function AppProvider({ children }) {
  // Active User Profile / Session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nutriwise_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Logged-in State (Mandatory Login: false if no active user)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const session = localStorage.getItem('nutriwise_session');
      const activeUser = localStorage.getItem('nutriwise_active_user');
      return Boolean(session && JSON.parse(session) && activeUser);
    } catch (e) {
      return false;
    }
  });

  // Navigation Screen State
  const [currentScreen, setCurrentScreen] = useState(() => {
    const savedScreen = localStorage.getItem('nutriwise_screen');
    const session = localStorage.getItem('nutriwise_session');
    const activeUser = localStorage.getItem('nutriwise_active_user');
    const logged = Boolean(session && JSON.parse(session) && activeUser);

    if (!logged) {
      return ['welcome', 'auth'].includes(savedScreen) ? savedScreen : 'welcome';
    }
    return savedScreen || 'home';
  });

  // User Profile (Scoped by active user)
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const activeUser = localStorage.getItem('nutriwise_active_user');
      if (activeUser) {
        const u = JSON.parse(activeUser);
        const key = getUserKey(u.email);
        const saved = localStorage.getItem(`nutriwise_profile_${key}`);
        if (saved) {
          return { ...DEFAULT_USER_PROFILE, ...JSON.parse(saved) };
        }
        return {
          ...DEFAULT_USER_PROFILE,
          name: u.name || 'User',
          email: u.email,
          profile_image: u.picture || generateAvatarUrl(u.name, u.email),
          auth_provider: u.provider || 'google'
        };
      }
    } catch (e) {}
    return DEFAULT_USER_PROFILE;
  });

  // Calculated Macro Targets
  const [macroTargets, setMacroTargets] = useState(() => calculateClientTargets(userProfile));

  // Generated Diet Plan (7-Day Blueprint)
  const [dietPlan, setDietPlan] = useState(null);
  const [loadingDietPlan, setLoadingDietPlan] = useState(false);

  // Today's Log (Scoped by active user)
  const [todayLog, setTodayLog] = useState(() => {
    try {
      const activeUser = localStorage.getItem('nutriwise_active_user');
      if (activeUser) {
        const u = JSON.parse(activeUser);
        const key = getUserKey(u.email);
        const saved = localStorage.getItem(`nutriwise_today_log_${key}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          const todayStr = new Date().toISOString().split('T')[0];
          if (parsed.date === todayStr) return parsed;
        }
      }
    } catch (e) {}
    return createDefaultTodayLog();
  });

  // Calendar History (Scoped by active user)
  const [calendarHistory, setCalendarHistory] = useState(() => {
    try {
      const activeUser = localStorage.getItem('nutriwise_active_user');
      if (activeUser) {
        const u = JSON.parse(activeUser);
        const key = getUserKey(u.email);
        const saved = localStorage.getItem(`nutriwise_calendar_history_${key}`);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {}
    return {};
  });

  // Gamification & Challenges State (Scoped by active user)
  const [userGamification, setUserGamification] = useState(() => {
    try {
      const activeUser = localStorage.getItem('nutriwise_active_user');
      if (activeUser) {
        const u = JSON.parse(activeUser);
        const key = getUserKey(u.email);
        const saved = localStorage.getItem(`nutriwise_gamification_${key}`);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {}
    return createDefaultGamification();
  });

  // Active Scanned Food Item Result
  const [activeScanResult, setActiveScanResult] = useState(null);

  // Active Meal Improvement Result
  const [activeMealUpgrade, setActiveMealUpgrade] = useState(null);

  // App Viewport mode: 'mobile' frame or 'desktop' full screen
  const [viewportMode, setViewportMode] = useState('mobile');

  // Toasts
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  }, []);

  // Theme State: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('nutriwise_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) {}
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(next === 'dark' ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️');
      return next;
    });
  };

  const setThemeMode = (mode) => {
    if (mode === 'dark' || mode === 'light') {
      setTheme(mode);
      showToast(mode === 'dark' ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️');
    }
  };

  // Sync theme class to document.documentElement
  useEffect(() => {
    try {
      localStorage.setItem('nutriwise_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, [theme]);

  // Sync current screen to localStorage
  useEffect(() => {
    localStorage.setItem('nutriwise_screen', currentScreen);
  }, [currentScreen]);

  // Sync session state
  useEffect(() => {
    localStorage.setItem('nutriwise_session', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  // Sync user profile to localStorage (User Scoped)
  useEffect(() => {
    if (currentUser?.email) {
      const key = getUserKey(currentUser.email);
      localStorage.setItem(`nutriwise_profile_${key}`, JSON.stringify(userProfile));
    }
    const targets = calculateClientTargets(userProfile);
    setMacroTargets(targets);
    refreshDietPlan(userProfile);
  }, [userProfile, currentUser]);

  // Sync today's log and calendar history (User Scoped)
  useEffect(() => {
    if (currentUser?.email) {
      const key = getUserKey(currentUser.email);
      localStorage.setItem(`nutriwise_today_log_${key}`, JSON.stringify(todayLog));

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
          localStorage.setItem(`nutriwise_calendar_history_${key}`, JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [todayLog, currentUser]);

  // Sync gamification (User Scoped)
  useEffect(() => {
    if (currentUser?.email) {
      const key = getUserKey(currentUser.email);
      localStorage.setItem(`nutriwise_gamification_${key}`, JSON.stringify(userGamification));
    }
  }, [userGamification, currentUser]);

  // Load a user's isolated data upon switching or logging in
  const loadUserData = (userData) => {
    const key = getUserKey(userData.email);

    // 1. Profile
    const savedProfile = localStorage.getItem(`nutriwise_profile_${key}`);
    let loadedProfile;
    if (savedProfile) {
      loadedProfile = { ...DEFAULT_USER_PROFILE, ...JSON.parse(savedProfile) };
    } else {
      loadedProfile = {
        ...DEFAULT_USER_PROFILE,
        name: userData.name || 'User',
        email: userData.email,
        profile_image: userData.picture || generateAvatarUrl(userData.name, userData.email),
        auth_provider: userData.provider || 'google'
      };
      localStorage.setItem(`nutriwise_profile_${key}`, JSON.stringify(loadedProfile));
    }
    setUserProfile(loadedProfile);

    // 2. Today Log
    const savedLog = localStorage.getItem(`nutriwise_today_log_${key}`);
    const todayStr = new Date().toISOString().split('T')[0];
    if (savedLog) {
      try {
        const parsed = JSON.parse(savedLog);
        if (parsed.date === todayStr) {
          setTodayLog(parsed);
        } else {
          const freshLog = createDefaultTodayLog();
          setTodayLog(freshLog);
          localStorage.setItem(`nutriwise_today_log_${key}`, JSON.stringify(freshLog));
        }
      } catch (e) {
        setTodayLog(createDefaultTodayLog());
      }
    } else {
      const freshLog = createDefaultTodayLog();
      setTodayLog(freshLog);
      localStorage.setItem(`nutriwise_today_log_${key}`, JSON.stringify(freshLog));
    }

    // 3. Calendar History
    const savedCal = localStorage.getItem(`nutriwise_calendar_history_${key}`);
    if (savedCal) {
      try {
        setCalendarHistory(JSON.parse(savedCal));
      } catch (e) {
        setCalendarHistory({});
      }
    } else {
      setCalendarHistory({});
    }

    // 4. Gamification
    const savedGam = localStorage.getItem(`nutriwise_gamification_${key}`);
    if (savedGam) {
      try {
        setUserGamification(JSON.parse(savedGam));
      } catch (e) {
        setUserGamification(createDefaultGamification());
      }
    } else {
      const freshGam = createDefaultGamification();
      setUserGamification(freshGam);
      localStorage.setItem(`nutriwise_gamification_${key}`, JSON.stringify(freshGam));
    }
  };

  // Google Login Handler
  const loginWithGoogle = (googleUserData) => {
    const formattedUser = {
      email: googleUserData.email.toLowerCase().trim(),
      name: googleUserData.name || googleUserData.email.split('@')[0],
      picture: googleUserData.picture || generateAvatarUrl(googleUserData.name, googleUserData.email),
      googleId: googleUserData.sub || googleUserData.googleId || `g_${Date.now()}`,
      provider: 'google'
    };

    // Save active user
    localStorage.setItem('nutriwise_active_user', JSON.stringify(formattedUser));
    localStorage.setItem('nutriwise_session', JSON.stringify(true));
    setCurrentUser(formattedUser);
    setIsLoggedIn(true);

    // Load data for this user
    loadUserData(formattedUser);

    const key = getUserKey(formattedUser.email);
    const existingProfile = localStorage.getItem(`nutriwise_profile_${key}`);

    // Check if new user or existing
    if (!existingProfile) {
      showToast(`Welcome to NutriWise, ${formattedUser.name}! Let's personalize your goals 🚀`);
      setCurrentScreen('questionnaire');
    } else {
      showToast(`Welcome back, ${formattedUser.name}! 👋 Google connected`);
      setCurrentScreen('home');
    }
  };

  // Standard Login/Signup Handler
  const loginWithCredentials = (userData, isSignUp = false) => {
    const formattedUser = {
      email: userData.email.toLowerCase().trim(),
      name: userData.name || userData.email.split('@')[0],
      picture: userData.picture || generateAvatarUrl(userData.name, userData.email),
      provider: 'email'
    };

    localStorage.setItem('nutriwise_active_user', JSON.stringify(formattedUser));
    localStorage.setItem('nutriwise_session', JSON.stringify(true));
    setCurrentUser(formattedUser);
    setIsLoggedIn(true);

    loadUserData(formattedUser);

    if (isSignUp) {
      showToast("Account created successfully! Welcome to NutriWise 🚀");
      setCurrentScreen('questionnaire');
    } else {
      showToast(`Welcome back, ${formattedUser.name}! 👋`);
      setCurrentScreen('home');
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
    setUserProfile(prev => {
      const updated = { ...prev, ...updatedFields };
      if (currentUser?.email) {
        const key = getUserKey(currentUser.email);
        localStorage.setItem(`nutriwise_profile_${key}`, JSON.stringify(updated));
      }
      return updated;
    });
    showToast("Profile & recommendations updated! ✨");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('nutriwise_session');
    localStorage.removeItem('nutriwise_active_user');
    setUserProfile(DEFAULT_USER_PROFILE);
    setTodayLog(createDefaultTodayLog());
    setCalendarHistory({});
    setUserGamification(createDefaultGamification());
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

  const addWaterAmount = (amountMl = 250) => {
    setTodayLog(prev => {
      const newWater = Math.min((macroTargets.target_water_ml || 2500) + 2000, (prev.water_ml || 0) + amountMl);
      const newScore = recalculateDayScore(prev.meals, newWater, macroTargets.target_water_ml);
      showToast(`+${amountMl}ml Hydration logged! 💧 +15 XP`);
      awardXP(15, "Logged hydration");
      return {
        ...prev,
        water_ml: newWater,
        score: newScore
      };
    });
  };

  const removeWaterAmount = (amountMl = 250) => {
    setTodayLog(prev => {
      const newWater = Math.max(0, (prev.water_ml || 0) - amountMl);
      const newScore = recalculateDayScore(prev.meals, newWater, macroTargets.target_water_ml);
      showToast(`-${amountMl}ml Hydration removed`);
      return {
        ...prev,
        water_ml: newWater,
        score: newScore
      };
    });
  };

  const addProteinAmount = (amountG = 10) => {
    setTodayLog(prev => {
      const newProtein = Number(((prev.consumed_protein_g || 0) + amountG).toFixed(1));
      const newScore = recalculateDayScore(prev.meals, prev.water_ml, macroTargets.target_water_ml);
      showToast(`+${amountG}g Protein logged! 💪 +20 XP`);
      awardXP(20, "Logged protein fuel");
      return {
        ...prev,
        consumed_protein_g: newProtein,
        score: newScore
      };
    });
  };

  const removeProteinAmount = (amountG = 10) => {
    setTodayLog(prev => {
      const newProtein = Math.max(0, Number(((prev.consumed_protein_g || 0) - amountG).toFixed(1)));
      const newScore = recalculateDayScore(prev.meals, prev.water_ml, macroTargets.target_water_ml);
      showToast(`-${amountG}g Protein removed`);
      return {
        ...prev,
        consumed_protein_g: newProtein,
        score: newScore
      };
    });
  };

  const addMealBalanceBoost = (boostType, points = 15, title = "Nutrient Boost") => {
    setTodayLog(prev => {
      const currentBalance = prev.meal_balance !== undefined ? prev.meal_balance : ((prev.score || 0) >= 80 ? 88 : (prev.score || 0) > 0 ? 65 : 45);
      const newBalance = Math.min(100, currentBalance + points);
      const newScore = Math.min(99, (prev.score || 0) + Math.round(points / 3));
      showToast(`+${points}% ${title} applied! 🥗 +25 XP`);
      awardXP(25, `Applied ${title}`);
      return {
        ...prev,
        meal_balance: newBalance,
        score: newScore
      };
    });
  };

  const updateProteinTarget = (targetG) => {
    const num = Number(targetG);
    if (!isNaN(num) && num >= 30 && num <= 300) {
      setMacroTargets(prev => ({
        ...prev,
        target_protein_g: num
      }));
      showToast(`Daily protein target updated to ${num}g! 🏋️✨`);
    }
  };

  const updateWaterTarget = (targetMl) => {
    const num = Number(targetMl);
    if (!isNaN(num) && num >= 500 && num <= 6000) {
      setMacroTargets(prev => ({
        ...prev,
        target_water_ml: num
      }));
      setTodayLog(prev => ({
        ...prev,
        water_target_ml: num,
        score: recalculateDayScore(prev.meals, prev.water_ml, num)
      }));
      showToast(`Daily water target updated to ${num}ml! 💧✨`);
    }
  };

  const addSteps = (stepCount = 1000) => {
    setTodayLog(prev => {
      const newSteps = (prev.steps || 0) + stepCount;
      const xpEarned = Math.round(stepCount / 100);
      showToast(`+${stepCount.toLocaleString()} Steps logged! 👟 +${xpEarned} XP`);
      awardXP(xpEarned, "Logged walking steps");
      return {
        ...prev,
        steps: newSteps
      };
    });
  };

  const updateStepTarget = (targetSteps = 10000) => {
    setTodayLog(prev => ({
      ...prev,
      step_target: targetSteps
    }));
    showToast(`Daily step goal set to ${targetSteps.toLocaleString()} steps! 🎯`);
  };

  const get7DayWaterData = () => {
    const days = [
      { date: '24/08', label: '24/08', fullDate: '24/08/2026', amount: 0 },
      { date: '25/08', label: '25/08', fullDate: '25/08/2026', amount: 0 },
      { date: '26/08', label: '26/08', fullDate: '26/08/2026', amount: 0 },
      { date: '27/08', label: '27/08', fullDate: '27/08/2026', amount: 0 },
      { date: '28/08', label: '28/08', fullDate: '28/08/2026', amount: 0 },
      { date: '29/08', label: '29/08', fullDate: '29/08/2026', amount: 0 },
      { date: '30/08', label: '30/08', fullDate: '30/08/2026', amount: todayLog.water_ml || 0, isToday: true }
    ];
    return days;
  };

  const get7DayStepData = () => {
    const days = [
      { date: '30/08', label: '30/08', fullDate: '30/08/2026', steps: todayLog.steps || 0, isToday: true },
      { date: '31/08', label: '31/08', fullDate: '31/08/2026', steps: 0 },
      { date: '01/09', label: '01/09', fullDate: '01/09/2026', steps: 0 },
      { date: '02/09', label: '02/09', fullDate: '02/09/2026', steps: 0 },
      { date: '03/09', label: '03/09', fullDate: '03/09/2026', steps: 0 },
      { date: '04/09', label: '04/09', fullDate: '04/09/2026', steps: 0 },
      { date: '05/09', label: '05/09', fullDate: '05/09/2026', steps: 0 }
    ];
    return days;
  };

  const addWaterGlass = () => {
    addWaterAmount(250);
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
      currentUser,
      isLoggedIn,
      loginWithGoogle,
      loginWithCredentials,
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
      addWaterAmount,
      removeWaterAmount,
      updateWaterTarget,
      addProteinAmount,
      removeProteinAmount,
      updateProteinTarget,
      addMealBalanceBoost,
      addSteps,
      updateStepTarget,
      get7DayWaterData,
      get7DayStepData,
      logCustomScannedMeal,
      activeScanResult,
      setActiveScanResult,
      activeMealUpgrade,
      setActiveMealUpgrade,
      viewportMode,
      setViewportMode,
      theme,
      toggleTheme,
      setThemeMode,
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
