import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; 
import ConfirmModal from '../components/ConfirmModal'; 

function TakeQuiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultScore, setResultScore] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); 

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await axios.get(`/api/quizzes/${quizId}`);
                setQuiz(res.data);
            } catch (err) {
                console.error('Помилка:', err);
                setError('Не вдалося завантажити тест або ви його вже проходили.');
                if (err.response?.status === 401) {
                    localStorage.removeItem('user');
                    navigate('/');
                }
            }
        };
        fetchQuiz();
    }, [quizId, navigate]);

    const handleOptionSelect = (questionId, optionId) => {
        setAnswers({ ...answers, [questionId]: optionId });
    };

    const handleAttemptSubmit = () => {
        if (Object.keys(answers).length < quiz.questions.length) {
            return toast.error("Будь ласка, дайте відповідь на всі запитання перед завершенням!"); 
        }
        setIsConfirmOpen(true);
    };

    const confirmSubmit = async () => {
        setIsConfirmOpen(false);
        setIsSubmitting(true);
        try {
            const res = await axios.post(`/api/quizzes/${quizId}/submit`, { answers });
            setResultScore(res.data.score);
            toast.success('Тест успішно завершено!'); 
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при здачі тесту'); 
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) return <div className="p-8 text-center text-red-500 font-bold mt-10">{error}</div>;
    if (!quiz) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

    if (resultScore !== null) {
        const isSuccess = resultScore >= 60;
        const colorTheme = resultScore >= 80 ? 'green' : resultScore >= 60 ? 'amber' : 'red';
        
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white dark:bg-zinc-900 p-10 sm:p-14 rounded-[2.5rem] shadow-2xl dark:shadow-none dark:border dark:border-zinc-800 text-center relative overflow-hidden">
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-75 h-75 rounded-full blur-3xl opacity-20 pointer-events-none ${colorTheme === 'green' ? 'bg-green-500' : colorTheme === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                    
                    <div className="relative z-10">
                        <div className={`w-24 h-24 mx-auto rounded-4xl flex items-center justify-center mb-8 shadow-lg dark:shadow-none ${colorTheme === 'green' ? 'bg-green-50 text-green-500 dark:bg-green-500/10' : colorTheme === 'amber' ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/10' : 'bg-red-50 text-red-500 dark:bg-red-500/10'} border ${colorTheme === 'green' ? 'border-green-200 dark:border-green-500/20' : colorTheme === 'amber' ? 'border-amber-200 dark:border-amber-500/20' : 'border-red-200 dark:border-red-500/20'}`}>
                            {isSuccess ? (
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            )}
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">
                            {resultScore >= 80 ? 'Блискучий результат!' : resultScore >= 60 ? 'Тест пройдено!' : 'Спробуйте ще раз'}
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">Ваш результат автоматично збережено в системі.</p>
                        
                        <div className={`inline-flex items-baseline gap-2 mb-12 ${colorTheme === 'green' ? 'text-green-600 dark:text-green-400' : colorTheme === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                            <span className="text-7xl font-black tracking-tighter">{resultScore}</span>
                            <span className="text-2xl font-bold opacity-50">/ 100</span>
                        </div>
                        
                        <button onClick={() => navigate(`/course/${quiz.course_id}`)} className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-[1.02] transition-transform shadow-lg dark:shadow-none">
                            ПОВЕРНУТИСЯ ДО КУРСУ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quiz.questions.length;
    const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

    return (
        <div className="max-w-4xl mx-auto pb-32 pt-4 px-4 sm:px-6 relative">
            
            <div className="sticky top-16 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl pt-4 pb-6 border-b border-transparent">
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight truncate max-w-50 sm:max-w-md">{quiz.title}</h1>
                        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Питання {answeredCount} з {totalQuestions}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">{progressPercentage}%</span>
                    </div>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-200/50 dark:border-zinc-700">
                    <div className="bg-linear-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            <div className="mt-8 mb-12">
                <p className="text-zinc-600 dark:text-zinc-400 font-medium text-lg leading-relaxed">{quiz.description}</p>
            </div>

            <div className="space-y-10 sm:space-y-16">
                {quiz.questions.map((q, index) => (
                    <div key={q.id} className="relative bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-4xl border border-zinc-200/50 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none transition-colors">
                        
                        <div className="absolute -top-4 -left-2 sm:-left-6 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/30 dark:shadow-none transform -rotate-6">
                            {index + 1}
                        </div>

                        <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white leading-snug mb-8 mt-2 pl-4 sm:pl-6">
                            {q.question_text}
                        </h3>

                        <div className="space-y-3">
                            {q.options.map(opt => {
                                const isSelected = answers[q.id] === opt.id;
                                return (
                                    <div 
                                        key={opt.id} 
                                        onClick={() => handleOptionSelect(q.id, opt.id)}
                                        className={`group flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-500/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-blue-600 dark:border-blue-400' : 'border-zinc-300 dark:border-zinc-600 group-hover:border-blue-400'}`}>
                                            <div className={`w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400 transition-transform duration-200 ${isSelected ? 'scale-100' : 'scale-0'}`}></div>
                                        </div>
                                        
                                        <span className={`text-base sm:text-lg font-medium ${isSelected ? 'text-blue-900 dark:text-blue-300 font-bold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                            {opt.answer_text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-linear-to-t from-white via-white/90 to-transparent dark:from-zinc-900 dark:via-zinc-900/90 pointer-events-none flex justify-center z-40">
                <button 
                    onClick={handleAttemptSubmit} 
                    disabled={isSubmitting || progressPercentage < 100} 
                    className="pointer-events-auto px-10 py-4 sm:py-5 bg-blue-600 text-white text-base sm:text-lg font-black tracking-wide rounded-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-xl shadow-blue-600/30 dark:shadow-none disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-3"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ПЕРЕВІРЯЄМО...
                        </>
                    ) : progressPercentage < 100 ? (
                        `ДАЙТЕ ВІДПОВІДЬ НА ВСІ (${totalQuestions - answeredCount} ЗАЛИШИЛОСЬ)`
                    ) : (
                        <>
                            ЗАВЕРШИТИ ТЕСТ
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        </>
                    )}
                </button>
            </div>

            <ConfirmModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)} 
                onConfirm={confirmSubmit}
                title="Завершення тесту"
                message="Ви впевнені, що хочете відправити відповіді? Перевірте, чи все правильно, оскільки після підтвердження змінити їх буде неможливо."
            />
        </div>
    );
}

export default TakeQuiz;