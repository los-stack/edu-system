import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null); 
    const [error, setError] = useState('');
    const [deadlines, setDeadlines] = useState([]);

    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [newCourseDesc, setNewCourseDesc] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/');

                const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const currentUser = profileResponse.data;
                setUser(currentUser); 

                const coursesResponse = await axios.get('http://localhost:5000/api/courses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(coursesResponse.data);

                if (currentUser.role === 'student') {
                    const deadlinesRes = await axios.get('http://localhost:5000/api/users/my-deadlines', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setDeadlines(deadlinesRes.data);
                }
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити дані.');
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/');
                }
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/courses', 
                { title: newCourseTitle, description: newCourseDesc },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Курс успішно створено!');
            const newCourse = { ...response.data.course, teacher_name: user.name };
            setCourses([newCourse, ...courses]); 
            setNewCourseTitle('');
            setNewCourseDesc('');
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при створенні курсу');
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, 
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(response.data.message); 
        } catch (err) {
            if (err.response && err.response.data) alert(err.response.data.error);
            else alert('Помилка при записі на курс');
        }
    };

    const urgentDeadlines = deadlines.filter(d => {
        const daysLeft = (new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24);
        return daysLeft >= 0 && daysLeft <= 3;
    });

    if (!user) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Головна панель</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-gray-500">Привіт, <span className="font-semibold text-gray-800">{user.name}</span>!</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'teacher' ? 'bg-green-100 text-green-800' : 
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {user.role === 'teacher' ? 'Викладач' : user.role === 'admin' ? 'Адміністратор' : 'Студент'}
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {user.role === 'student' && (
                        <Link to="/my-grades" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
                            Мій щоденник
                        </Link>
                    )}
                    {user.role === 'admin' && (
                        <Link to="/admin" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                            Панель Адміністратора
                        </Link>
                    )}
                    <button onClick={handleLogout} className="px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm">
                        Вийти
                    </button>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

            {user.role === 'student' && (
                <div className="mb-10 space-y-4">
                    {urgentDeadlines.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <svg className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            <div>
                                <h3 className="text-sm font-bold text-red-800">Увага! Термінові завдання</h3>
                                <p className="text-sm text-red-700 mt-1">У вас є завдання ({urgentDeadlines.length} шт.), які потрібно здати найближчим часом.</p>
                            </div>
                        </div>
                    )}

                    {deadlines.length > 0 && (
                        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
                            <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Наближаються дедлайни
                            </h3>
                            <ul className="space-y-3">
                                {deadlines.map(d => {
                                    const daysLeft = Math.ceil((new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                                    const isUrgent = daysLeft <= 3;
                                    return (
                                        <li key={d.id} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm ${isUrgent ? 'text-red-700 font-medium' : 'text-amber-800'}`}>
                                            <span><span className="opacity-75">{d.course_title}</span> — <strong>{d.title}</strong></span>
                                            <span className="mt-1 sm:mt-0 text-xs bg-white/50 border border-amber-100/50 px-2.5 py-1 rounded-md">Залишилось днів: {daysLeft}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {user.role === 'teacher' && (
                <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Створити новий курс</h3>
                    <form onSubmit={handleCreateCourse} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-4">
                            <input type="text" placeholder="Назва курсу" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} required 
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm" />
                            <textarea placeholder="Короткий опис курсу..." value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} rows="2"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm resize-none" />
                        </div>
                        <button type="submit" className="sm:self-stretch px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
                            Створити
                        </button>
                    </form>
                </div>
            )}

            <div className="mb-6 flex justify-between items-end">
                <h2 className="text-xl font-bold text-gray-900">Каталог курсів</h2>
            </div>
            
            {courses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Курсів поки немає. Вони з'являться тут згодом.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow group">
                            
                            <div className="flex-grow mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    Викладач: <span className="font-medium text-gray-700">{course.teacher_name}</span>
                                </p>
                                
                                <div className="flex flex-wrap gap-2">
                                    <Link to={`/course/${course.id}`} className="flex-1 text-center px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                                        Відкрити
                                    </Link>
                                    
                                    {user.role === 'student' && (
                                        <button onClick={() => handleEnroll(course.id)} className="flex-1 text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                                            Записатися
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;