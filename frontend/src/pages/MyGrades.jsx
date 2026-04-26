import React, { useState, useEffect, useMemo } from 'react';
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
                setGrades(Array.isArray(response.data) ? response.data : []);
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
        ? Math.round(grades.reduce((sum, grade) => sum + Number(grade.score), 0) / totalGrades) 
        : 0;

    let statusConfig = {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-500/10',
        border: 'border-green-200 dark:border-green-500/20',
        text: 'Відмінно',
        icon: <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    };

    if (averageScore > 0 && averageScore < 60) {
        statusConfig = {
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-500/10',
            border: 'border-red-200 dark:border-red-500/20',
            text: 'Потребує уваги',
            icon: <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        };
    } else if (averageScore >= 60 && averageScore < 80) {
        statusConfig = {
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            border: 'border-amber-200 dark:border-amber-500/20',
            text: 'Добре',
            icon: <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        };
    }

    const groupedGrades = useMemo(() => {
        const map = {};
        grades.forEach(g => {
            const courseName = g.course_title || 'Інші курси';
            if (!map[courseName]) map[courseName] = [];
            map[courseName].push(g);
        });
        return map;
    }, [grades]);

    const getScoreStyles = (score) => {
        const num = Number(score);
        if (num >= 80) return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-200 dark:border-green-500/20' };
        if (num >= 60) return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' };
        return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20' };
    };

    if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8 mt-4">
            
            <div className="relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 sm:p-12 mb-10 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="absolute top-0 right-0 w-125 h-125 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10 max-w-xl">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 mb-6 hover:gap-3 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        НАЗАД ДО ПАНЕЛІ
                    </Link>
                    <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">Мій щоденник</h1>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">Детальна аналітика вашої успішності на платформі.</p>
                </div>

                {totalGrades > 0 && (
                    <div className="relative z-10 flex flex-wrap sm:flex-nowrap gap-4 w-full lg:w-auto">
                        <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 p-5 sm:p-6 rounded-3xl border border-zinc-100 dark:border-zinc-700/50 backdrop-blur-sm min-w-35 flex flex-col justify-between">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Середній бал</p>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-4xl font-black ${statusConfig.color.split(' ')[0]}`}>{averageScore}</span>
                                <span className="text-sm font-bold text-zinc-400">/ 100</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 p-5 sm:p-6 rounded-3xl border border-zinc-100 dark:border-zinc-700/50 backdrop-blur-sm min-w-35 flex flex-col justify-between">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Оцінено робіт</p>
                            <span className="text-4xl font-black text-zinc-900 dark:text-white">{totalGrades}</span>
                        </div>

                        <div className={`flex-1 p-5 sm:p-6 rounded-3xl border ${statusConfig.bg} ${statusConfig.border} backdrop-blur-sm min-w-37.5 flex flex-col justify-between`}>
                            <p className={`text-xs font-black uppercase tracking-widest mb-3 ${statusConfig.color}`}>Статус</p>
                            <div className="flex items-center gap-3">
                                {statusConfig.icon}
                                <span className={`text-lg font-black leading-tight ${statusConfig.color}`}>{statusConfig.text}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/30 font-medium">{error}</div>}

            {totalGrades === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl shadow-zinc-200/40 dark:shadow-none border border-zinc-200 dark:border-zinc-800">
                    <div className="w-16 h-16 mx-auto bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Оцінок поки немає</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Виконуйте завдання та тести, і результати з'являться тут.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedGrades).map(([courseTitle, courseGrades]) => (
                        <div key={courseTitle} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-4xl overflow-hidden shadow-xl shadow-zinc-200/40 dark:shadow-none">
                            
                            <div className="bg-zinc-50/50 dark:bg-zinc-800/30 px-6 sm:px-8 py-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                                </div>
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{courseTitle}</h2>
                            </div>
                            
                            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {courseGrades.map((grade, idx) => {
                                    const title = grade.item_title || grade.assignment_title;
                                    const date = grade.created_at || grade.graded_at;
                                    const type = grade.type || 'assignment';
                                    const styles = getScoreStyles(grade.score);

                                    return (
                                        <div key={idx} className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                            
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${type === 'quiz' ? 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400' : 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'}`}>
                                                    {type === 'quiz' ? (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                                    ) : (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${type === 'quiz' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                            {type === 'quiz' ? 'Тест' : 'Завдання'}
                                                        </span>
                                                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                                                            {date ? new Date(date).toLocaleDateString('uk-UA') : 'Дату не вказано'}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h4>
                                                    
                                                    {grade.feedback && (
                                                        <div className="inline-flex items-start gap-2 mt-1 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                                                            <svg className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium italic">«{grade.feedback}»</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`shrink-0 flex items-center justify-center min-w-20 h-20 rounded-2xl border-2 ${styles.bg} ${styles.border}`}>
                                                <span className={`text-2xl font-black ${styles.color}`}>
                                                    {grade.score}
                                                </span>
                                            </div>
                                            
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyGrades;