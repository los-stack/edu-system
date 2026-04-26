import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QuizResultsModal({ isOpen, onClose, quiz }) {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && quiz) {
            const fetchResults = async () => {
                setIsLoading(true);
                try {
                    const res = await axios.get(`/api/quizzes/${quiz.id}/results`);
                    setResults(res.data);
                } catch (err) {
                    console.error('Помилка:', err);
                    setError('Не вдалося завантажити результати');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchResults();
        }
    }, [isOpen, quiz]);

    if (!isOpen || !quiz) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft-lg border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
                
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            Результати тесту
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{quiz.title}</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div></div>
                    ) : error ? (
                        <div className="text-center text-red-600 py-10 text-sm">{error}</div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">
                            <p className="text-zinc-500 text-sm">Поки жоден студент не пройшов цей тест.</p>
                        </div>
                    ) : (
                        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                                <thead className="bg-zinc-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Студент</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">Оцінка</th>
                                        <th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Дата</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {results.map((res, idx) => (
                                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium text-sm">
                                                        {res.student_name.charAt(0)}
                                                    </div>
                                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">{res.student_name}</div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium ${res.score >= 80 ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400' : res.score >= 60 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400'}`}>
                                                    {res.score} / 100
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-right text-sm text-zinc-500">
                                                {new Date(res.completed_at).toLocaleString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QuizResultsModal;
