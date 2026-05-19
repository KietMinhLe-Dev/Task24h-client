import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Check,
  Calendar,
  Search,
  Moon,
  Sun,
  Briefcase,
  Heart,
  User,
  BookOpen,
  Gamepad2,
  Edit3,
  X,
  Hourglass,
  Award,
  Flame,
  Zap,
  TrendingUp,
  Lightbulb,
  Settings,
  AlertTriangle
} from 'lucide-react';

// Dynamic API URL getter with a smart heuristic domain fallback
const getApiBaseUrl = () => {
  const saved = localStorage.getItem('REACT_APP_API_BASE_URL');
  if (saved) return saved.trim();
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Smart heuristic guess: if we are on Render, automatically point to the corresponding API domain
    if (hostname.includes('onrender.com')) {
      // Replaces -client with -api automatically to find the deployed backend service
      const guessedApiHost = hostname.replace('-client', '-api').replace('fe.', 'be.');
      return `https://${guessedApiHost}/api/tasks`;
    }
  }
  
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/tasks';
};

// Beautiful Vietnamese motivational quotes
const MOTIVATIONAL_QUOTES = [
  "Hành trình vạn dặm luôn bắt đầu bằng một bước chân nhỏ bé.",
  "Năng suất không phải là làm nhiều việc hơn, mà là làm có chủ đích hơn.",
  "Hãy làm việc trong im lặng, để thành công tự lên tiếng.",
  "Tập trung là chìa khóa mở ra mọi cánh cửa của sự thăng hoa.",
  "Kỷ luật là cầu nối giữa mục tiêu và thành tựu thực tế.",
  "Mỗi chu kỳ 24h là một cơ hội tuyệt vời để làm mới bản thân!"
];

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [isDark, setIsDark] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // API dynamic settings states
  const [apiBaseUrl, setApiBaseUrl] = useState(getApiBaseUrl());
  const [apiError, setApiError] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configUrl, setConfigUrl] = useState(getApiBaseUrl());

  // Rotating Quote state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Real-time ticking trigger
  const [, setTick] = useState(0);

  // Dynamic start & end time calculators
  const getInitialTimes = () => {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMin = now.getMinutes().toString().padStart(2, '0');
    const nextHour = ((now.getHours() + 1) % 24).toString().padStart(2, '0');
    return {
      startTime: `${currentHour}:${currentMin}`,
      endTime: `${nextHour}:${currentMin}`
    };
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'work',
    priority: 'medium',
    startTime: getInitialTimes().startTime,
    endTime: getInitialTimes().endTime,
    durationHours: ''
  });

  const categories = {
    work: {
      label: 'Công việc',
      icon: <Briefcase className="w-4 h-4" />,
      color: 'bg-indigo-500',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20',
      bg: 'bg-indigo-500/5'
    },
    personal: {
      label: 'Cá nhân',
      icon: <User className="w-4 h-4" />,
      color: 'bg-emerald-500',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5'
    },
    health: {
      label: 'Sức khỏe',
      icon: <Heart className="w-4 h-4" />,
      color: 'bg-rose-500',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/5'
    },
    study: {
      label: 'Học tập',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'bg-amber-500',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/5'
    },
    leisure: {
      label: 'Giải trí',
      icon: <Gamepad2 className="w-4 h-4" />,
      color: 'bg-cyan-500',
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bg: 'bg-cyan-500/5'
    }
  };

  const priorities = {
    high: { label: 'Cao', dot: 'bg-rose-500', badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    medium: { label: 'Trung bình', dot: 'bg-amber-500', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    low: { label: 'Thấp', dot: 'bg-emerald-500', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}?date=${currentDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to contact the API Server");
      }
      const data = await response.json();
      
      // Merge with localStorage backup map to guarantee it works instantly
      const localDurations = JSON.parse(localStorage.getItem('REACT_APP_TASK_DURATIONS') || '{}');
      const processedData = data.map(t => ({
        ...t,
        durationHours: t.durationHours || localDurations[t.id] || ''
      }));

      setTasks(processedData);
      setApiError(false);
    } catch (error) {
      console.error(error);
      
      // Self-healing recovery fallback in both directions (bridges task2h-api and task24h-api differences)
      let fallbackUrl = null;
      if (apiBaseUrl.includes('task2h-api.onrender.com')) {
        fallbackUrl = apiBaseUrl.replace('task2h-api', 'task24h-api');
      } else if (apiBaseUrl.includes('task24h-api.onrender.com')) {
        fallbackUrl = apiBaseUrl.replace('task24h-api', 'task2h-api');
      }

      if (fallbackUrl) {
        try {
          const fallbackResponse = await fetch(`${fallbackUrl}?date=${currentDate}`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            
            // Merge with localStorage backup map
            const localDurations = JSON.parse(localStorage.getItem('REACT_APP_TASK_DURATIONS') || '{}');
            const processedFallbackData = fallbackData.map(t => ({
              ...t,
              durationHours: t.durationHours || localDurations[t.id] || ''
            }));

            setTasks(processedFallbackData);
            setApiBaseUrl(fallbackUrl);
            localStorage.setItem('REACT_APP_API_BASE_URL', fallbackUrl);
            setApiError(false);
            setLoading(false);
            return;
          }
        } catch (fbErr) {
          console.error("Self-healing fallback failed:", fbErr);
        }
      }
      
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  // Clock tick & Quote cycler
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);

    const quoteTimer = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, apiBaseUrl]);

  const resetForm = () => {
    const times = getInitialTimes();
    setFormData({
      title: '',
      description: '',
      category: 'work',
      priority: 'medium',
      startTime: times.startTime,
      endTime: times.endTime,
      durationHours: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const method = editingTask ? 'PUT' : 'POST';
      const url = editingTask
        ? `${apiBaseUrl}/${editingTask.id}`
        : apiBaseUrl;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          date: currentDate
        })
      });

      if (response.ok) {
        const savedTask = await response.json();
        
        // Save/Update in localStorage backup map
        const localDurations = JSON.parse(localStorage.getItem('REACT_APP_TASK_DURATIONS') || '{}');
        if (formData.durationHours) {
          localDurations[savedTask.id] = Number(formData.durationHours);
        } else {
          delete localDurations[savedTask.id];
        }
        localStorage.setItem('REACT_APP_TASK_DURATIONS', JSON.stringify(localDurations));

        fetchTasks();
        setIsModalOpen(false);
        resetForm();
        setEditingTask(null);
        setApiError(false);
      } else {
        throw new Error("Failed to submit task");
      }
    } catch (error) {
      console.error(error);
      setApiError(true);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const response = await fetch(`${apiBaseUrl}/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: !task.completed
        })
      });
      if (response.ok) {
        fetchTasks();
        setApiError(false);
      } else {
        throw new Error("Failed to toggle completion");
      }
    } catch (error) {
      console.error(error);
      setApiError(true);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${apiBaseUrl}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Clean up from localStorage backup map
        const localDurations = JSON.parse(localStorage.getItem('REACT_APP_TASK_DURATIONS') || '{}');
        delete localDurations[id];
        localStorage.setItem('REACT_APP_TASK_DURATIONS', JSON.stringify(localDurations));

        fetchTasks();
        setApiError(false);
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      console.error(error);
      setApiError(true);
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      startTime: task.startTime || '09:00',
      endTime: task.endTime || '10:00',
      durationHours: task.durationHours || ''
    });
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      filterCategory === 'all' || task.category === filterCategory;

    const matchPriority =
      filterPriority === 'all' || task.priority === filterPriority;

    return matchSearch && matchCategory && matchPriority;
  });

  const completed = tasks.filter((t) => t.completed).length;

  const progress =
    tasks.length > 0
      ? Math.round((completed / tasks.length) * 100)
      : 0;

  // Helper: Retrieve creation millisecond timestamp
  const getTaskCreationTime = (task) => {
    if (task.createdAt) return new Date(task.createdAt).getTime();
    const match = task.id.match(/task-(\d+)/);
    if (match) {
      const ts = parseInt(match[1], 10);
      if (ts > 1000000000000) return ts;
    }
    return new Date().getTime() - 3600 * 1000;
  };

  // Helper: Calculate ticking remaining seconds in a task's 24h budget
  const getTaskCountdownStr = (task) => {
    const createdTime = getTaskCreationTime(task);
    const now = new Date().getTime();
    
    const elapsedSeconds = Math.floor((now - createdTime) / 1000);
    const budgetHours = task.durationHours ? Number(task.durationHours) : 24;
    const totalSeconds = budgetHours * 60 * 60; 
    const remainingSeconds = totalSeconds - elapsedSeconds;
    
    if (remainingSeconds <= 0) {
      return "expired";
    }
    
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Category statistics breakdown
  const getCategoryStats = () => {
    const keys = ['work', 'personal', 'health', 'study', 'leisure'];
    return keys.map(k => {
      const catTasks = tasks.filter(t => t.category === k);
      const total = catTasks.length;
      const done = catTasks.filter(t => t.completed).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { key: k, total, done, pct };
    });
  };
  const categoryStatsBreakdown = getCategoryStats();

  // Dynamic Productivity Rank
  const getProductivityRank = (percent) => {
    if (percent === 0) return { title: "Khởi đầu nhẹ nhàng 🌱", color: "text-zinc-400" };
    if (percent > 0 && percent <= 35) return { title: "Đang khởi động 🏃", color: "text-indigo-400" };
    if (percent > 35 && percent <= 70) return { title: "Đang bứt phá 🔥", color: "text-purple-400" };
    if (percent > 70 && percent < 100) return { title: "Tập trung cực độ ⚡", color: "text-cyan-400" };
    return { title: "Siêu nhân hoàn thành 🚀", color: "text-emerald-400" };
  };
  const rank = getProductivityRank(progress);

  // Circular progress dimensions
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`min-h-screen transition-all duration-300 relative overflow-hidden pb-16 ${
        isDark
          ? 'bg-[#060509] text-zinc-100'
          : 'bg-[#f4f7fb] text-slate-800'
      }`}
    >
      {/* Decorative premium blurred ambient glow backdrops */}
      <div className="absolute top-0 left-0 w-full h-[55rem] pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-[-25rem] left-[5%] w-[55rem] h-[55rem] rounded-full blur-[160px] transition-opacity duration-1000 ${
          isDark ? 'bg-indigo-600/10 opacity-100' : 'bg-indigo-400/5 opacity-80'
        }`} />
        <div className={`absolute top-[-20rem] right-[5%] w-[50rem] h-[50rem] rounded-full blur-[160px] transition-opacity duration-1000 ${
          isDark ? 'bg-purple-600/10 opacity-100' : 'bg-purple-400/5 opacity-80'
        }`} />
      </div>

      {/* HEADER */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
          isDark
            ? 'bg-[#060509]/80 border-zinc-900'
            : 'bg-white/80 border-slate-200 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <div>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em]">
                Task 24H
              </p>
              <h1 className="text-xl font-extrabold tracking-tight mt-0.5">
                Quản lý công việc
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dynamic API Status and Settings Button */}
            {/* Dynamic API Status and Settings Button (Only visible on connection error) */}
            {apiError && (
              <button
                onClick={() => {
                  setConfigUrl(apiBaseUrl);
                  setIsConfigOpen(true);
                }}
                className="h-11 px-4 rounded-2xl flex items-center gap-2 text-xs font-extrabold transition-all border bg-rose-500/15 text-rose-450 border-rose-500/35 hover:bg-rose-500/25"
                title="Cấu hình Kết nối Máy chủ API"
              >
                <Settings className="w-4 h-4 shrink-0 animate-pulse text-rose-450" />
                <span className="hidden md:inline">Lỗi kết nối API</span>
              </button>
            )}

            <button
              onClick={() => setIsDark(!isDark)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-indigo-650'
              }`}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => {
                resetForm();
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="h-11 px-5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold flex items-center gap-2 transition shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Thêm task
            </button>
          </div>
        </div>
      </header>

      {/* Floating Actionable API Error Banner */}
      {apiError && (
        <div className="bg-rose-500/15 border-b border-rose-500/25 px-6 py-4 text-center text-xs font-bold text-rose-450 flex flex-wrap items-center justify-center gap-3 animate-fadeIn relative z-30">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <AlertTriangle className="w-4 h-4 animate-bounce text-rose-400 shrink-0" />
            <span>
              Không thể kết nối đến Máy chủ API tại <code>{apiBaseUrl}</code>. Đã khởi chạy API server chưa, hoặc bạn đã cấu hình URL Render chưa?
            </span>
          </div>
          <button 
            onClick={() => {
              setConfigUrl(apiBaseUrl);
              setIsConfigOpen(true);
            }}
            className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all font-extrabold shadow-[0_2px_10px_rgba(244,63,94,0.3)] active:scale-95 text-[10px]"
          >
            Liên kết URL Render Ngay
          </button>
        </div>
      )}

      {/* MAIN */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[330px_1fr] gap-8">
        
        {/* SIDEBAR */}
        <aside className="space-y-6">
          
          {/* CARD: Radial Progress Indicator */}
          <div
            className={`rounded-3xl p-6 border transition-all duration-300 ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-900/80 shadow-2xl'
                : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Tiến độ hôm nay
                </p>
                <h2 className={`text-3xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {progress}%
                </h2>
                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold mt-2 flex items-center gap-1.5 w-fit ${
                  isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  <Award className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>{rank.title}</span>
                </div>
              </div>

              {/* Progress Ring Visual */}
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className={`stroke-current ${isDark ? 'text-zinc-800' : 'text-slate-100'}`}
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#6366f1"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black">
                  {completed}/{tasks.length}
                </div>
              </div>
            </div>

            <div className={`h-[1px] w-full my-5 ${isDark ? 'bg-zinc-800/80' : 'bg-slate-100'}`} />

            {/* Streak Booster Card indicator */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 animate-pulse">
                <Flame className="w-4 h-4 fill-amber-500" />
              </div>
              <div className="text-xs font-bold text-zinc-555 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                <span>Chuỗi làm việc ngày:</span>
                <span className="text-amber-400">5 ngày 🔥</span>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTERS PANEL */}
          <div
            className={`rounded-3xl p-6 border space-y-5 ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-900/80 shadow-2xl'
                : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500 transition-colors group-focus-within:text-indigo-400" />
              <input
                type="text"
                placeholder="Tìm kế hoạch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full h-11 pl-11 pr-4 rounded-xl outline-none text-xs font-bold transition-all ${
                  isDark
                    ? 'bg-zinc-950 border border-zinc-800/70 text-white placeholder-zinc-500 focus:border-zinc-700'
                    : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-350'
                }`}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                Phân Loại Danh Mục
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`h-9 rounded-xl text-xs font-bold transition-all ${
                    filterCategory === 'all'
                      ? 'bg-indigo-500 text-white'
                      : isDark
                      ? 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                      : 'bg-slate-100 text-slate-650 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>

                {Object.entries(categories).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setFilterCategory(key)}
                    className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      filterCategory === key
                        ? 'bg-indigo-500 text-white'
                        : isDark
                        ? 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                        : 'bg-slate-100 text-slate-650 hover:bg-slate-200'
                    }`}
                  >
                    {value.icon}
                    <span>{value.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                Độ Ưu Tiên
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['all', 'high', 'medium', 'low'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`h-9 rounded-xl text-xs font-bold capitalize transition-all ${
                      filterPriority === p
                        ? 'bg-indigo-500 text-white'
                        : isDark
                        ? 'bg-zinc-950 border border-zinc-800 text-zinc-450 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p === 'all' ? 'Tất cả' : p === 'high' ? 'Cao' : p === 'medium' ? 'T.Bình' : 'Thấp'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DYNAMIC AMBIENT WISDOM CARD */}
          <div className={`p-6 border rounded-3xl relative overflow-hidden transition-all duration-500 ${
            isDark
              ? 'bg-[#09080e]/80 border-zinc-900 ring-1 ring-white/5 shadow-2xl'
              : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div className="flex gap-3 relative z-10">
              <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className={`text-xs uppercase font-extrabold tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-650'}`}>Góc truyền cảm hứng</h4>
                <p className={`text-xs leading-relaxed italic ${isDark ? 'text-zinc-400' : 'text-slate-600'} mt-1.5 transition-opacity duration-500`}>
                  "{MOTIVATIONAL_QUOTES[currentQuoteIndex]}"
                </p>
              </div>
            </div>
          </div>

          {/* CATEGORY WORKLOAD PROGRESS CHARTS */}
          <div className={`p-6 border rounded-3xl transition-all duration-300 ${
            isDark 
              ? 'bg-zinc-900/60 border-zinc-900/80 shadow-2xl' 
              : 'bg-white border-slate-200 shadow-md'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-widest text-zinc-555 flex items-center gap-2 mb-5`}>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Năng suất danh mục
            </h4>
            
            <div className="space-y-4">
              {categoryStatsBreakdown.map(stat => {
                const conf = categories[stat.key];
                if (stat.total === 0) return null; // Only show active categories today
                
                return (
                  <div key={stat.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={`flex items-center gap-2 ${conf.text}`}>
                        {conf.icon}
                        {conf.label}
                      </span>
                      <span className={`${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {stat.done}/{stat.total} ({stat.pct}%)
                      </span>
                    </div>
                    
                    <div className={`w-full h-2 rounded-full overflow-hidden p-0.5 ${
                      isDark ? 'bg-zinc-950' : 'bg-slate-100'
                    }`}>
                      <div 
                        className={`h-full ${conf.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${stat.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {tasks.length === 0 && (
                <p className="text-xs text-zinc-555 text-center py-2 font-medium">Chưa có dữ liệu hôm nay</p>
              )}
            </div>
          </div>

        </aside>

        {/* TASKS */}
        <section className="space-y-5">
          {/* TOP BAR */}
          <div
            className={`rounded-3xl p-5 border flex items-center justify-between ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-900/80 shadow-2xl'
                : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Ngày hiện tại
              </p>
              <div className="flex items-center gap-2 mt-1 font-bold">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>{currentDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() - 1);
                  setCurrentDate(d.toISOString().split('T')[0]);
                }}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                  isDark
                    ? 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                    : 'bg-slate-100 text-slate-650 hover:bg-slate-200'
                }`}
              >
                ← Ngày trước
              </button>

              <button
                onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() + 1);
                  setCurrentDate(d.toISOString().split('T')[0]);
                }}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                  isDark
                    ? 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                    : 'bg-slate-100 text-slate-650 hover:bg-slate-200'
                }`}
              >
                Ngày tiếp →
              </button>
            </div>
          </div>

          {/* TASK LIST */}
          {loading ? (
            <div className="py-32 text-center opacity-50 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-zinc-500">Đang cập nhật...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div
              className={`rounded-3xl border border-dashed py-28 text-center ${
                isDark
                  ? 'border-zinc-800 bg-zinc-950/15'
                  : 'border-slate-300 bg-slate-50/20'
              }`}
            >
              <h3 className="text-lg font-bold">Không có công việc nào</h3>
              <p className="opacity-60 text-xs mt-2">
                Hãy click nút "Thêm task" để kích hoạt một ngày hiệu quả!
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const category = categories[task.category] || categories.work;
              const pri = priorities[task.priority] || priorities.medium;
              const remainingStr = getTaskCountdownStr(task);

              return (
                <div
                  key={task.id}
                  className={`rounded-3xl border p-6 transition-all duration-300 relative overflow-hidden group ${
                    task.completed
                      ? isDark
                        ? 'bg-zinc-950/20 border-zinc-900/40 opacity-40 shadow-none'
                        : 'bg-slate-50 border-slate-100 opacity-40 shadow-none'
                      : isDark
                      ? 'bg-zinc-900/60 border-zinc-900/80 shadow-2xl hover:border-zinc-800 hover:-translate-y-0.5'
                      : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Category Accent Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[5px] ${category.color} rounded-r-md`} />

                  <div className="flex items-start justify-between gap-5 pl-2">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleComplete(task)}
                        className={`w-[22px] h-[22px] rounded-lg border flex items-center justify-center mt-1 shrink-0 transition-all duration-200 active:scale-90 ${
                          task.completed
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : isDark
                            ? 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'
                            : 'border-slate-300 bg-white hover:border-indigo-500'
                        }`}
                      >
                        {task.completed && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h3
                          className={`text-base sm:text-lg font-bold leading-snug ${
                            task.completed
                              ? 'line-through opacity-40'
                              : isDark ? 'text-white' : 'text-slate-850'
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className={`text-xs leading-relaxed max-w-xl ${
                            task.completed ? 'opacity-40' : 'opacity-70'
                          }`}>
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2.5">
                          {/* Category Badge */}
                          <div
                            className={`h-7 px-3.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 text-white ${category.color} shadow-sm shadow-black/10`}
                          >
                            {category.icon}
                            {category.label}
                          </div>



                          {/* Priority Badge */}
                          <div
                            className={`h-7 px-3.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1.5 ${pri.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                            <span>{pri.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS ROW */}
                    <div className="flex items-center gap-2.5">
                      
                      {/* Live Ticking remaining count for uncompleted tasks */}
                      {!task.completed && (
                        <div className={`hidden sm:flex px-3.5 py-2 rounded-2xl border font-mono items-center gap-1.5 font-bold text-[11px] ${
                          remainingStr === "expired"
                            ? isDark
                              ? 'bg-rose-500/20 border-rose-500/35 text-rose-350 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                              : 'bg-rose-100 border-rose-250 text-rose-700 shadow-sm'
                            : isDark
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
                            : 'bg-rose-50 border-rose-100 text-rose-600 shadow-sm animate-pulse'
                        }`}>
                          <Hourglass className={`w-3.5 h-3.5 shrink-0 ${remainingStr === 'expired' ? 'text-rose-400' : 'animate-spin-slow'}`} />
                          <span>
                            {remainingStr === 'expired' ? "Đã hết hạn ⚠️" : remainingStr}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => openEdit(task)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isDark
                              ? 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-550'
                          }`}
                          title="Sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="w-10 h-10 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white flex items-center justify-center transition-all"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* RAYCAST / SUPERHUMAN STYLE PREMIUM COMMAND SLATE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className={`relative w-full max-w-4xl border rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 ring-1 ${
            isDark 
              ? 'bg-[#0c0b11] border-zinc-900 ring-white/5 shadow-black' 
              : 'bg-white border-slate-200 ring-black/5'
          }`}>
            
            {/* Glowing Accent Top border */}
            <div className="h-[4px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            {/* Modal Header */}
            <div className={`px-8 py-6 border-b flex items-center justify-between ${
              isDark ? 'border-zinc-900/50 bg-zinc-950/15' : 'border-slate-100 bg-slate-50/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className={`text-sm uppercase font-black tracking-widest ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  {editingTask ? "Hiệu chỉnh mục tiêu" : "Thiết lập mục tiêu mới"}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`p-2.5 rounded-xl transition-all ${
                  isDark ? 'text-zinc-500 hover:text-white hover:bg-zinc-900' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Raycast 2-Column Grid Workspace */}
            <form onSubmit={handleSubmit} className="divide-y divide-zinc-900/60">
              
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-900/60">
                
                {/* LEFT PANEL: Writing Canvas (Cols 7) */}
                <div className="md:col-span-7 p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-zinc-555 uppercase tracking-widest flex items-center gap-1.5">
                      Tiêu đề kế hoạch
                    </label>
                    <input 
                      type="text" 
                      placeholder="Nhập mục tiêu cần hoàn thành..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full text-xl sm:text-2xl font-black bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 ${
                        isDark ? 'text-white placeholder-zinc-800' : 'text-slate-805 placeholder-slate-350'
                      }`}
                      required
                    />
                  </div>

                  <div className={`h-[1px] w-full ${isDark ? 'bg-zinc-900/80' : 'bg-slate-100'}`} />

                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-zinc-555 uppercase tracking-widest flex items-center gap-1.5">
                      Mô tả chi tiết
                    </label>
                    <textarea 
                      placeholder="Ghi chú các bước thực hiện để dễ dàng theo dõi..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full text-sm sm:text-base bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 resize-none h-44 ${
                        isDark ? 'text-zinc-300 placeholder-zinc-800 font-medium leading-relaxed' : 'text-slate-700 placeholder-slate-405 leading-relaxed'
                      }`}
                    />
                  </div>

                  <div className={`h-[1px] w-full ${isDark ? 'bg-zinc-900/80' : 'bg-slate-100'}`} />

                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-zinc-555 uppercase tracking-widest flex items-center gap-1.5">
                      ⏳ Thời hạn đếm ngược (Số giờ)
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="Mặc định là 24 giờ nếu để trống..."
                      value={formData.durationHours}
                      onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                      className={`w-full text-sm font-bold bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 ${
                        isDark ? 'text-white placeholder-zinc-800' : 'text-slate-805 placeholder-slate-350'
                      }`}
                    />
                  </div>
                </div>

                {/* RIGHT PANEL: Metadata Attributer (Cols 5) */}
                <div className={`md:col-span-5 p-8 space-y-7 ${
                  isDark ? 'bg-zinc-950/20' : 'bg-slate-50/30'
                }`}>
                  
                  {/* Category Assignment */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-extrabold text-zinc-555 uppercase tracking-widest flex items-center gap-1.5">
                      📁 Phân loại danh mục
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {Object.entries(categories).map(([key, cat]) => {
                        const isSelected = formData.category === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: key })}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
                              isSelected
                                ? isDark
                                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                  : 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                                : isDark
                                  ? 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            <span className="shrink-0">{cat.icon}</span>
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Priority Assignment */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-extrabold text-zinc-555 uppercase tracking-widest flex items-center gap-1.5">
                      ⚡ Mức độ ưu tiên
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {Object.entries(priorities).map(([key, pri]) => {
                        const isSelected = formData.priority === key;
                        
                        const activeStyles = {
                          high: isDark 
                            ? 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                            : 'bg-rose-50 border-rose-500 text-rose-700 shadow-[0_0_10px_rgba(244,63,94,0.05)]',
                          medium: isDark 
                            ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                            : 'bg-amber-50 border-amber-500 text-amber-700 shadow-[0_0_10px_rgba(245,158,11,0.05)]',
                          low: isDark 
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                        };

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFormData({ ...formData, priority: key })}
                            className={`px-4.5 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
                              isSelected
                                ? activeStyles[key]
                                : isDark
                                  ? 'bg-zinc-900/30 border-zinc-800 text-zinc-555 hover:border-zinc-700 hover:text-zinc-300'
                                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${pri.dot}`} />
                            <span>{pri.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* Actions Footer with Power-User Hints */}
              <div className={`px-8 py-6 flex items-center justify-between ${
                isDark ? 'border-zinc-900/60 bg-zinc-950/10' : 'border-slate-100 bg-slate-50/15'
              }`}>
                {/* Keyboard Shortcuts Hint */}
                <div className={`text-[10px] font-bold ${isDark ? 'text-zinc-650' : 'text-slate-400'} flex items-center gap-1.5`}>
                  <span>⌨️</span>
                  <span>Enter để lưu</span>
                  <span className="mx-1.5">•</span>
                  <span>Esc để đóng</span>
                </div>

                <div className="flex items-center gap-3.5">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
                      isDark ? 'text-zinc-500 hover:text-zinc-350' : 'text-slate-400 hover:text-slate-750'
                    }`}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="text-xs font-extrabold px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.2)] transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {editingTask 
                      ? "Lưu thay đổi" 
                      : formData.durationHours 
                        ? `Kích hoạt ${formData.durationHours}h` 
                        : "Kích hoạt 24h"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* API SERVER CONFIGURATION MODAL */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className={`relative w-full max-w-lg border rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 ring-1 ${
            isDark 
              ? 'bg-[#0c0b11] border-zinc-900 ring-white/5 shadow-black' 
              : 'bg-white border-slate-200 ring-black/5'
          }`}>
            <div className="h-[4px] w-full bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500" />
            
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-905'}`}>
                    🔗 Cấu hình Máy chủ API (Render)
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'} leading-relaxed`}>
                    Khi chạy local, ứng dụng mặc định kết nối tới <code>http://localhost:5000/api/tasks</code>. Khi deploy lên Render, bạn cần liên kết với máy chủ backend của mình.
                  </p>
                </div>
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  className={`p-2.5 rounded-xl transition-all ${
                    isDark ? 'text-zinc-500 hover:text-white hover:bg-zinc-900' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-zinc-555 uppercase tracking-widest">
                    Địa chỉ URL máy chủ API
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://task24h-api.onrender.com/api/tasks"
                    value={configUrl}
                    onChange={(e) => setConfigUrl(e.target.value)}
                    className={`w-full h-12 px-4 rounded-xl border text-xs font-bold outline-none transition-all ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700'
                        : 'bg-slate-100 border-slate-200 text-slate-800 focus:border-slate-350 focus:bg-white'
                    }`}
                  />
                  <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                    💡 Mẹo: URL này là địa chỉ Web Service backend của bạn trên Render thêm hậu tố <code>/api/tasks</code> (Ví dụ: <code>https://task24h-api.onrender.com/api/tasks</code>).
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const guess = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/tasks';
                      setConfigUrl(guess);
                    }}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        : 'bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100'
                    }`}
                  >
                    Reset mặc định
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-zinc-900/60">
                <button 
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
                    isDark ? 'text-zinc-500 hover:text-zinc-350' : 'text-slate-400 hover:text-slate-750'
                  }`}
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => {
                    localStorage.setItem('REACT_APP_API_BASE_URL', configUrl.trim());
                    setApiBaseUrl(configUrl.trim());
                    setIsConfigOpen(false);
                  }}
                  className="text-xs font-extrabold px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.2)]"
                >
                  Lưu & Kết nối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;