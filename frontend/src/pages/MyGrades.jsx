import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function MyGrades() {
    const [grades, setGrades] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await axios.get('/api/users/my-grades');
                setGrades(response.data);
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити оцінки.');
                if (err.response?.status === 401) {
                    localStorage.removeItem('user');
                    navigate('/');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchGrades();
    }, [navigate]);

    const totalGrades = grades.length;
    const averageScore = totalGrades > 0 
        ? Math.round(grades.reduce((sum, grade) => sum + grade.score, 0) / totalGrades) 
        : 0;

    let statusConfig = {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800/30',
        text: 'Відмінно',
        icon: <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    };

    if (averageScore > 0 && averageScore < 60) {
        statusConfig = {
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800/30',
            text: 'Потребує уваги',
            icon: <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        };
    } else if (averageScore >= 60 && averageScore < 80) {
        statusConfig = {
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-200 dark:border-amber-800/30',
            text: 'Добре',
            icon: <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        };
    }

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-12">
            
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Назад до панелі
            </Link>
            
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Мій щоденник</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Детальна аналітика вашої успішності на платформі.</p>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800/30">{error}</div>}

            {totalGrades > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Середній бал</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{averageScore}</span>
                                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">/ 100</span>
                            </div>
                        </div>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${averageScore >= 80 ? 'border-green-100 dark:border-green-800/30 bg-green-50 dark:bg-green-900/20' : averageScore >= 60 ? 'border-amber-100 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/20' : 'border-red-100 dark:border-red-800/30 bg-red-50 dark:bg-red-900/20'}`}>
                            <span className={`text-xl font-bold ${statusConfig.color.split(' ')[0]} ${statusConfig.color.split(' ')[1]}`}>{averageScore}</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Перевірено робіт</p>
                            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{totalGrades}</span>
                        </div>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 border-4 border-blue-100 dark:border-blue-800/30">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Статус успішності</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-md text-sm font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                {statusConfig.text}
                            </span>
                        </div>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${statusConfig.bg} ${statusConfig.border.replace('border-', 'border-opacity-50 border-')}`}>
                            {statusConfig.icon}
                        </div>
                    </div>

                </div>
            )}

            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Історія оцінювання</h2>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {grades.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Оцінок поки немає</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Виконуйте завдання, і результати з'являться тут.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {grades.map((grade, index) => {
                            const isHigh = grade.score >= 80;
                            const isMid = grade.score >= 60 && grade.score < 80;
                            const scoreColor = isHigh ? 'text-green-700 dark:text-green-400' : isMid ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400';
                            const scoreBg = isHigh ? 'bg-green-50 dark:bg-green-900/20' : isMid ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20';
                            const scoreBorder = isHigh ? 'border-green-200 dark:border-green-800/30' : isMid ? 'border-amber-200 dark:border-amber-800/30' : 'border-red-200 dark:border-red-800/30';

                            return (
                                <li key={index} className="p-5 sm:p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-800/30">
                                                {grade.course_title}
                                            </span>
                                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                {new Date(grade.graded_at).toLocaleDateString('uk-UA')}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 truncate" title={grade.assignment_title}>
                                            {grade.assignment_title}
                                        </h4>
                                        
                                        {grade.feedback ? (
                                            <div className="flex items-start gap-2 mt-3">
                                                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">«{grade.feedback}»</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 dark:text-gray-500 italic mt-3">Без коментарів</p>
                                        )}
                                    </div>

                                    <div className="shrink-0 flex items-center md:justify-end">
                                        <div className={`flex flex-col items-center justify-center min-w-20 h-20 rounded-2xl border ${scoreBg} ${scoreBorder} shadow-sm`}>
                                            <span className={`text-3xl font-extrabold ${scoreColor.split(' ')[0]} ${scoreColor.split(' ')[1]} leading-none`}>
                                                {grade.score}
                                            </span>
                                        </div>
                                    </div>

                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default MyGrades;