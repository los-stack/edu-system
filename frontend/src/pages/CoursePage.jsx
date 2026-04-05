import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CreateAssignmentModal from '../components/CreateAssignmentModal'; 
import CommentSection from '../components/CommentSection';             
import CreateQuizModal from '../components/CreateQuizModal';
import QuizResultsModal from '../components/QuizResultsModal';

function CoursePage() {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [comments, setComments] = useState([]);
    const [quizzes, setQuizzes] = useState([]); 
    const [myQuizResults, setMyQuizResults] = useState([]); 
    const [error, setError] = useState('');

    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [selectedQuizForResults, setSelectedQuizForResults] = useState(null);
    const [openComments, setOpenComments] = useState([]);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const profileRes = await axios.get('/api/users/profile');
                const currentUser = profileRes.data;
                setUser(currentUser);

                const courseRes = await axios.get(`/api/courses/${id}`);
                setCourse(courseRes.data);

                const assignmentsRes = await axios.get(`/api/courses/${id}/assignments`);
                setAssignments(assignmentsRes.data);

                const subRes = await axios.get(`/api/courses/${id}/submissions`);
                setSubmissions(subRes.data);

                const commentsRes = await axios.get(`/api/courses/${id}/comments`);
                setComments(commentsRes.data);

                const quizzesRes = await axios.get(`/api/quizzes/course/${id}`);
                setQuizzes(quizzesRes.data);

                if (currentUser.role === 'student') {
                    const myResultsRes = await axios.get(`/api/quizzes/my-results/${id}`);
                    setMyQuizResults(myResultsRes.data);
                }
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити дані курсу.');
            }
        };
        fetchCourseData();
    }, [id, navigate]);

    const toggleComments = (assignmentId) => {
        setOpenComments(prev => prev.includes(assignmentId) ? prev.filter(aId => aId !== assignmentId) : [...prev, assignmentId]);
    };

    const handleCreateAssignment = async (formData) => {
        try {
            const response = await axios.post(`/api/courses/${id}/assignments`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            setAssignments([...assignments, response.data.assignment]);
            setIsAssignmentModalOpen(false);
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при створенні завдання');
        }
    };

    const handleCreateQuiz = async (quizData) => {
        try {
            await axios.post(`/api/quizzes/course/${id}`, quizData);
            const quizzesRes = await axios.get(`/api/quizzes/course/${id}`);
            setQuizzes(quizzesRes.data);
            setIsQuizModalOpen(false);
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при створенні тесту');
        }
    };

    const handleStudentSubmit = async (e, assignmentId) => {
        e.preventDefault();
        try {
            const fileInput = document.getElementById(`studentFile-${assignmentId}`);
            const file = fileInput.files[0];
            if (!file) return alert('Оберіть файл для завантаження!');

            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.post(`/api/assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Роботу успішно завантажено!');
            setSubmissions(prev => {
                const filtered = prev.filter(s => !(s.assignment_id === assignmentId && s.student_id === user.id));
                return [...filtered, { assignment_id: assignmentId, student_id: user.id, file_url: res.data.submission.file_url, student_name: user.name }];
            });
            fileInput.value = ''; 
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при відправці роботи');
        }
    };

    const handleGradeSubmit = async (e, assignmentId, studentId) => {
        e.preventDefault();
        const scoreVal = e.target.elements.scoreInput.value;
        const feedbackVal = e.target.elements.feedbackInput.value;

        try {
            await axios.post(`/api/assignments/${assignmentId}/grade`, {
                student_id: studentId, score: Number(scoreVal), feedback: feedbackVal
            });

            alert('Оцінку успішно виставлено!');
            
            setSubmissions(prev => prev.map(sub => 
                (sub.assignment_id === assignmentId && sub.student_id === studentId) 
                    ? { ...sub, score: Number(scoreVal), feedback: feedbackVal } 
                    : sub
            ));
            
            e.target.reset(); 
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при виставленні оцінки');
        }
    };

    const handleCommentSubmit = async (assignmentId, text) => {
        try {
            const res = await axios.post(`/api/assignments/${assignmentId}/comments`, { text: text });
            setComments([...comments, res.data.comment]);
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при відправці коментаря');
        }
    };

    if (error) return <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-center mt-10 max-w-2xl mx-auto border border-red-200 dark:border-red-800/30">{error}</div>;
    if (!course || !user) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="max-w-4xl mx-auto pb-12 relative">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Назад до панелі
            </Link>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 transition-colors">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">{course.title}</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{course.description}</p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg> Тести курсу
                    </h2>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{quizzes.length}</span>
                </div>
                {user.role === 'teacher' && (
                    <button onClick={() => setIsQuizModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Створити тест
                    </button>
                )}
            </div>

            <div className="space-y-4 mb-12">
                {quizzes.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">Тестів поки немає.</p>
                    </div>
                ) : quizzes.map(quiz => {
                    const myResult = myQuizResults.find(r => r.quiz_id === quiz.id);
                    return (
                        <div key={quiz.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{quiz.description}</p>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg> Тест
                                    </span>
                                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                        Створено: {new Date(quiz.created_at).toLocaleDateString('uk-UA')}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                {user.role === 'student' ? (
                                    myResult ? (
                                        <span className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold rounded-lg border border-green-200 dark:border-green-800/30 w-full sm:w-auto">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            Оцінка: {myResult.score} / 100
                                        </span>
                                    ) : (
                                        <Link to={`/quiz/${quiz.id}`} className="block text-center px-6 py-2.5 bg-gray-900 dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto">
                                            Пройти тест
                                        </Link>
                                    )
                                ) : (
                                    <button onClick={() => setSelectedQuizForResults(quiz)} className="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm whitespace-nowrap">
                                        Результати
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Завдання курсу</h2>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{assignments.length}</span>
                </div>
                {user.role === 'teacher' && (
                    <button onClick={() => setIsAssignmentModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-white transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Додати завдання
                    </button>
                )}
            </div>

            <div className="space-y-8">
                {assignments.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">Завдань ще немає.</p>
                    </div>
                ) : assignments.map((assignment) => {
                    const assignmentSubmissions = submissions.filter(s => s.assignment_id === assignment.id);
                    const mySub = assignmentSubmissions.find(s => s.student_id === user.id);
                    const assignmentComments = comments.filter(c => c.assignment_id === assignment.id);
                    const isCommentsOpen = openComments.includes(assignment.id);

                    return (
                        <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 sm:p-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{assignment.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed">{assignment.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-4 mb-2">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 text-amber-800 dark:text-amber-400 text-sm font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        Дедлайн: {new Date(assignment.due_date).toLocaleDateString('uk-UA')}
                                    </div>
                                    {assignment.file_url && (
                                        <a href={`${import.meta.env.VITE_API_URL}${assignment.file_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                            Матеріали викладача
                                        </a>
                                    )}
                                </div>
                            </div>

                            {user.role === 'student' && (
                                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-5 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Моя відповідь</h4>
                                    {mySub ? (
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-800/30">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Здано
                                            </span>
                                            <a href={`${import.meta.env.VITE_API_URL}${mySub.file_url}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Переглянути файл</a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-600 dark:text-red-400 mb-4 font-medium flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Робота ще не здана
                                        </p>
                                    )}
                                    <form onSubmit={(e) => handleStudentSubmit(e, assignment.id)} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                        <input type="file" id={`studentFile-${assignment.id}`} required className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:text-sm file:font-semibold file:bg-white dark:file:bg-gray-800 file:border file:border-gray-300 dark:file:border-gray-600 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-50 dark:hover:file:bg-gray-700 cursor-pointer" />
                                        <button type="submit" className="whitespace-nowrap px-5 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-white transition-colors shadow-sm">
                                            {mySub ? 'Перездати' : 'Відправити'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {user.role === 'teacher' && (
                                <div className="bg-white dark:bg-gray-800 px-6 py-6 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-5">
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Роботи на перевірку
                                        </h4>
                                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 py-1 px-3 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800/30">{assignmentSubmissions.length} здано</span>
                                    </div>

                                    {assignmentSubmissions.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Поки ніхто не здав роботу.</p>
                                        </div>
                                    ) : (
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {assignmentSubmissions.map(sub => (
                                                    <li key={sub.student_id} className="p-4 sm:p-5 flex flex-col xl:flex-row gap-4 xl:items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm border border-blue-200 dark:border-blue-800/30">
                                                                {sub.student_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{sub.student_name}</p>
                                                                <a href={`${import.meta.env.VITE_API_URL}${sub.file_url}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Завантажити рішення
                                                                </a>
                                                            </div>
                                                        </div>
                                                        
                                                        {sub.score !== undefined && sub.score !== null ? (
                                                            <div className="flex items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0 bg-green-50 dark:bg-green-900/20 px-4 py-2.5 rounded-lg border border-green-100 dark:border-green-800/30 shadow-sm">
                                                                <svg className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                                <span className="text-sm font-bold text-green-800 dark:text-green-300">Оцінено: {sub.score} / 100</span>
                                                                {sub.feedback && <span className="text-sm text-green-600 dark:text-green-400 italic hidden sm:inline border-l border-green-200 dark:border-green-800/50 pl-3 ml-1">«{sub.feedback}»</span>}
                                                            </div>
                                                        ) : (
                                                            <form onSubmit={(e) => handleGradeSubmit(e, assignment.id, sub.student_id)} className="flex items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0">
                                                                <input type="number" name="scoreInput" placeholder="Бал" min="0" max="100" required className="w-20 pl-3 pr-2 py-2 text-sm text-center font-semibold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                                                                <input type="text" name="feedbackInput" placeholder="Коментар..." className="flex-1 xl:w-48 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500" />
                                                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0">Оцінити</button>
                                                            </form>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <CommentSection 
                                assignmentId={assignment.id} 
                                comments={assignmentComments} 
                                currentUser={user} 
                                isOpen={isCommentsOpen} 
                                onToggle={toggleComments} 
                                onCommentSubmit={handleCommentSubmit} 
                            />
                        </div>
                    );
                })}
            </div>

            <CreateAssignmentModal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} onCreate={handleCreateAssignment} />
            <CreateQuizModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} onCreate={handleCreateQuiz} />
            <QuizResultsModal isOpen={!!selectedQuizForResults} onClose={() => setSelectedQuizForResults(null)} quiz={selectedQuizForResults} />
        </div>
    );
}

export default CoursePage;