import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function TakeQuiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultScore, setResultScore] = useState(null);

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

    const handleSubmit = async () => {
        if (Object.keys(answers).length < quiz.questions.length) {
            return alert("Будь ласка, дайте відповідь на всі запитання перед завершенням!");
        }

        if (!window.confirm("Ви впевнені, що хочете завершити тест?")) return;

        setIsSubmitting(true);
        try {
            const res = await axios.post(`/api/quizzes/${quizId}/submit`, { answers });
            setResultScore(res.data.score);
        } catch (err) {
            alert(err.response?.data?.error || 'Помилка при здачі тесту');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) return <div className="p-8 text-center text-red-600 dark:text-red-400 font-bold mt-10">{error}</div>;
    if (!quiz) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    if (resultScore !== null) {
        return (
            <div className="max-w-2xl mx-auto mt-20 bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center transition-colors">
                <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Тест завершено!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Ваш результат автоматично збережено в системі.</p>
                <div className="text-6xl font-black text-blue-600 dark:text-blue-400 mb-8">{resultScore} <span className="text-2xl text-gray-400 dark:text-gray-500">/ 100</span></div>
                <button onClick={() => navigate(`/course/${quiz.course_id}`)} className="px-8 py-3 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors">Повернутися до курсу</button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-20 pt-10 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">{quiz.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
            </div>

            <div className="space-y-8">
                {quiz.questions.map((q, index) => (
                    <div key={q.id} className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
                            <span className="text-blue-600 dark:text-blue-400 mr-2">{index + 1}.</span> 
                            {q.question_text}
                        </h3>
                        <div className="space-y-3 pl-2 sm:pl-6">
                            {q.options.map(opt => (
                                <label key={opt.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${answers[q.id] === opt.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500/50' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                    <input type="radio" name={`question-${q.id}`} value={opt.id} checked={answers[q.id] === opt.id} onChange={() => handleOptionSelect(q.id, opt.id)} className="w-5 h-5 text-blue-600 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-offset-gray-900" />
                                    <span className={`text-sm sm:text-base ${answers[q.id] === opt.id ? 'font-medium text-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{opt.answer_text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex justify-end">
                <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? 'Перевіряємо...' : 'Завершити тест'}
                    {!isSubmitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                </button>
            </div>
        </div>
    );
}

export default TakeQuiz;