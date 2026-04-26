import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const CreateCourseModal = ({ isOpen, onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate({ title, description });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-soft-lg w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-full my-auto">
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Створити новий курс</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form id="createCourseForm" onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Назва курсу</label>
                        <input type="text" placeholder="Наприклад: Основи програмування" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Опис курсу</label>
                        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                            <ReactQuill theme="snow" value={description} onChange={setDescription} placeholder="Про що цей курс..." />
                        </div>
                    </div>
                </form>
                <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Скасувати</button>
                    <button type="submit" form="createCourseForm" className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25">Створити курс</button>
                </div>
            </div>
        </div>
    );
};

function Dashboard() {
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null); 
    const [error, setError] = useState('');
    const [deadlines, setDeadlines] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [progressMap, setProgressMap] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileResponse = await axios.get('/api/users/profile');
                const currentUser = profileResponse.data;
                setUser(currentUser); 

                localStorage.setItem('user', JSON.stringify(currentUser));
                window.dispatchEvent(new Event('user-updated'));

                const coursesResponse = await axios.get('/api/courses');
                setCourses(Array.isArray(coursesResponse.data) ? coursesResponse.data : []);

                if (currentUser.role === 'student') {
                    const deadlinesRes = await axios.get('/api/users/my-deadlines');
                    setDeadlines(Array.isArray(deadlinesRes.data) ? deadlinesRes.data : []);

                    const enrollmentsRes = await axios.get('/api/users/my-enrollments');
                    setEnrolledCourseIds(Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : []);

                    const progressRes = await axios.get('/api/users/my-progress');
                    const pMap = {};
                    if (Array.isArray(progressRes.data)) {
                        progressRes.data.forEach(p => {
                            pMap[p.course_id] = {
                                total: parseInt(p.total_tasks) || 0,
                                completed: parseInt(p.completed_tasks) || 0
                            };
                        });
                    }
                    setProgressMap(pMap);
                }
            } catch (error) {
                console.error('Помилка завантаження Dashboard:', error);
                setError('Не вдалося завантажити дані.');
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('user');
                    navigate('/');
                }
            }
        };
        fetchData();
    }, [navigate]);

    const handleCreateCourse = async ({ title, description }) => {
        try {
            await axios.post('/api/courses', { title, description });
            const coursesResponse = await axios.get('/api/courses');
            setCourses(Array.isArray(coursesResponse.data) ? coursesResponse.data : []);
            setIsCourseModalOpen(false);
            toast.success('Курс успішно створено!');
        } catch (error) {
            console.error('Помилка при створенні курсу:', error);
            toast.error('Помилка при створенні курсу');
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            const response = await axios.post(`/api/courses/${courseId}/enroll`, {});
            setEnrolledCourseIds(prev => [...prev, courseId]);
            toast.success(response.data.message || 'Ви успішно записалися!');
        } catch (error) {
            console.error('Помилка при записі на курс:', error);
            toast.error(error.response?.data?.error || 'Помилка при записі на курс');
        }
    };

    const urgentDeadlines = deadlines.filter(d => {
        const daysLeft = (new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24);
        return daysLeft >= 0 && daysLeft <= 3;
    });

    if (!user) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div></div>;

    const myCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
    const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id));
    const displayCourses = user.role === 'student' ? [...myCourses, ...availableCourses] : courses;

    return (
        <div className="max-w-7xl mx-auto pb-16 relative">
            
            {/* Hero Section */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 mb-8 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400 border border-primary-100 dark:border-primary-900">
                                {user.role === 'teacher' ? 'Викладач' : user.role === 'admin' ? 'Адміністратор' : 'Студент'}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">
                            Привіт, {user.name.split(' ')[0]}
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            {user.role === 'student' 
                                ? "Продовжуй навчання. Твій прогрес чекає на тебе." 
                                : "Керуй своїми курсами та відслідковуй успішність студентів."}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        {user.role === 'student' && (
                            <Link to="/my-grades" className="flex-1 md:flex-none px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"></path></svg>
                                Мій щоденник
                            </Link>
                        )}
                        {user.role === 'admin' && (
                            <Link to="/admin" className="flex-1 md:flex-none px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-100 flex justify-center items-center">
                                Панель Адміністратора
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900 text-sm font-medium">{error}</div>}

            {/* Deadlines Section */}
            {user.role === 'student' && (urgentDeadlines.length > 0 || deadlines.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                    {urgentDeadlines.length > 0 && (
                        <div className="p-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-1">Термінові завдання</h3>
                                <p className="text-xs text-red-700/80 dark:text-red-300/80">У вас {urgentDeadlines.length} завдань з наближаючимся дедлайном.</p>
                            </div>
                        </div>
                    )}
                    {deadlines.length > 0 && (
                        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Наближаються дедлайни
                            </h3>
                            <div className="space-y-2.5 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                {deadlines.map(d => {
                                    const daysLeft = Math.ceil((new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                                    const isUrgent = daysLeft <= 3;
                                    return (
                                        <div key={d.id} className="flex justify-between items-center">
                                            <div className="truncate pr-4">
                                                <p className={`text-sm font-medium truncate ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-200'}`}>{d.title}</p>
                                                <p className="text-xs text-zinc-500 truncate">{d.course_title}</p>
                                            </div>
                                            <span className={`shrink-0 px-2 py-1 rounded-lg text-xs font-medium ${isUrgent ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                {daysLeft} {daysLeft === 1 ? 'день' : [2,3,4].includes(daysLeft) ? 'дні' : 'днів'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Courses Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Всі курси</h2>
                {user.role === 'teacher' && (
                    <button onClick={() => setIsCourseModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg> 
                        Створити курс
                    </button>
                )}
            </div>
            
            {/* Courses Grid */}
            {displayCourses.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                    <div className="w-14 h-14 mx-auto bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Курсів поки немає. Вони появляться тут згодом.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {displayCourses?.map((course, index) => {
                        if (!course) return null; 
                        
                        const isEnrolled = enrolledCourseIds.includes(course.id);
                        const courseProgress = progressMap[course.id];
                        const showProgress = user.role === 'student' && isEnrolled && courseProgress;
                        const progressPercentage = showProgress && courseProgress.total > 0 
                            ? Math.round((courseProgress.completed / courseProgress.total) * 100) 
                            : 0;

                        return (
                            <div key={course.id || `course-${index}`} className={`group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-200 hover:shadow-soft hover:-translate-y-0.5 overflow-hidden ${isEnrolled ? 'border-primary-200 dark:border-primary-900' : 'border-zinc-200 dark:border-zinc-800'}`}>
                                
                                {isEnrolled && (
                                    <div className="h-1 w-full bg-primary-500"></div>
                                )}

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3 gap-3">
                                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                            <div className="w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-[10px] font-semibold text-white">
                                                {course.teacher_name.charAt(0)}
                                            </div>
                                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-24">
                                                {course.teacher_name}
                                            </span>
                                        </div>
                                        {isEnrolled && (
                                            <span className="shrink-0 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 px-2 py-1 rounded-lg">
                                                Записані
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 flex-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: typeof course.description === 'string' ? course.description : '' }}></div>
                                    
                                    {showProgress && (
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-xs font-medium text-zinc-500">Прогрес</span>
                                                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{progressPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-2">
                                        <Link to={`/course/${course.id}`} className="flex-1 text-center px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl text-sm font-medium transition-colors">
                                            Відкрити
                                        </Link>
                                        
                                        {user.role === 'student' && !isEnrolled && (
                                            <button onClick={() => handleEnroll(course.id)} className="flex-1 text-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors">
                                                Записатися
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <CreateCourseModal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} onCreate={handleCreateCourse} />
        </div>
    );
}

export default Dashboard;
