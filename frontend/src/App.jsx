import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
import { API_BASE_URL } from './apiConfig';

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

  const avatarPath = user?.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : null;
  const navLinkClass = ({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`;

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to={isAuthPage ? "/" : "/dashboard"} className="app-brand">
            <span className="app-brand-mark" aria-hidden="true">e</span>
            <span className="app-brand-name">EPlatform<span className="app-brand-period">.</span></span>
        </Link>

        {user && !isAuthPage && (
          <nav className="app-nav" aria-label="Головна навігація">
            <NavLink to="/dashboard" className={navLinkClass}>Навчання</NavLink>
            {user.role === 'student' && <NavLink to="/my-grades" className={navLinkClass}>Мої оцінки</NavLink>}
            {user.role === 'admin' && <NavLink to="/admin" className={navLinkClass}>Адміністрування</NavLink>}
          </nav>
        )}

        <div className="app-header-actions">
            <ThemeToggle />

            {!isAuthPage && user && (
              <>
                <NotificationBell />

                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="app-profile-trigger"
                        aria-expanded={isProfileOpen}
                        aria-label="Меню профілю"
                    >
                        {avatarPath ? (
                            <img src={avatarPath} alt="" className="app-avatar object-cover" />
                        ) : (
                            <div className="app-avatar">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="app-profile-name">
                            {user.name.split(' ')[0]}
                        </span>
                        <svg className={`w-4 h-4 text-zinc-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6"></path></svg>
                    </button>

                    {isProfileOpen && (
                        <div className="page-surface absolute right-0 mt-2 w-56 z-50 overflow-hidden origin-top-right">
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
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ 
          className: 'dark:bg-zinc-900 dark:text-zinc-100 dark:border dark:border-zinc-800 shadow-xl rounded-2xl font-medium', 
          duration: 3000 
      }} />
      
      <div className="min-h-screen flex flex-col font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        
        <Navbar />

        <main className="app-main grow">
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