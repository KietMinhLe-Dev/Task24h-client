import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Edit3, 
  X, 
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Info,
  Sun,
  Moon,
  Briefcase,
  User,
  Heart,
  BookOpen,
  Gamepad,
  Hourglass,
  Calendar,
  Award,
  Zap,
  Check,
  Flame,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/tasks';

// A collection of beautiful, curated Vietnamese motivational quotes
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
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time Clock tick
  const [localTimeStr, setLocalTimeStr] = useState('');
  const [, setTick] = useState(0);
  const [greeting, setGreeting] = useState('Xin chào');
  
  // Rotating Quote state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Particles state for completion explosion
  const [particles, setParticles] = useState([]);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '24h',
    endTime: '24h',
    priority: 'medium',
    category: 'work'
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Clock tick & Greeting
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setLocalTimeStr(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      
      const hr = now.getHours();
      if (hr >= 5 && hr < 12) setGreeting('Chào buổi sáng 🌅');
      else if (hr >= 12 && hr < 18) setGreeting('Chào buổi chiều ☀️');
      else setGreeting('Chào buổi tối 🌌');

      setTick(prev => prev + 1);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cycle motivational quotes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 10000); // changes every 10 seconds
    return () => clearInterval(quoteInterval);
  }, []);

  // Fetch Tasks
  const fetchTasks = async (date) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        showToast("Không thể tải danh sách task!", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi kết nối server!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(currentDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);
 
  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Vui lòng điền tiêu đề!", "error");
      return;
    }

    try {
      const payload = { 
        ...formData, 
        date: currentDate,
        createdAt: editingTask ? (editingTask.createdAt || new Date().toISOString()) : new Date().toISOString()
      };
      
      const url = editingTask ? `${API_BASE_URL}/${editingTask.id}` : API_BASE_URL;
      const method = editingTask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast(editingTask ? "Đã cập nhật công việc!" : "Đã thêm công việc mới!", "success");
        setIsModalOpen(false);
        setEditingTask(null);
        resetForm();
        fetchTasks(currentDate);
      } else {
        const err = await response.json();
        showToast(err.message || "Lỗi xử lý!", "error");
      }
    } catch (error) {
      showToast("Lỗi kết nối server!", "error");
    }
  };

  // Sparkle particle burst generator
  const triggerSparkleBurst = (x, y) => {
    const colors = ['#6366f1', '#a855f7', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      newParticles.push({
        id: `particle-${Date.now()}-${i}-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // slight upward bias
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        alpha: 1,
        life: 1.0 // 100% life
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;
    const frame = requestAnimationFrame(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // gravity
            alpha: p.alpha - 0.03,
            life: p.life - 0.03
          }))
          .filter(p => p.life > 0)
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [particles]);

  // Toggle Completion
  const toggleComplete = async (task, event) => {
    // Generate particle explosion if task is being completed
    if (!task.completed && event) {
      const rect = event.target.getBoundingClientRect();
      const clickX = rect.left + rect.width / 2 + window.scrollX;
      const clickY = rect.top + rect.height / 2 + window.scrollY;
      triggerSparkleBurst(clickX, clickY);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      if (response.ok) {
        showToast(task.completed ? "Làm lại công việc này" : "Tuyệt vời! Đã hoàn thành 🎉", "success");
        fetchTasks(currentDate);
      }
    } catch (error) {
      showToast("Không thể cập nhật trạng thái!", "error");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showToast("Đã xóa công việc khỏi lịch trình", "success");
        fetchTasks(currentDate);
      }
    } catch (error) {
      showToast("Lỗi khi xóa!", "error");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '24h',
      endTime: '24h',
      priority: 'medium',
      category: 'work'
    });
  };

  // Edit click
  const handleEditClick = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      startTime: '24h',
      endTime: '24h',
      priority: task.priority,
      category: task.category
    });
    setIsModalOpen(true);
  };

  // Offset date
  const offsetDate = (days) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  // Date readable format
  const getFormattedDate = (dateStr) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const d = new Date(dateStr);
    const dayName = days[d.getDay()];
    const dateNum = d.getDate();
    const month = d.getMonth() + 1;
    return `${dayName}, ${dateNum}/${month}`;
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    const matchPri = filterPriority === 'all' || t.priority === filterPriority;
    const matchQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchPri && matchQuery;
  });

  // Analytics
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Category progress analytics breakdown
  const getCategoryAnalytics = () => {
    const list = ['work', 'personal', 'health', 'study', 'leisure'];
    return list.map(cKey => {
      const catTasks = tasks.filter(t => t.category === cKey);
      const total = catTasks.length;
      const completed = catTasks.filter(t => t.completed).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { key: cKey, total, completed, percent };
    });
  };
  const catStats = getCategoryAnalytics();

  // Dynamic Productivity Rank
  const getProductivityRank = (percent) => {
    if (percent === 0) return { title: "Khởi đầu nhẹ nhàng 🌱", color: "text-zinc-400" };
    if (percent > 0 && percent <= 35) return { title: "Đang khởi động 🏃", color: "text-indigo-400" };
    if (percent > 35 && percent <= 70) return { title: "Đang bứt phá 🔥", color: "text-purple-400" };
    if (percent > 70 && percent < 100) return { title: "Tập trung cực độ ⚡", color: "text-cyan-400" };
    return { title: "Siêu nhân hoàn thành 🚀", color: "text-emerald-400 animate-pulse" };
  };
  const rank = getProductivityRank(progressPercent);

  // Category Configuration
  const categories = {
    work: { label: 'Công việc', icon: <Briefcase className="w-4 h-4" />, color: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/10 dark:border-indigo-400/20', bg: 'bg-indigo-50/50 dark:bg-indigo-950/15' },
    personal: { label: 'Cá nhân', icon: <User className="w-4 h-4" />, color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/10 dark:border-emerald-400/20', bg: 'bg-emerald-50/50 dark:bg-emerald-950/15' },
    health: { label: 'Sức khỏe', icon: <Heart className="w-4 h-4" />, color: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/10 dark:border-rose-400/20', bg: 'bg-rose-50/50 dark:bg-rose-950/15' },
    study: { label: 'Học tập', icon: <BookOpen className="w-4 h-4" />, color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/10 dark:border-amber-400/20', bg: 'bg-amber-50/50 dark:bg-amber-950/15' },
    leisure: { label: 'Giải trí', icon: <Gamepad className="w-4 h-4" />, color: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/10 dark:border-cyan-400/20', bg: 'bg-cyan-50/50 dark:bg-cyan-950/15' }
  };

  // Priority Configuration
  const priorities = {
    high: { label: 'Cao', dot: 'bg-rose-500', badge: 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/10' },
    medium: { label: 'Trung bình', dot: 'bg-amber-500', badge: 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/10' },
    low: { label: 'Thấp', dot: 'bg-emerald-500', badge: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/10' }
  };

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
    const total24hSeconds = 24 * 60 * 60; // 86400 seconds
    const remainingSeconds = total24hSeconds - elapsedSeconds;
    
    if (remainingSeconds <= 0) {
      return "00:00:00";
    }
    
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Circular progress SVG values
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-[#030206] text-zinc-150' 
        : 'bg-[#f4f7fa] text-slate-800'
    } font-sans antialiased selection:bg-indigo-500/30 pb-28 relative overflow-x-hidden`}>
      
      {/* Floating Canvas for dynamic Sparkle particle burst */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none transition-all duration-75"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.alpha,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 10px ${p.color}`
            }}
          />
        ))}
      </div>

      {/* Decorative ultra-premium blurred background lights */}
      <div className="absolute top-0 left-0 w-full h-[55rem] pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-[-25rem] left-[5%] w-[55rem] h-[55rem] rounded-full blur-[170px] transition-opacity duration-1000 ${
          isDarkMode ? 'bg-indigo-600/10 opacity-100' : 'bg-indigo-400/5 opacity-80'
        }`} />
        <div className={`absolute top-[-20rem] right-[5%] w-[50rem] h-[50rem] rounded-full blur-[170px] transition-opacity duration-1000 ${
          isDarkMode ? 'bg-purple-600/10 opacity-100' : 'bg-purple-400/5 opacity-80'
        }`} />
        <div className={`absolute top-[10rem] left-[40%] w-[35rem] h-[35rem] rounded-full blur-[160px] transition-opacity duration-1000 ${
          isDarkMode ? 'bg-cyan-600/5 opacity-80' : 'bg-cyan-400/3 opacity-50'
        }`} />
      </div>

      {/* Floating Theme Toggle */}
      <div className="fixed bottom-8 right-8 z-40">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border transition-all duration-500 transform hover:scale-110 active:scale-95 ${
            isDarkMode 
              ? 'bg-zinc-900/90 backdrop-blur-md border-zinc-800 text-amber-400 hover:text-amber-300 hover:border-zinc-700 hover:shadow-indigo-500/10' 
              : 'bg-white/90 backdrop-blur-md border-slate-200 text-indigo-600 hover:text-indigo-700 hover:border-slate-300 hover:shadow-slate-300/40'
          }`}
          title={isDarkMode ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
        >
          {isDarkMode ? <Sun className="w-5 h-5 animate-spin-slow" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Toast alert system */}
      {toast && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-350 transform translate-y-0 text-sm font-bold backdrop-blur-lg ${
          isDarkMode 
            ? 'border-emerald-500/20 text-emerald-400 bg-zinc-950/80 shadow-black' 
            : 'border-emerald-500/20 text-emerald-600 bg-white/95 shadow-slate-100'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top thin visual loading line with ambient glow */}
      <div className={`fixed top-0 left-0 w-full h-[4px] z-50 ${isDarkMode ? 'bg-zinc-950/60' : 'bg-slate-200'}`}>
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Spacious Container */}
      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 py-12 z-10">
        
        {/* PREMIUM HEADER CONTROLS ISLAND */}
        <header className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8 mb-10 transition-colors duration-500 ${
          isDarkMode ? 'border-zinc-900/60' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                Lập Kế Hoạch 24H
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                isDarkMode ? 'text-zinc-550 bg-zinc-900/65' : 'text-slate-400 bg-slate-100'
              }`}>
                {localTimeStr}
              </span>
            </div>
            <h1 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Task 24H</span>
            </h1>
          </div>

          {/* Floating Premium Navigation Island */}
          <div className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all duration-500 ${
            isDarkMode 
              ? 'bg-zinc-950/80 border-zinc-900 ring-1 ring-white/5 shadow-2xl shadow-black' 
              : 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          }`}>
            <button 
              onClick={() => offsetDate(-1)}
              className={`p-2.5 rounded-xl transition-all ${
                isDarkMode ? 'hover:bg-zinc-900 text-zinc-500 hover:text-white' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-800'
              }`}
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            
            <div className="flex items-center gap-2 px-2">
              <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`text-sm font-extrabold font-sans tracking-tight select-none ${
                isDarkMode ? 'text-zinc-200' : 'text-slate-700'
              }`}>
                {getFormattedDate(currentDate)}
              </span>
            </div>

            <button 
              onClick={() => offsetDate(1)}
              className={`p-2.5 rounded-xl transition-all ${
                isDarkMode ? 'hover:bg-zinc-900 text-zinc-500 hover:text-white' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-800'
              }`}
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
            
            <div className={`w-[1px] h-6 mx-1 ${isDarkMode ? 'bg-zinc-900' : 'bg-slate-100'}`} />
            
            <button 
              onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold px-3 py-2 bg-indigo-500/10 rounded-xl transition-all"
            >
              Hôm nay
            </button>
          </div>
        </header>

        {/* VERCEL-STYLE HERO BANNER */}
        <section className={`p-8 rounded-3xl border mb-12 transition-all duration-500 relative overflow-hidden ${
          isDarkMode 
            ? 'bg-gradient-to-tr from-zinc-950 via-[#0a0a0f] to-zinc-950 border-zinc-900 ring-1 ring-white/5' 
            : 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
        }`}>
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <h2 className={`text-xs font-extrabold tracking-widest uppercase flex items-center justify-center md:justify-start gap-2.5 ${
                isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`}>
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                Chu kỳ hoàn thành lý tưởng
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} leading-relaxed max-w-xl`}>
                Mỗi công việc được kích hoạt với một chu kỳ đếm ngược 24 giờ độc lập ngay bên cạnh thẻ công việc. Sự đơn giản này giải phóng bạn khỏi áp lực giờ giấc chính xác.
              </p>
              
              {/* Daily Progress Indicator bar */}
              <div className="flex items-center justify-center md:justify-start gap-3 pt-2.5">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  Hoàn thành: {progressPercent}%
                </span>
                <div className={`w-36 h-2 rounded-full overflow-hidden shrink-0 ${
                  isDarkMode ? 'bg-zinc-900/60' : 'bg-slate-150'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Welcome Card */}
            <div className={`px-8 py-6 rounded-2xl border flex flex-col items-center justify-center min-w-[240px] relative transition-all duration-500 hover:scale-103 ${
              isDarkMode 
                ? 'bg-zinc-900/40 border-zinc-800/80 shadow-2xl shadow-black ring-1 ring-white/5' 
                : 'bg-slate-50/70 border-slate-200 text-slate-900 shadow-inner'
            }`}>
              <Award className={`w-6 h-6 mb-2.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`text-sm font-extrabold tracking-wide ${rank.color}`}>
                {rank.title}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-widest mt-1.5 ${isDarkMode ? 'text-zinc-550' : 'text-slate-455'}`}>
                Hạng năng suất ngày
              </span>
            </div>
          </div>
        </section>

        {/* DASHBOARD MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: FILTER STRIP AND COMPACT/CLEAN FEED */}
          <main className="md:col-span-8 space-y-8">
            
            {/* Minimal High-End Filter Capsule */}
            <div className={`flex flex-col sm:flex-row gap-4 items-center justify-between p-4 border rounded-2xl transition-all duration-500 ${
              isDarkMode 
                ? 'bg-zinc-950/40 border-zinc-900 ring-1 ring-white/5 shadow-inner' 
                : 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
            }`}>
              
              {/* Expanding Search Box */}
              <div className="relative w-full sm:w-64 group">
                <Search className={`w-4 h-4 absolute left-4 top-3.5 transition-colors ${
                  isDarkMode ? 'text-zinc-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'
                }`} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm công việc cần làm..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-sm py-3 pl-11 pr-4 border rounded-xl outline-none transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-150 placeholder-zinc-500 focus:border-zinc-700 focus:bg-zinc-900' 
                      : 'bg-slate-100/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-300 focus:bg-white'
                  }`}
                />
              </div>

              {/* Sophisticated drop controls */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`w-full sm:w-auto text-sm border rounded-xl px-4 py-3 font-bold outline-none cursor-pointer transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-zinc-900/60 border-zinc-850 text-zinc-400 focus:border-zinc-700 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100 focus:border-slate-300'
                  }`}
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="work">💼 Công việc</option>
                  <option value="personal">🏡 Cá nhân</option>
                  <option value="health">❤️ Sức khỏe</option>
                  <option value="study">📚 Học tập</option>
                  <option value="leisure">🎮 Giải trí</option>
                </select>

                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className={`w-full sm:w-auto text-sm border rounded-xl px-4 py-3 font-bold outline-none cursor-pointer transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-zinc-900/60 border-zinc-850 text-zinc-400 focus:border-zinc-700 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100 focus:border-slate-300'
                  }`}
                >
                  <option value="all">Độ ưu tiên</option>
                  <option value="high">🔴 Cao</option>
                  <option value="medium">🟡 Trung bình</option>
                  <option value="low">🔵 Thấp</option>
                </select>
              </div>

            </div>

            {/* Structured Task Feed */}
            <div className="space-y-5">
              {loading ? (
                <div className={`flex flex-col items-center justify-center py-28 border border-dashed rounded-3xl text-sm ${
                  isDarkMode ? 'border-zinc-900 text-zinc-550' : 'border-slate-200 text-slate-400'
                }`}>
                  <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <span className="font-medium tracking-wide">Đang đồng bộ kế hoạch...</span>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-32 text-center border border-dashed rounded-3xl p-10 ${
                  isDarkMode ? 'border-zinc-900 bg-zinc-950/20' : 'border-slate-200 bg-slate-50/20'
                }`}>
                  <div className="p-4.5 bg-indigo-500/5 rounded-2xl mb-4.5 border border-indigo-500/10">
                    <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>
                  <p className={`text-base font-extrabold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Không tìm thấy mục tiêu nào phù hợp.
                  </p>
                  <button 
                    onClick={() => {
                      setEditingTask(null);
                      resetForm();
                      setIsModalOpen(true);
                    }}
                    className="text-sm text-indigo-400 hover:text-indigo-300 font-extrabold mt-3 transition-colors"
                  >
                    + Tạo kế hoạch 24h ngay bây giờ
                  </button>
                </div>
              ) : (
                filteredTasks.map(task => {
                  const cat = categories[task.category] || categories.work;
                  const pri = priorities[task.priority] || priorities.medium;
                  const taskCountdown = getTaskCountdownStr(task);
                  
                  return (
                    <div 
                      key={task.id}
                      className={`p-6 rounded-3xl border transition-all duration-300 flex items-center justify-between gap-6 relative overflow-hidden group ${
                        task.completed 
                          ? isDarkMode
                            ? 'border-zinc-950 bg-zinc-950/20 opacity-30 shadow-none'
                            : 'border-slate-100 bg-slate-50/50 opacity-40 shadow-none'
                          : isDarkMode
                            ? 'border-zinc-900 bg-[#0b0a0e]/95 hover:border-zinc-800 hover:bg-[#0f0e13]/80 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] shadow-black ring-1 ring-white/5'
                            : 'bg-white border-slate-200/80 hover:border-slate-350 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(99,102,241,0.06)]'
                      }`}
                    >
                      {/* Fine color accent bar on left */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[6px] ${cat.color} rounded-r-sm`} />

                      {/* Main Task Info Block */}
                      <div className="flex items-start gap-4.5 min-w-0 pl-1 flex-1">
                        {/* Custom styled animatable checkbox with Particle event listener */}
                        <button 
                          onClick={(e) => toggleComplete(task, e)}
                          className="mt-1 shrink-0 transition-transform active:scale-80 duration-200 relative z-10"
                        >
                          {task.completed ? (
                            <div className="w-[23px] h-[23px] rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                            </div>
                          ) : (
                            <div className={`w-[23px] h-[23px] rounded-lg border-2 transition-all ${
                              isDarkMode 
                                ? 'border-zinc-700 bg-zinc-950 group-hover:border-zinc-500' 
                                : 'border-slate-300 bg-white group-hover:border-slate-400'
                            }`} />
                          )}
                        </button>

                        <div className="min-w-0 space-y-1.5 flex-1">
                          {/* Title */}
                          <h3 className={`text-base sm:text-lg font-bold leading-snug tracking-tight transition-colors ${
                            task.completed 
                              ? 'line-through text-zinc-550' 
                              : isDarkMode ? 'text-white font-extrabold' : 'text-slate-800'
                          }`}>
                            {task.title}
                          </h3>

                          {/* Description */}
                          {task.description && (
                            <p className={`text-sm leading-relaxed transition-colors max-w-lg ${
                              task.completed 
                                ? 'text-zinc-650' 
                                : isDarkMode ? 'text-zinc-400 font-medium' : 'text-slate-500'
                            }`}>
                              {task.description}
                            </p>
                          )}

                          {/* Refined badge row */}
                          <div className="flex flex-wrap items-center gap-2.5 pt-2">
                            {/* Static 24h badge */}
                            <span className={`text-[11px] font-mono px-3 py-1 rounded-full border flex items-center gap-1.5 font-extrabold tracking-wide ${
                              isDarkMode 
                                ? 'text-indigo-400 border-indigo-500/15 bg-indigo-500/5' 
                                : 'text-indigo-600 border-indigo-500/10 bg-indigo-50'
                            }`}>
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              24h
                            </span>
                            
                            {/* Category badge */}
                            <span className={`text-[11px] px-3 py-1 rounded-full border font-extrabold flex items-center gap-1.5 tracking-wide ${cat.text} ${cat.border} ${cat.bg}`}>
                              {cat.icon}
                              {cat.label}
                            </span>

                            {/* Priority badge */}
                            <span className={`text-[11px] px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 tracking-wide ${pri.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                              {pri.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT AREA: TICKING COUNTDOWN & PREMIUM EDIT/DELETE */}
                      <div className="flex items-center gap-4.5 shrink-0">
                        {/* 24h Ticking Live Countdown Badge */}
                        {!task.completed && (
                          <div className={`px-4.5 py-2.5 rounded-2xl border font-mono flex items-center gap-2 font-bold shadow-[0_4px_20px_rgba(244,63,94,0.05)] animate-pulse ${
                            isDarkMode 
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-black' 
                              : 'bg-rose-50 border-rose-200 text-rose-600 shadow-rose-100'
                          }`}>
                            <Hourglass className="w-3.5 h-3.5 animate-spin-slow shrink-0 text-rose-455" />
                            <span className="text-xs sm:text-sm tracking-widest">{taskCountdown}</span>
                          </div>
                        )}

                        {/* Edit / Delete Capsule actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            onClick={() => handleEditClick(task)}
                            className={`p-2.5 rounded-xl transition-all ${
                              isDarkMode ? 'hover:bg-zinc-800 text-zinc-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-800'
                            }`}
                            title="Sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(task.id)}
                            className={`p-2.5 rounded-xl transition-all ${
                              isDarkMode ? 'hover:bg-zinc-800/80 text-zinc-500 hover:text-rose-450' : 'hover:bg-slate-100 text-slate-400 hover:text-rose-600'
                            }`}
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </main>

          {/* RIGHT COLUMN: GIGANTIC RADIAL SIDEBAR */}
          <aside className="md:col-span-4 space-y-8">
            
            {/* STREAK & ENERGY BOOSTER CARD */}
            <div className={`p-6 border rounded-3xl transition-all duration-500 relative overflow-hidden ${
              isDarkMode 
                ? 'bg-gradient-to-br from-zinc-950 via-[#0d0a14] to-zinc-950 border-zinc-900 ring-1 ring-white/5 shadow-2xl' 
                : 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
            }`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 animate-bounce">
                  <Flame className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <h4 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Chuỗi Thăng Hoa</h4>
                  <p className="text-xs text-zinc-500 font-bold mt-0.5">Chuỗi thăng hoa: 5 ngày 🔥</p>
                </div>
              </div>
              
              {/* Lightning Bolt Energy Bar */}
              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <span>Năng lượng ngày</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-amber-400" />
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Glass Analytical Progress Card */}
            <div className={`p-8 border rounded-3xl transition-all duration-500 relative overflow-hidden ${
              isDarkMode 
                ? 'bg-zinc-950/60 border-zinc-900 ring-1 ring-white/5 shadow-2xl shadow-black' 
                : 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

              {/* Action Button */}
              <button 
                onClick={() => {
                  setEditingTask(null);
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-650 hover:to-indigo-700 text-white text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.25)] transform hover:-translate-y-1 active:translate-y-0 duration-300"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                Thêm kế hoạch mới
              </button>

              {/* Radial Progress Ring block */}
              <div className={`border-t mt-8 pt-8 transition-colors duration-500 ${
                isDarkMode ? 'border-zinc-900/65' : 'border-slate-100'
              } flex flex-col items-center text-center`}>
                
                {/* Visual Circular Ring */}
                <div className="relative w-32 h-32 mb-6 transform hover:scale-105 transition-transform duration-500 cursor-pointer">
                  <svg className="w-full h-full transform -rotate-90">
                    <defs>
                      <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    {/* Background track circle */}
                    <circle 
                      cx="64" 
                      cy="64" 
                      r={radius} 
                      className={`stroke-current ${isDarkMode ? 'text-zinc-900/70' : 'text-slate-100'}`} 
                      strokeWidth="7" 
                      fill="transparent" 
                    />
                    {/* Foreground progress circle */}
                    <circle 
                      cx="64" 
                      cy="64" 
                      r={radius} 
                      stroke="url(#ringGradient)"
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-extrabold font-mono tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {progressPercent}%
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest mt-1.5 ${
                      isDarkMode ? 'text-zinc-500' : 'text-slate-455'
                    }`}>hoàn thành</span>
                  </div>
                </div>

                {/* Rank indicator badge */}
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold mb-6 ring-1 ${
                  isDarkMode 
                    ? 'bg-indigo-500/5 text-indigo-400 ring-indigo-500/10' 
                    : 'bg-indigo-50 text-indigo-600 ring-indigo-500/5'
                }`}>
                  {rank.title}
                </div>

                <div className="grid grid-cols-2 gap-3.5 w-full">
                  <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-850' 
                      : 'bg-slate-50 border-slate-150 hover:bg-slate-100/50'
                  }`}>
                    <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest">Hoàn tất</p>
                    <p className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">{completedCount}</p>
                  </div>
                  <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-850' 
                      : 'bg-slate-50 border-slate-150 hover:bg-slate-100/50'
                  }`}>
                    <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest">Đang chờ</p>
                    <p className="text-lg font-extrabold text-indigo-400 font-mono mt-0.5">{pendingCount}</p>
                  </div>
                </div>

              </div>

            </div>

            {/* CATEGORY WORKLOAD PROGRESS CHARTS */}
            <div className={`p-6 border rounded-3xl transition-all duration-500 ${
              isDarkMode 
                ? 'bg-zinc-950/60 border-zinc-900 ring-1 ring-white/5 shadow-2xl' 
                : 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
            }`}>
              <h4 className={`text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-5`}>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Năng suất theo danh mục
              </h4>
              
              <div className="space-y-4">
                {catStats.map(stat => {
                  const conf = categories[stat.key];
                  if (stat.total === 0) return null; // Only show active categories today
                  
                  return (
                    <div key={stat.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={`flex items-center gap-2 ${conf.text}`}>
                          {conf.icon}
                          {conf.label}
                        </span>
                        <span className={`${isDarkMode ? 'text-zinc-450' : 'text-slate-500'}`}>
                          {stat.completed}/{stat.total} ({stat.percent}%)
                        </span>
                      </div>
                      
                      <div className={`w-full h-2 rounded-full overflow-hidden p-0.5 ${
                        isDarkMode ? 'bg-zinc-900' : 'bg-slate-100'
                      }`}>
                        <div 
                          className={`h-full ${conf.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${stat.percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {tasks.length === 0 && (
                  <p className="text-xs text-zinc-500 text-center py-2 font-medium">Chưa có dữ liệu danh mục hôm nay</p>
                )}
              </div>
            </div>

            {/* DYNAMIC AMBIENT WISDOM CARD */}
            <div className={`p-6 border rounded-3xl transition-all duration-500 relative overflow-hidden ${
              isDarkMode 
                ? 'bg-[#09080e]/80 border-zinc-900 ring-1 ring-white/5 shadow-2xl' 
                : 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
            }`}>
              <div className="flex gap-3 relative z-10">
                <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className={`text-xs uppercase font-extrabold tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>Góc truyền cảm hứng</h4>
                  <p className={`text-xs leading-relaxed italic ${isDarkMode ? 'text-zinc-450' : 'text-slate-650'} mt-1.5 transition-opacity duration-500`}>
                    "{MOTIVATIONAL_QUOTES[currentQuoteIndex]}"
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Informational Rule Card */}
            <div className={`p-6 border rounded-3xl transition-all duration-500 ${
              isDarkMode 
                ? 'bg-zinc-950/30 border-zinc-900 ring-1 ring-white/5 shadow-2xl' 
                : 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
            }`}>
              <h4 className={`text-sm font-bold flex items-center gap-2 mb-3.5 ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>
                <Info className="w-4 h-4 text-indigo-400" />
                Nguyên tắc quản lý 24h
              </h4>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-500' : 'text-slate-550'} font-medium`}>
                Mỗi kế hoạch được kích hoạt một chu kỳ 24h trọn vẹn từ lúc tạo. Hãy phân chia sự tập trung hợp lý để giải quyết hết các nhiệm vụ đúng thời hạn!
              </p>
            </div>

          </aside>

        </div>

      </div>

      {/* MINIMAL POPUP FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all duration-300">
          <div className={`relative w-full max-w-md border rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ring-1 ring-white/10 ${
            isDarkMode ? 'bg-[#09090d] border-zinc-900 shadow-black' : 'bg-white border-slate-200'
          }`}>
            
            {/* Modal Header */}
            <div className={`px-6 py-5.5 border-b flex items-center justify-between ${
              isDarkMode ? 'border-zinc-900 bg-zinc-900/20' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <h3 className={`text-xs uppercase font-extrabold tracking-widest ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                {editingTask ? "Hiệu chỉnh kế hoạch" : "Thiết lập kế hoạch"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-xl transition-all ${
                  isDarkMode ? 'text-zinc-500 hover:text-white hover:bg-zinc-900' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6.5 space-y-5.5">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tiêu đề *</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Họp nhóm dự án, Tập Gym..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full text-sm py-3 px-4 border rounded-xl outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700 focus:bg-zinc-900' 
                      : 'bg-slate-100/80 border-slate-200 text-slate-800 focus:border-slate-350'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mô tả chi tiết</label>
                <textarea 
                  placeholder="Ghi chú thêm về nội dung công việc..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full text-sm py-3 px-4 border rounded-xl outline-none h-24 resize-none transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700 focus:bg-zinc-900' 
                      : 'bg-slate-100/80 border-slate-200 text-slate-800 focus:border-slate-350'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Danh mục</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full text-sm py-3 px-3 border rounded-xl outline-none cursor-pointer transition-all ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700' 
                        : 'bg-slate-100/80 border-slate-200 text-slate-800 focus:border-slate-350'
                    }`}
                  >
                    <option value="work">💼 Công việc</option>
                    <option value="personal">🏡 Cá nhân</option>
                    <option value="health">❤️ Sức khỏe</option>
                    <option value="study">📚 Học tập</option>
                    <option value="leisure">🎮 Giải trí</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Độ ưu tiên</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className={`w-full text-sm py-3 px-3 border rounded-xl outline-none cursor-pointer transition-all ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700' 
                        : 'bg-slate-100/80 border-slate-200 text-slate-800 focus:border-slate-350'
                    }`}
                  >
                    <option value="high">🔴 Cao</option>
                    <option value="medium">🟡 Trung bình</option>
                    <option value="low">🔵 Thấp</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className={`pt-5 flex items-center justify-end gap-3 border-t ${
                isDarkMode ? 'border-zinc-900' : 'border-slate-100'
              }`}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm font-bold text-zinc-500 hover:text-zinc-300 px-4 py-2 rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className={`text-sm font-extrabold px-5.5 py-3 rounded-xl transition-all shadow-md ${
                    isDarkMode 
                      ? 'bg-white text-black hover:bg-zinc-200' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {editingTask ? "Cập nhật" : "Lưu kế hoạch"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
