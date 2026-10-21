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
        setTitle('');
        setDescription('');
    };

    return (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="modal-panel w-full max-w-2xl overflow-hidden transform transition-all flex flex-col max-h-full my-auto">
                <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Створити новий курс</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form id="createCourseForm" onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Назва курсу</label>
                            <input type="text" placeholder="Наприклад: Основи програмування" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none dark:border dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all sm:text-sm font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Опис курсу</label>
                            <div className="rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 dark:border dark:border-zinc-700">
                                <ReactQuill theme="snow" value={description} onChange={setDescription} placeholder="Про що цей курс..." />
                            </div>
                        </div>
                    </div>
                </form>
                <div className="px-8 py-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Скасувати</button>
                    <button type="submit" form="createCourseForm" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 dark:shadow-none">Створити курс</button>
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
    const [courseSearch, setCourseSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');

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
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Помилка при створенні курсу');
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            const response = await axios.post(`/api/courses/${courseId}/enroll`, {});
            setEnrolledCourseIds(prev => [...prev, courseId]);
            toast.success(response.data.message || 'Ви успішно записалися!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Помилка при записі на курс');
        }
    };

    const urgentDeadlines = deadlines.filter(d => {
        const daysLeft = (new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24);
        return daysLeft >= 0 && daysLeft <= 3;
    });

    if (!user) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    const myCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
    const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id));
    const displayCourses = user.role === 'student' ? [...myCourses, ...availableCourses] : courses;
    const normalizedSearch = courseSearch.trim().toLocaleLowerCase('uk-UA');
    const filteredCourses = displayCourses.filter(course => {
        const isEnrolled = enrolledCourseIds.includes(course.id);
        const matchesFilter = user.role !== 'student'
            || courseFilter === 'all'
            || (courseFilter === 'enrolled' && isEnrolled)
            || (courseFilter === 'available' && !isEnrolled);
        const searchableText = [
            course.title,
            course.teacher_name,
            typeof course.description === 'string' ? course.description.replace(/<[^>]*>/g, ' ') : ''
        ].filter(Boolean).join(' ').toLocaleLowerCase('uk-UA');

        return matchesFilter && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });

    return (
        <div className="w-full relative mt-2">
            
            <div className="dashboard-hero dashboard-hero-feature">
                <div className="dashboard-hero-copy relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="dashboard-role">
                            {user.role === 'teacher' ? 'Викладач' : user.role === 'admin' ? 'Адміністратор' : 'Студент'}
                        </span>
                    </div>
                    <h1>
                        З поверненням, {user.name.split(' ')[0]}
                    </h1>
                    <p>
                        {user.role === 'student' 
                            ? "Продовжуй навчання. Твій прогрес чекає на тебе." 
                            : "Керуй своїми курсами та відслідковуй успішність студентів."}
                    </p>
                </div>

                <div className="dashboard-hero-art" aria-hidden="true">
                    <span className="dashboard-hero-art-label">ТВОЯ ТРАЄКТОРІЯ</span>
                    <span className="dashboard-hero-art-center">GO</span>
                    <span className="dashboard-hero-art-point dashboard-hero-art-point-one">01</span>
                    <span className="dashboard-hero-art-point dashboard-hero-art-point-two">02</span>
                    <span className="dashboard-hero-art-point dashboard-hero-art-point-three">03</span>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-medium">{error}</div>}

            {user.role === 'student' && (urgentDeadlines.length > 0 || deadlines.length > 0) && (
                <div className="dashboard-deadlines grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                    {urgentDeadlines.length > 0 && (
                        <div className="p-8 bg-red-50/50 dark:bg-zinc-900 rounded-4xl border border-red-200 dark:border-red-900/30 flex flex-col justify-center shadow-md dark:shadow-none">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 tracking-tight">Термінові завдання</h3>
                            </div>
                            <p className="text-sm font-medium text-red-600 dark:text-red-300 ml-13">У вас {urgentDeadlines.length} завдань, які "горять". Не відкладайте!</p>
                        </div>
                    )}
                    {deadlines.length > 0 && (
                        <div className="p-8 bg-white dark:bg-zinc-900 rounded-4xl border border-zinc-200 dark:border-zinc-800 shadow-md dark:shadow-none">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                Наближаються дедлайни
                            </h3>
                            <div className="space-y-3 max-h-35 overflow-y-auto custom-scrollbar pr-2">
                                {deadlines.map(d => {
                                    const daysLeft = Math.ceil((new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                                    const isUrgent = daysLeft <= 3;
                                    return (
                                        <div key={d.id} className="flex justify-between items-center">
                                            <div className="truncate pr-4">
                                                <p className={`text-sm font-semibold truncate ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-200'}`}>{d.title}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate mt-0.5">{d.course_title}</p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isUrgent ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                    {daysLeft} {daysLeft === 1 ? 'день' : [2,3,4].includes(daysLeft) ? 'дні' : 'днів'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="dashboard-section-heading flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <span className="ui-eyebrow">Навчальний простір</span>
                    <h2 className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Ваші курси</h2>
                </div>
                {user.role === 'teacher' && (
                    <button onClick={() => setIsCourseModalOpen(true)} className="ui-button-primary">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden="true"><path strokeLinecap="round" d="M12 5v14m-7-7h14"></path></svg>
                        Новий курс
                    </button>
                )}
            </div>

            {displayCourses.length > 0 && (
                <div className="course-tools flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="course-search-field">
                        <label htmlFor="course-search" className="sr-only">Пошук курсів</label>
                        <svg className="course-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" strokeWidth="2"></circle>
                            <path strokeLinecap="round" strokeWidth="2" d="m16 16 4 4"></path>
                        </svg>
                        <input
                            id="course-search"
                            type="search"
                            value={courseSearch}
                            onChange={event => setCourseSearch(event.target.value)}
                            placeholder="Назва курсу або викладач"
                            className="ui-input course-search-input"
                            aria-controls="course-results"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Фільтри курсів">
                        {user.role === 'student' && [
                            { value: 'all', label: 'Усі курси' },
                            { value: 'enrolled', label: 'Мої курси' },
                            { value: 'available', label: 'Доступні' }
                        ].map(filter => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setCourseFilter(filter.value)}
                                aria-pressed={courseFilter === filter.value}
                                className={courseFilter === filter.value ? 'ui-button-primary' : 'ui-button-secondary'}
                            >
                                {filter.label}
                            </button>
                        ))}
                        <span className="text-sm text-zinc-500 dark:text-zinc-400 px-1" aria-live="polite">
                            {filteredCourses.length} з {displayCourses.length}
                        </span>
                    </div>
                </div>
            )}
            
            {displayCourses.length === 0 ? (
                <div className="app-empty-state text-center py-20">
                    <div className="w-16 h-16 mx-auto bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Курсів поки немає. Вони з'являться тут згодом.</p>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="app-empty-state text-center py-16">
                    <div className="w-16 h-16 mx-auto bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" strokeWidth="1.5"></circle>
                            <path strokeLinecap="round" strokeWidth="1.5" d="m16 16 4 4"></path>
                        </svg>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-200 font-semibold">Курсів за цим запитом не знайдено</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Спробуйте змінити пошуковий запит або фільтр.</p>
                    <button
                        type="button"
                        onClick={() => {
                            setCourseSearch('');
                            setCourseFilter('all');
                        }}
                        className="ui-button-secondary mt-5"
                    >
                        Очистити пошук і фільтри
                    </button>
                </div>
            ) : (
                <div id="course-results" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" aria-live="polite">
                    {filteredCourses.map((course, index) => {
                        if (!course) return null; 
                        
                        const isEnrolled = enrolledCourseIds.includes(course.id);
                        const courseProgress = progressMap[course.id];
                        const showProgress = user.role === 'student' && isEnrolled && courseProgress;
                        const progressPercentage = showProgress && courseProgress.total > 0 
                            ? Math.round((courseProgress.completed / courseProgress.total) * 100) 
                            : 0;

                        return (
                            <div key={course.id || `course-${index}`} className={`course-card group flex flex-col overflow-hidden relative${isEnrolled ? ' is-enrolled' : ''}`}>
                                <div className="course-card-cover">
                                    <span className="course-card-index">АРХІВ / {String(index + 1).padStart(2, '0')}</span>
                                    {isEnrolled && <span className="course-card-status">У програмі</span>}
                                    <span className="course-card-glyph" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                                </div>

                                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4 gap-4">
                                        <div className="inline-flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                {course.teacher_name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 truncate max-w-30">
                                                {course.teacher_name}
                                            </span>
                                        </div>
                                        {isEnrolled && (
                                            <span className="shrink-0 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/10 px-2.5 py-1 rounded-md">
                                                Ви записані
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 flex-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: typeof course.description === 'string' ? course.description : '' }}></div>
                                    
                                    {showProgress && (
                                        <div className="mb-6">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Прогрес</span>
                                                <span className="text-sm font-black text-blue-600">{progressPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pt-2">
                                        <Link to={`/course/${course.id}`} className="course-card-link flex-1">
                                            Переглянути курс
                                        </Link>
                                        
                                        {user.role === 'student' && !isEnrolled && (
                                            <button onClick={() => handleEnroll(course.id)} className="ui-button-primary flex-1">
                                                Приєднатися
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