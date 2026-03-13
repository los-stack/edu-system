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
                if (!token) return navigate('/');

                const response = await axios.get('http://localhost:5000/api/users/my-grades', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setGrades(response.data);
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити оцінки.');
            }
        };

        fetchGrades();
    }, [navigate]);

    const totalGrades = grades.length;
    const averageScore = totalGrades > 0 
        ? Math.round(grades.reduce((sum, grade) => sum + grade.score, 0) / totalGrades) 
        : 0;

    let progressColorClass = 'bg-green-500';
    let textColorClass = 'text-green-600';
    let badgeClass = 'bg-green-100 text-green-800 border-green-200';
    let statusText = 'Відмінно';

    if (averageScore < 60) {
        progressColorClass = 'bg-red-500';
        textColorClass = 'text-red-600';
        badgeClass = 'bg-red-100 text-red-800 border-red-200';
        statusText = 'Потрібно підтягнути';
    } else if (averageScore < 80) {
        progressColorClass = 'bg-amber-500';
        textColorClass = 'text-amber-600';
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
        statusText = 'Добре';
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Назад до панелі
            </Link>
            
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Мій щоденник</h1>
                    <p className="text-gray-500 mt-1">Аналітика вашої успішності</p>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

            {totalGrades > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 mb-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Загальний прогрес</h2>
                            <p className="text-sm text-gray-500">Оцінених завдань: {totalGrades}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-end gap-2">
                                <span className={`text-4xl font-extrabold ${textColorClass}`}>{averageScore}</span>
                                <span className="text-gray-400 font-medium mb-1">/ 100</span>
                            </div>
                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
                                {statusText}
                            </span>
                        </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200/60">
                        <div 
                            className={`h-full ${progressColorClass} transition-all duration-1000 ease-out`}
                            style={{ width: `${averageScore}%` }} 
                        />
                    </div>
                </div>
            )}

            <h3 className="text-xl font-bold text-gray-900 mb-5">Деталізація за завданнями</h3>
            
            <div className="space-y-4">
                {grades.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">У вас поки немає оцінок. Виконуйте завдання, і вони тут з'являться!</p>
                    </div>
                ) : (
                    grades.map((grade, index) => {
                        const isHigh = grade.score >= 80;
                        const isMid = grade.score >= 60 && grade.score < 80;
                        const scoreColor = isHigh ? 'text-green-600' : isMid ? 'text-amber-600' : 'text-red-600';
                        const scoreBg = isHigh ? 'bg-green-50' : isMid ? 'bg-amber-50' : 'bg-red-50';

                        return (
                            <div key={index} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{grade.course_title}</h3>
                                        <span className="text-xs text-gray-400">• {new Date(grade.graded_at).toLocaleDateString('uk-UA')}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        Завдання: <span className="font-normal text-gray-600">{grade.assignment_title}</span>
                                    </p>
                                    
                                    {grade.feedback && (
                                        <div className="bg-gray-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                            <p className="text-sm text-gray-600 italic">"{grade.feedback}"</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className={`flex items-center justify-center min-w-[100px] h-[100px] rounded-full sm:rounded-xl border border-gray-100 ${scoreBg}`}>
                                    <span className={`text-3xl font-bold ${scoreColor}`}>
                                        {grade.score}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default MyGrades;