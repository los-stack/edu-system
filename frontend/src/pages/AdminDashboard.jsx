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
                    axios.get('/api/admin/users').catch(() => ({ data: [] })), 
                    axios.get('/api/courses')
                ]);

                setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);

            } catch (err) {
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
        if (!window.confirm(`Ви впевнені, що хочете видалити користувача ${userName}? Всі його дані будуть втрачені.`)) return;
        try {
            await axios.delete(`/api/admin/users/${userId}`); 
            setUsers(users.filter(u => u.id !== userId));
            toast.success('Користувача видалено');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка видалення користувача');
        }
    };

    const handleDeleteCourse = async (courseId, courseTitle) => {
        if (!window.confirm(`Ви впевнені, що хочете видалити курс "${courseTitle}"? Всі завдання та результати будуть видалені.`)) return;
        try {
            await axios.delete(`/api/admin/courses/${courseId}`);
            setCourses(courses.filter(c => c.id !== courseId));
            toast.success('Курс видалено');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка видалення курсу');
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Адмін</span>;
            case 'teacher': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">Викладач</span>;
            case 'student': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">Студент</span>;
            default: return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Невідомо</span>;
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="w-full relative mt-2">
            
            <div className="relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 sm:p-12 mb-10 shadow-xl shadow-zinc-200/40 dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                
                <div className="relative z-10 max-w-xl">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 mb-6 hover:gap-3 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Назад до панелі
                    </Link>
                    <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">Система</h1>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">Центр управління користувачами та навчальним контентом.</p>
                </div>

                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-700/50">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Студентів</p>
                        <p className="text-3xl font-black text-zinc-900 dark:text-white">{stats.students}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-700/50">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Викладачів</p>
                        <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.teachers}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-700/50">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Курсів</p>
                        <p className="text-3xl font-black text-zinc-900 dark:text-white">{stats.totalCourses}</p>
                    </div>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-medium">{error}</div>}

            <div className="flex items-center gap-1 p-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl mb-8 w-fit shadow-inner dark:shadow-none">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Користувачі
                </button>
                <button 
                    onClick={() => setActiveTab('courses')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'courses' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    Всі курси
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/40 dark:shadow-none">
                    <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-transparent">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Керування користувачами</h2>
                    </div>
                    
                    {users.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500">Користувачів не знайдено</div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                            {users.map(u => (
                                <div key={u.id} className="p-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                                                {u.name}
                                            </h3>
                                            <p className="text-xs text-zinc-500 font-medium">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        {getRoleBadge(u.role)}
                                        {u.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
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
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/40 dark:shadow-none">
                    <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-transparent">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Керування курсами</h2>
                    </div>
                    
                    {courses.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500">Курсів ще немає</div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                            {courses.map(course => (
                                <div key={course.id} className="p-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-1">{course.title}</h3>
                                        <p className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                            {course.teacher_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Link 
                                            to={`/course/${course.id}`} 
                                            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                                        >
                                            Відкрити
                                        </Link>
                                        <button 
                                            onClick={() => handleDeleteCourse(course.id, course.title)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
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