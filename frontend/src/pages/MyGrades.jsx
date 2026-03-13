import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function MyGrades() {
    const [grades, setGrades] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/users/my-grades', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setGrades(response.data);
            } catch (err) {
                console.error('Помилка завантаження оцінок:', err);
                setError('Не вдалося завантажити оцінки.');
            }
        };

        fetchGrades();
    }, [navigate]);

    const totalGrades = grades.length;
    
    const averageScore = totalGrades > 0 
        ? Math.round(grades.reduce((sum, grade) => sum + grade.score, 0) / totalGrades) 
        : 0;

    let progressColor = '#28a745'; 
    if (averageScore < 60) progressColor = '#dc3545'; 
    else if (averageScore < 80) progressColor = '#ffc107'; 

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#008CBA' }}>← Повернутися на Головну панель</Link>
            
            <h1 style={{ marginTop: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Мій щоденник (Оцінки)</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {totalGrades > 0 && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h2 style={{ margin: 0, color: '#333' }}>Ваша успішність</h2>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '18px', color: '#555' }}>Оцінених завдань: <strong>{totalGrades}</strong></span>
                        <span style={{ fontSize: '18px', color: '#555' }}>Середній бал: <strong style={{ color: progressColor, fontSize: '24px' }}>{averageScore} / 100</strong></span>
                    </div>

                    <div style={{ width: '100%', backgroundColor: '#e9ecef', borderRadius: '5px', height: '20px', overflow: 'hidden' }}>
                        <div 
                            style={{ 
                                height: '100%', 
                                backgroundColor: progressColor, 
                                width: `${averageScore}%`, 
                                transition: 'width 0.5s ease-in-out' 
                            }} 
                        />
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
                <h3 style={{ margin: 0, color: '#555' }}>Деталізація за завданнями:</h3>
                
                {grades.length === 0 ? (
                    <p style={{ color: '#555' }}>У вас поки немає оцінок. Виконуйте завдання, і вони тут з'являться!</p>
                ) : (
                    grades.map((grade, index) => (
                        <div key={index} style={{ border: '1px solid #c3e6cb', padding: '15px', borderRadius: '8px', backgroundColor: '#d4edda' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #c3e6cb', paddingBottom: '10px', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, color: '#155724' }}>{grade.course_title}</h3>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                                    {grade.score} / 100
                                </div>
                            </div>
                            
                            <p style={{ margin: '0 0 10px 0', color: '#155724', fontWeight: 'bold' }}>
                                Завдання: <span style={{ fontWeight: 'normal' }}>{grade.assignment_title}</span>
                            </p>
                            
                            {grade.feedback && (
                                <p style={{ margin: '0 0 10px 0', color: '#155724', fontStyle: 'italic' }}>
                                    " {grade.feedback} "
                                </p>
                            )}
                            
                            <small style={{ color: '#28a745' }}>
                                Оцінено: {new Date(grade.graded_at).toLocaleDateString('uk-UA')}
                            </small>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default MyGrades;