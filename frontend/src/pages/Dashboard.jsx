import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    navigate('/');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/courses', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setCourses(response.data);
            } catch (err) {
                console.error('Помилка завантаження курсів:', err);
                setError('Не вдалося завантажити курси. Можливо, термін дії токена закінчився.');
            }
        };

        fetchCourses();
    }, [navigate]); 

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Головна панель</h1>
                <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                    Вийти
                </button>
            </div>

            <h2>Доступні курси:</h2>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {courses.length === 0 && !error ? (
                    <p>Курсів поки немає. Завантаження...</p>
                ) : (
                    courses.map((course) => (
                        <div key={course.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>{course.title}</h3>
                            <p style={{ margin: '0 0 10px 0', color: '#555' }}>{course.description}</p>
                            <small style={{ color: '#888' }}>Викладач: {course.teacher_name}</small>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Dashboard;