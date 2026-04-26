import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const fetchNotifications = async () => {
            try {
                const res = await axios.get('/api/notifications');
                if (isMounted) {
                    setNotifications(Array.isArray(res.data) ? res.data : []);
                }
            } catch (error) {
                console.error('Помилка завантаження сповіщень:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); 
    
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const toggleDropdown = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            try {
                await axios.put('/api/notifications/read-all');
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            } catch (error) {
                console.error('Помилка оновлення статусу сповіщень:', error);
            }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors focus:outline-none"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-zinc-900"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl dark:shadow-none dark:border dark:border-zinc-800 z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right border border-transparent">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">Сповіщення</h3>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{notifications.length} всього</span>
                    </div>
                    
                    <div className="max-h-100 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                У вас поки немає нових сповіщень.
                            </div>
                        ) : (
                            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                                {notifications.map(notification => (
                                    <li key={notification.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                        <Link 
                                            to={notification.link || '#'} 
                                            onClick={() => setIsOpen(false)}
                                            className="block px-4 py-3"
                                        >
                                            <div className="flex gap-3 items-start">
                                                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${notification.type === 'grade' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {notification.type === 'grade' ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${!notification.is_read ? 'font-bold text-zinc-900 dark:text-white' : 'font-medium text-zinc-700 dark:text-zinc-300'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                                                        {new Date(notification.created_at).toLocaleString('uk-UA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;