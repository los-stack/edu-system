import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null); 
    const [error, setError] = useState('');
    const [deadlines, setDeadlines] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [newCourseDesc, setNewCourseDesc] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileResponse = await axios.get('/api/users/profile');
                const currentUser = profileResponse.data;
                setUser(currentUser); 

                const coursesResponse = await axios.get('/api/courses');
                setCourses(coursesResponse.data);

                if (currentUser.role === 'student') {
                    const deadlinesRes = await axios.get('/api/users/my-deadlines');
                    setDeadlines(deadlinesRes.data);

                    const enrollmentsRes = await axios.get('/api/users/my-enrollments');
                    setEnrolledCourseIds(enrollmentsRes.data);
                }
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити дані.');
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('user');
                    navigate('/');
                }
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
            localStorage.removeItem('user');
            navigate('/');
        } catch (err) {
            console.error('Помилка при виході:', err);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/courses', { title: newCourseTitle, description: newCourseDesc });
            const newCourse = { ...response.data.course, teacher_name: user.name };
            setCourses([newCourse, ...courses]); 
            setNewCourseTitle('');
            setNewCourseDesc('');
            setIsCourseModalOpen(false);
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при створенні курсу');
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            const response = await axios.post(`/api/courses/${courseId}/enroll`, {});
            setEnrolledCourseIds(prev => [...prev, courseId]);
            alert(response.data.message); 
        } catch (err) {
            alert(err.response?.data?.error || 'Помилка при записі на курс');
        }
    };

    const urgentDeadlines = deadlines.filter(d => {
        const daysLeft = (new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24);
        return daysLeft >= 0 && daysLeft <= 3;
    });

    if (!user) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="max-w-6xl mx-auto pb-12 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Головна панель</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-gray-500 dark:text-gray-400">Привіт, <span className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</span>!</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : user.role === 'teacher' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                            {user.role === 'teacher' ? 'Викладач' : user.role === 'admin' ? 'Адміністратор' : 'Студент'}
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    {user.role === 'student' && (
                        <Link to="/my-grades" className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm">Мій щоденник</Link>
                    )}
                    {user.role === 'admin' && (
                        <Link to="/admin" className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm">Панель Адміністратора</Link>
                    )}
                    <button onClick={handleLogout} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm">Вийти</button>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800/30">{error}</div>}

            {user.role === 'student' && (
                <div className="mb-10 space-y-4">
                    {urgentDeadlines.length > 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start gap-3">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            <div>
                                <h3 className="text-sm font-bold text-red-800 dark:text-red-400">Увага! Термінові завдання</h3>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">У вас є завдання ({urgentDeadlines.length} шт.), які потрібно здати найближчим часом.</p>
                            </div>
                        </div>
                    )}
                    {deadlines.length > 0 && (
                        <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Наближаються дедлайни
                            </h3>
                            <ul className="space-y-3">
                                {deadlines.map(d => {
                                    const daysLeft = Math.ceil((new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                                    const isUrgent = daysLeft <= 3;
                                    return (
                                        <li key={d.id} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm ${isUrgent ? 'text-red-700 dark:text-red-400 font-medium' : 'text-amber-800 dark:text-amber-300'}`}>
                                            <span><span className="opacity-75">{d.course_title}</span> — <strong>{d.title}</strong></span>
                                            <span className="mt-1 sm:mt-0 text-xs bg-white/50 dark:bg-black/20 border border-amber-100/50 dark:border-amber-800/50 px-2.5 py-1 rounded-md">Залишилось днів: {daysLeft}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Каталог курсів</h2>
                {user.role === 'teacher' && (
                    <button onClick={() => setIsCourseModalOpen(true)} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Створити курс
                    </button>
                )}
            </div>
            
            {courses.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Курсів поки немає. Вони з'являться тут згодом.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => {
                        const isEnrolled = enrolledCourseIds.includes(course.id);
                        return (
                            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full hover:shadow-md dark:hover:shadow-gray-900 transition-shadow group">
                                <div className="grow mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{course.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{course.description}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Викладач: <span className="font-medium text-gray-700 dark:text-gray-300">{course.teacher_name}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Link to={`/course/${course.id}`} className="flex-1 text-center px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Відкрити</Link>
                                        {user.role === 'student' && (
                                            isEnrolled ? (
                                                <span className="flex-1 flex justify-center items-center gap-1 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-bold border border-green-200 dark:border-green-800/30 cursor-default">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Ви записані
                                                </span>
                                            ) : (
                                                <button onClick={() => handleEnroll(course.id)} className="flex-1 text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">Записатися</button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isCourseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Створити новий курс</h3>
                            <button onClick={() => setIsCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateCourse} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Назва курсу</label>
                                <input type="text" placeholder="Наприклад: Основи програмування" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} required className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Опис курсу</label>
                                <textarea placeholder="Про що цей курс..." value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} rows="4" required className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm resize-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Скасувати</button>
                                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Створити курс</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;