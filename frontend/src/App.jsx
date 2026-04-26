import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'; 
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import CoursePage from './pages/CoursePage';
import MyGrades from './pages/MyGrades';
import AdminDashboard from './pages/AdminDashboard';
import TakeQuiz from './pages/TakeQuiz';
import Profile from './pages/Profile';

import ProtectedRoute from './components/ProtectedRoute'; 
import ThemeToggle from './components/ThemeToggle';
import NotificationBell from './components/NotificationBell';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/' || location.pathname === '/register';
  
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const updateNavbarUser = () => {
      const userStr = localStorage.getItem('user');
      setUser(userStr ? JSON.parse(userStr) : null);
    };

    updateNavbarUser();
    window.addEventListener('user-updated', updateNavbarUser);
    return () => window.removeEventListener('user-updated', updateNavbarUser);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
        await axios.post('/api/auth/logout');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('user-updated'));
        setIsProfileOpen(false);
        navigate('/');
    } catch (error) {
        console.error(error);
    }
  };

  const avatarPath = user?.avatar_url ? `${import.meta.env.VITE_API_URL}${user.avatar_url}` : null;

  return (
    <nav className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm dark:shadow-none border-b border-transparent dark:border-zinc-800/80 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <Link to={isAuthPage ? "/" : "/dashboard"} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white transform group-hover:scale-105 transition-transform shadow-md shadow-blue-600/20 dark:shadow-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
            </div>
            <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">EPlatform</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            {!isAuthPage && user && (
              <>
                <NotificationBell />

                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2.5 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none"
                    >
                        {avatarPath ? (
                            <img src={avatarPath} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md dark:shadow-none dark:border dark:border-zinc-700">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="hidden sm:block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            {user.name.split(' ')[0]}
                        </span>
                        <svg className={`hidden sm:block w-4 h-4 text-zinc-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl dark:shadow-none dark:border dark:border-zinc-800 z-50 overflow-hidden origin-top-right border border-transparent">
                            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{user.email}</p>
                            </div>
                            <div className="p-1.5">
                                <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    Налаштування
                                </Link>
                            </div>
                            <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-800">
                                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                    Вийти
                                </button>
                            </div>
                        </div>
                    )}
                </div>
              </>
            )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ 
          className: 'dark:bg-zinc-900 dark:text-zinc-100 dark:border dark:border-zinc-800 shadow-xl rounded-2xl font-medium', 
          duration: 3000 
      }} />
      
      <div className="min-h-screen flex flex-col font-sans text-zinc-900 bg-white dark:bg-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        
        <Navbar />

        <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/course/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
            <Route path="/my-grades" element={<ProtectedRoute><MyGrades /></ProtectedRoute>} />
            <Route path="/quiz/:quizId" element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </main>
        
      </div>
    </BrowserRouter>
  );
}

export default App;