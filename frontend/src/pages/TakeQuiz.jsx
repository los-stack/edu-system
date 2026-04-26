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

    if (error) return <div className="p-8 text-center text-red-500 text-sm font-medium mt-10">{error}</div>;
    if (!quiz) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div></div>;

    if (resultScore !== null) {
        const isSuccess = resultScore >= 60;
        const colorTheme = resultScore >= 80 ? 'green' : resultScore >= 60 ? 'amber' : 'red';
        
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 sm:p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden">
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${colorTheme === 'green' ? 'bg-green-500' : colorTheme === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                    
                    <div className="relative z-10">
                        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${colorTheme === 'green' ? 'bg-green-100 text-green-500 dark:bg-green-900/50' : colorTheme === 'amber' ? 'bg-amber-100 text-amber-500 dark:bg-amber-900/50' : 'bg-red-100 text-red-500 dark:bg-red-900/50'}`}>
                            {isSuccess ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            )}
                        </div>
                        
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                            {resultScore >= 80 ? 'Блискучий результат!' : resultScore >= 60 ? 'Тест пройдено!' : 'Спробуйте ще раз'}
                        </h1>
                        <p className="text-zinc-500 text-sm mb-6">Ваш результат автоматично збережено в системі.</p>
                        
                        <div className={`inline-flex items-baseline gap-1 mb-8 ${colorTheme === 'green' ? 'text-green-600 dark:text-green-400' : colorTheme === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                            <span className="text-5xl font-bold tracking-tight">{resultScore}</span>
                            <span className="text-xl font-semibold opacity-50">/ 100</span>
                        </div>
                        
                        <button onClick={() => navigate(`/course/${quiz.course_id}`)} className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium text-sm rounded-xl hover:opacity-90 transition-colors">
                            Повернутися до курсу
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
        <div className="max-w-3xl mx-auto pb-28 pt-4 px-4 relative">
            
            {/* Progress Header */}
            <div className="sticky top-16 z-30 bg-zinc-50/95 dark:bg-[#0a0a0b]/95 backdrop-blur-xl pt-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">{quiz.title}</h1>
                        <p className="text-sm text-zinc-500">Питання {answeredCount} з {totalQuestions}</p>
                    </div>
                    <span className="text-base font-semibold text-primary-600 dark:text-primary-400">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            {quiz.description && (
                <div className="mt-6 mb-8">
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{quiz.description}</p>
                </div>
            )}

            <div className="space-y-8">
                {quiz.questions.map((q, index) => (
                    <div key={q.id} className="relative bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
                        
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center font-semibold text-sm shrink-0">
                                {index + 1}
                            </div>
                            <h3 className="text-base font-medium text-zinc-900 dark:text-white leading-relaxed">
                                {q.question_text}
                            </h3>
                        </div>

                        <div className="space-y-2.5 pl-12">
                            {q.options.map(opt => {
                                const isSelected = answers[q.id] === opt.id;
                                return (
                                    <div 
                                        key={opt.id} 
                                        onClick={() => handleOptionSelect(q.id, opt.id)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-primary-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                            <div className={`w-2.5 h-2.5 rounded-full bg-primary-500 transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`}></div>
                                        </div>
                                        
                                        <span className={`text-sm ${isSelected ? 'text-primary-900 dark:text-primary-300 font-medium' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                            {opt.answer_text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent dark:from-[#0a0a0b] dark:via-[#0a0a0b]/95 pointer-events-none flex justify-center z-40">
                <button 
                    onClick={handleAttemptSubmit} 
                    disabled={isSubmitting || progressPercentage < 100} 
                    className="pointer-events-auto px-8 py-3 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Перевіряємо...
                        </>
                    ) : progressPercentage < 100 ? (
                        `Відповісти на всі (${totalQuestions - answeredCount} залишилось)`
                    ) : (
                        <>
                            Завершити тест
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
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
