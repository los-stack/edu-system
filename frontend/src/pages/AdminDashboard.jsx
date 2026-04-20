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
            setCourses(courses.filter(c => c.id !== courseId));
            toast.success('Курс видалено');
        } catch (err) {
            console.error('Delete Course Error:', err);
            toast.error('Помилка видалення курсу');
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <span className="px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20">Адмін</span>;
            case 'teacher': return <span className="px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20">Викладач</span>;
            case 'student': return <span className="px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">Студент</span>;
            default: return <span className="px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">Невідомо</span>;
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8 mt-4">
            
            <div className="relative bg-white dark:bg-[#0f172a] rounded-[2.5rem] p-8 sm:p-12 mb-10 border border-gray-100 dark:border-gray-800/80 shadow-sm overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="absolute top-0 right-0 w-150 h-150 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10 max-w-xl">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-6 hover:gap-3 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        НАЗАД ДО ПАНЕЛІ
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Система</h1>
                    </div>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Центр управління користувачами та навчальним контентом.</p>
                </div>

                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-3xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Студентів</p>
                        <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.students}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-3xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Викладачів</p>
                        <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.teachers}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-3xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Курсів</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalCourses}</p>
                    </div>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/30 font-medium">{error}</div>}

            <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 rounded-2xl mb-8 w-fit">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Користувачі
                </button>
                <button 
                    onClick={() => setActiveTab('courses')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'courses' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    Всі курси
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800/80 rounded-4xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-transparent">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Керування користувачами</h2>
                    </div>
                    
                    {users.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">Користувачів не знайдено</div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {users.map(u => (
                                <div key={u.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-gray-600 dark:text-gray-300">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {u.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        {getRoleBadge(u.role)}
                                        {u.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Видалити користувача"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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
                <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800/80 rounded-4xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-transparent">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Керування курсами</h2>
                    </div>
                    
                    {courses.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">Курсів ще немає</div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {courses.map(course => (
                                <div key={course.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{course.title}</h3>
                                        <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                            Викладач: {course.teacher_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Link 
                                            to={`/course/${course.id}`} 
                                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Відкрити
                                        </Link>
                                        <button 
                                            onClick={() => handleDeleteCourse(course.id, course.title)}
                                            className="p-2.5 text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                            title="Видалити курс"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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