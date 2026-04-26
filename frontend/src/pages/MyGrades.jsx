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
        bg: 'bg-green-50 dark:bg-green-950',
        border: 'border-green-200 dark:border-green-900',
        text: 'Відмінно',
        icon: <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    };

    if (averageScore > 0 && averageScore < 60) {
        statusConfig = {
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-950',
            border: 'border-red-200 dark:border-red-900',
            text: 'Потребує уваги',
            icon: <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        };
    } else if (averageScore >= 60 && averageScore < 80) {
        statusConfig = {
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950',
            border: 'border-amber-200 dark:border-amber-900',
            text: 'Добре',
            icon: <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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
        if (num >= 80) return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-900' };
        if (num >= 60) return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-900' };
        return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-900' };
    };

    if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div></div>;

    return (
        <div className="max-w-7xl mx-auto pb-16">
            
            {/* Header */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 mb-8 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="max-w-xl">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 mb-4 hover:gap-3 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Назад до панелі
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Мій щоденник</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Детальна аналітика вашої успішності на платформі.</p>
                    </div>

                    {totalGrades > 0 && (
                        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
                            <div className="flex-1 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 min-w-32">
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Середній бал</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-bold ${statusConfig.color.split(' ')[0]}`}>{averageScore}</span>
                                    <span className="text-sm font-medium text-zinc-400">/ 100</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 min-w-32">
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Оцінено робіт</p>
                                <span className="text-2xl font-bold text-zinc-900 dark:text-white">{totalGrades}</span>
                            </div>

                            <div className={`flex-1 p-4 rounded-xl border ${statusConfig.bg} ${statusConfig.border} min-w-36`}>
                                <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${statusConfig.color}`}>Статус</p>
                                <div className="flex items-center gap-2">
                                    {statusConfig.icon}
                                    <span className={`text-sm font-semibold ${statusConfig.color}`}>{statusConfig.text}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900 text-sm font-medium">{error}</div>}

            {totalGrades === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
                    <div className="w-14 h-14 mx-auto bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Оцінок поки немає</h3>
                    <p className="text-zinc-500 text-sm">Виконуйте завдання та тести, і результати {"з'являться"} тут.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedGrades).map(([courseTitle, courseGrades]) => (
                        <div key={courseTitle} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                            
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                                </div>
                                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">{courseTitle}</h2>
                            </div>
                            
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {courseGrades.map((grade, idx) => {
                                    const title = grade.item_title || grade.assignment_title;
                                    const date = grade.created_at || grade.graded_at;
                                    const type = grade.type || 'assignment';
                                    const styles = getScoreStyles(grade.score);

                                    return (
                                        <div key={idx} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${type === 'quiz' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' : 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'}`}>
                                                    {type === 'quiz' ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded ${type === 'quiz' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'}`}>
                                                            {type === 'quiz' ? 'Тест' : 'Завдання'}
                                                        </span>
                                                        <span className="text-xs text-zinc-400">
                                                            {date ? new Date(date).toLocaleDateString('uk-UA') : 'Дату не вказано'}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-1">{title}</h4>
                                                    
                                                    {grade.feedback && (
                                                        <div className="inline-flex items-start gap-1.5 mt-1 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                                            <svg className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">«{grade.feedback}»</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`shrink-0 flex items-center justify-center min-w-16 h-16 rounded-xl border ${styles.bg} ${styles.border}`}>
                                                <span className={`text-xl font-bold ${styles.color}`}>
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
