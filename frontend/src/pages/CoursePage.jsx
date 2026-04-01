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
                const token = localStorage.getItem('token');
                if (!token) return navigate('/');

                const profileRes = await axios.get('http://localhost:5000/api/users/profile', { headers: { Authorization: `Bearer ${token}` } });
                const currentUser = profileRes.data;
                setUser(currentUser);

                const courseRes = await axios.get(`http://localhost:5000/api/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setCourse(courseRes.data);

                const assignmentsRes = await axios.get(`http://localhost:5000/api/courses/${id}/assignments`, { headers: { Authorization: `Bearer ${token}` } });
                setAssignments(assignmentsRes.data);

                const subRes = await axios.get(`http://localhost:5000/api/courses/${id}/submissions`, { headers: { Authorization: `Bearer ${token}` } });
                setSubmissions(subRes.data);

                const commentsRes = await axios.get(`http://localhost:5000/api/courses/${id}/comments`, { headers: { Authorization: `Bearer ${token}` } });
                setComments(commentsRes.data);

                const quizzesRes = await axios.get(`http://localhost:5000/api/quizzes/course/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setQuizzes(quizzesRes.data);

                if (currentUser.role === 'student') {
                    const myResultsRes = await axios.get(`http://localhost:5000/api/quizzes/my-results/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
        setOpenComments(prev => prev.includes(assignmentId) ? prev.filter(id => id !== assignmentId) : [...prev, assignmentId]);
    };

    const handleCreateAssignment = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:5000/api/courses/${id}/assignments`, formData, { 
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
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
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/quizzes/course/${id}`, quizData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const quizzesRes = await axios.get(`http://localhost:5000/api/quizzes/course/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
            const token = localStorage.getItem('token');
            const fileInput = document.getElementById(`studentFile-${assignmentId}`);
            const file = fileInput.files[0];
            
            if (!file) return alert('Оберіть файл для завантаження!');

            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.post(`http://localhost:5000/api/assignments/${assignmentId}/submit`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
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
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/assignments/${assignmentId}/grade`, {
                student_id: studentId, score: Number(scoreVal), feedback: feedbackVal
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert('Оцінку успішно виставлено!');
            e.target.reset(); 
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при виставленні оцінки');
        }
    };

    const handleCommentSubmit = async (assignmentId, text) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/assignments/${assignmentId}/comments`, 
                { text: text }, { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments([...comments, res.data.comment]);
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при відправці коментаря');
        }
    };

    if (error) return <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center mt-10 max-w-2xl mx-auto">{error}</div>;
    if (!course || !user) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="max-w-4xl mx-auto pb-12 relative">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Назад до панелі
            </Link>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{course.title}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{course.description}</p>
            </div>

            {/* ================= СЕКЦІЯ ТЕСТІВ ================= */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        Тести курсу
                    </h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{quizzes.length}</span>
                </div>
                
                {user.role === 'teacher' && (
                    <button onClick={() => setIsQuizModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Створити тест
                    </button>
                )}
            </div>

            <div className="space-y-4 mb-12">
                {quizzes.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Тестів поки немає.</p>
                    </div>
                ) : quizzes.map(quiz => {
                    const myResult = myQuizResults.find(r => r.quiz_id === quiz.id);

                    return (
                        <div key={quiz.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                                <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                        Тест
                                    </span>
                                    <span className="text-xs font-medium text-gray-400">
                                        Створено: {new Date(quiz.created_at).toLocaleDateString('uk-UA')}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                {user.role === 'student' ? (
                                    myResult ? (
                                        <span className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200 w-full sm:w-auto">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            Оцінка: {myResult.score} / 100
                                        </span>
                                    ) : (
                                        <Link to={`/quiz/${quiz.id}`} className="block text-center px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto">
                                            Пройти тест
                                        </Link>
                                    )
                                ) : (
                                    <button onClick={() => setSelectedQuizForResults(quiz)} className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
                                        Результати
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">Завдання курсу</h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{assignments.length}</span>
                </div>
                
                {user.role === 'teacher' && (
                    <button onClick={() => setIsAssignmentModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Додати завдання
                    </button>
                )}
            </div>

            <div className="space-y-8">
                {assignments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Завдань ще немає.</p>
                    </div>
                ) : assignments.map((assignment) => {
                    const assignmentSubmissions = submissions.filter(s => s.assignment_id === assignment.id);
                    const mySub = assignmentSubmissions.find(s => s.student_id === user.id);
                    const assignmentComments = comments.filter(c => c.assignment_id === assignment.id);
                    const isCommentsOpen = openComments.includes(assignment.id);

                    return (
                        <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 sm:p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{assignment.title}</h3>
                                <p className="text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">{assignment.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-4 mb-2">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-sm font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        Дедлайн: {new Date(assignment.due_date).toLocaleDateString('uk-UA')}
                                    </div>
                                    {assignment.file_url && (
                                        <a href={`http://localhost:5000${assignment.file_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 hover:text-blue-600 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                            Матеріали викладача
                                        </a>
                                    )}
                                </div>
                            </div>

                            {user.role === 'student' && (
                                <div className="bg-gray-50 px-6 py-5 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Моя відповідь</h4>
                                    {mySub ? (
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Здано
                                            </span>
                                            <a href={`http://localhost:5000${mySub.file_url}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">Переглянути файл</a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-600 mb-4 font-medium flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Робота ще не здана
                                        </p>
                                    )}
                                    <form onSubmit={(e) => handleStudentSubmit(e, assignment.id)} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                        <input type="file" id={`studentFile-${assignment.id}`} required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:border file:border-gray-300 file:text-gray-700 hover:file:bg-gray-50 cursor-pointer" />
                                        <button type="submit" className="whitespace-nowrap px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                                            {mySub ? 'Перездати' : 'Відправити'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {user.role === 'teacher' && (
                                <div className="bg-white px-6 py-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Роботи на перевірку
                                        </h4>
                                        <span className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-xs font-bold border border-blue-100">{assignmentSubmissions.length} здано</span>
                                    </div>

                                    {assignmentSubmissions.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-sm text-gray-500">Поки ніхто не здав роботу.</p>
                                        </div>
                                    ) : (
                                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                            <ul className="divide-y divide-gray-100">
                                                {assignmentSubmissions.map(sub => (
                                                    <li key={sub.student_id} className="p-4 sm:p-5 flex flex-col xl:flex-row gap-4 xl:items-center justify-between hover:bg-gray-50/50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 shrink-0 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">
                                                                {sub.student_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{sub.student_name}</p>
                                                                <a href={`http://localhost:5000${sub.file_url}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Завантажити рішення
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <form onSubmit={(e) => handleGradeSubmit(e, assignment.id, sub.student_id)} className="flex items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0">
                                                            <input type="number" name="scoreInput" placeholder="Бал" min="0" max="100" required className="w-20 pl-3 pr-2 py-2 text-sm text-center font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                                                            <input type="text" name="feedbackInput" placeholder="Коментар..." className="flex-1 xl:w-48 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                                                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0">Оцінити</button>
                                                        </form>
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