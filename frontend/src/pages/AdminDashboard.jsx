import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const profileRes = await axios.get('/api/users/profile');
                if (profileRes.data.role !== 'admin') {
                    toast.error('Доступ заборонено');
                    navigate('/dashboard');
                    return;
                }

                const [usersRes, coursesRes] = await Promise.all([
                    axios.get('/api/users').catch(() => ({ data: [] })), 
                    axios.get('/api/courses')
                ]);

                setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);

            } catch (err) {
                console.error('Помилка завантаження панелі адміна:', err);
                setError('Не вдалося завантажити дані.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminData();
    }, [navigate]);

    const stats = useMemo(() => {
        const students = users.filter(u => u.role === 'student').length;
        const teachers = users.filter(u => u.role === 'teacher').length;
        const totalCourses = courses.length;
        return { students, teachers, totalCourses, totalUsers: users.length };
    }, [users, courses]);

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Ви впевнені, що хочете видалити користувача ${userName}?`)) return;
        try {
            await axios.delete(`/api/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
            toast.success('Користувача видалено');
        } catch (err) {
            console.error('Delete User Error:', err);
            toast.error('Помилка видалення користувача');
        }
    };

    const handleDeleteCourse = async (courseId, courseTitle) => {
        if (!window.confirm(`Ви впевнені, що хочете видалити курс "${courseTitle}"?`)) return;
        try {
            await axios.delete(`/api/courses/${courseId}`);
            setCourses(courses.filter(c => c.id !== courseId));
            toast.success('Курс видалено');
        } catch (err) {
            console.error('Delete Course Error:', err);
            toast.error('Помилка видалення курсу');
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-900">Адмін</span>;
            case 'teacher': return <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 border border-purple-200 dark:border-purple-900">Викладач</span>;
            case 'student': return <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400 border border-primary-200 dark:border-primary-900">Студент</span>;
            default: return <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">Невідомо</span>;
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div></div>;

    return (
        <div className="max-w-7xl mx-auto pb-16">
            
            {/* Header */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 mb-8 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="max-w-xl">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 mb-4 hover:gap-3 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Назад до панелі
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Адміністрування</h1>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Керування користувачами та навчальним контентом.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Студентів</p>
                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.students}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Викладачів</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.teachers}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Курсів</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalCourses}</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900 text-sm font-medium">{error}</div>}

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl mb-6 w-fit">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Користувачі
                </button>
                <button 
                    onClick={() => setActiveTab('courses')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'courses' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    Всі курси
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Керування користувачами</h2>
                    </div>
                    
                    {users.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500 text-sm">Користувачів не знайдено</div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {users.map(u => (
                                <div key={u.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-semibold text-zinc-600 dark:text-zinc-300">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-zinc-900 dark:text-white">{u.name}</h3>
                                            <p className="text-sm text-zinc-500">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                        {getRoleBadge(u.role)}
                                        {u.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all"
                                                title="Видалити користувача"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'courses' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Керування курсами</h2>
                    </div>
                    
                    {courses.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500 text-sm">Курсів ще немає</div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {courses.map(course => (
                                <div key={course.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div>
                                        <h3 className="font-medium text-zinc-900 dark:text-white mb-1">{course.title}</h3>
                                        <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                            {course.teacher_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Link 
                                            to={`/course/${course.id}`} 
                                            className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                        >
                                            Відкрити
                                        </Link>
                                        <button 
                                            onClick={() => handleDeleteCourse(course.id, course.title)}
                                            className="p-2 text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                            title="Видалити курс"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
