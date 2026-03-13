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
                if (!token) {
                    navigate('/');
                    return;
                }

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
                console.error('Помилка:', err);
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
            console.error(err);
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

    if (!user) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Завантаження...</p>;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Головна панель</h1>
                    <p style={{ margin: '5px 0 0 0', color: 'gray' }}>
                        Привіт, {user.name}! (Роль: {user.role === 'teacher' ? 'Викладач' : 'Студент'})
                    </p>
                    {user.role === 'student' && (
                     <Link to="/my-grades" style={{ display: 'inline-block', marginTop: '10px', padding: '8px 12px', backgroundColor: '#17a2b8', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                         📊 Мій щоденник оцінок
                     </Link>
                    )}

                    {user.role === 'admin' && (
                     <Link to="/admin" style={{ display: 'inline-block', marginTop: '10px', marginLeft: '10px', padding: '8px 12px', backgroundColor: '#343a40', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                         👑 Панель Адміністратора
                     </Link>
                    )}
                </div>
                <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Вийти
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {user.role === 'student' && (
                <div style={{ marginBottom: '30px' }}>
                    {urgentDeadlines.length > 0 && (
                        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
                            <strong>🔔 Увага!</strong> У вас є завдання, які потрібно здати найближчим часом ({urgentDeadlines.length} шт.).
                        </div>
                    )}

                    <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', border: '1px solid #ffeeba' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#856404' }}>📅 Наближаються дедлайни:</h3>
                        {deadlines.length === 0 ? (
                            <p style={{ margin: 0, color: '#856404' }}>У вас немає найближчих завдань. Відпочивайте! ☕</p>
                        ) : (
                            <ul style={{ paddingLeft: '20px', margin: 0, color: '#856404' }}>
                                {deadlines.map(d => {
                                    const daysLeft = Math.ceil((new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                                    const isUrgent = daysLeft <= 3;
                                    
                                    return (
                                        <li key={d.id} style={{ marginBottom: '10px', fontWeight: isUrgent ? 'bold' : 'normal', color: isUrgent ? '#dc3545' : '#856404' }}>
                                            {d.course_title} — <strong>{d.title}</strong>
                                            <br/>
                                            <small>Дедлайн: {new Date(d.due_date).toLocaleDateString('uk-UA')} (залишилось днів: {daysLeft})</small>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {user.role === 'teacher' && (
                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
                    <h3 style={{ marginTop: 0 }}>Створити новий курс</h3>
                    <form onSubmit={handleCreateCourse} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                            <input type="text" placeholder="Назва курсу" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} required style={{ padding: '8px' }} />
                            <textarea placeholder="Опис курсу" value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} style={{ padding: '8px', minHeight: '60px' }} />
                        </div>
                        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', height: '100%' }}>Створити</button>
                    </form>
                </div>
            )}

            <h2>Всі доступні курси:</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {courses.length === 0 ? (
                    <p>Курсів поки немає.</p>
                ) : (
                    courses.map((course) => (
                        <div key={course.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{course.title}</h3>
                            <p style={{ margin: '0 0 10px 0', color: '#555' }}>{course.description}</p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <small style={{ color: '#888' }}>Викладач: {course.teacher_name}</small>
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Link to={`/course/${course.id}`} style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                                        Відкрити курс
                                    </Link>
                                    {user.role === 'student' && (
                                        <button onClick={() => handleEnroll(course.id)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px' }}>
                                            Записатися
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Dashboard;