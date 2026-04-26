import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
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
    const [courseStudents, setCourseStudents] = useState([]); 
    const [analytics, setAnalytics] = useState(null); 
    const [error, setError] = useState('');

    const [activeTab, setActiveTab] = useState('content');
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

                const [courseRes, assignmentsRes, subRes, commentsRes, quizzesRes, studentsRes] = await Promise.all([
                    axios.get(`/api/courses/${id}`),
                    axios.get(`/api/courses/${id}/assignments`),
                    axios.get(`/api/courses/${id}/submissions`),
                    axios.get(`/api/courses/${id}/comments`),
                    axios.get(`/api/quizzes/course/${id}`),
                    axios.get(`/api/courses/${id}/students`) 
                ]);

                setCourse(courseRes.data);
                setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
                setSubmissions(Array.isArray(subRes.data) ? subRes.data : []);
                setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
                setQuizzes(Array.isArray(quizzesRes.data) ? quizzesRes.data : []);
                setCourseStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);

                if (currentUser.role === 'student') {
                    const myResultsRes = await axios.get(`/api/quizzes/my-results/${id}`);
                    setMyQuizResults(Array.isArray(myResultsRes.data) ? myResultsRes.data : []);
                } else if (currentUser.role === 'teacher' || currentUser.role === 'admin') {
                    const analyticsRes = await axios.get(`/api/courses/${id}/analytics`);
                    setAnalytics(analyticsRes.data);
                }

            } catch (fetchError) {
                console.error('Помилка завантаження курсу:', fetchError);
                setError('Не вдалося завантажити дані курсу. Можливо, ви не авторизовані.');
            }
        };
        fetchCourseData();
    }, [id, navigate]);

    const submissionsMap = useMemo(() => {
        const map = {};
        submissions.forEach(s => {
            if (!map[s.assignment_id]) map[s.assignment_id] = [];
            map[s.assignment_id].push(s);
        });
        return map;
    }, [submissions]);

    const commentsMap = useMemo(() => {
        const map = {};
        comments.forEach(c => {
            if (!map[c.assignment_id]) map[c.assignment_id] = [];
            map[c.assignment_id].push(c);
        });
        return map;
    }, [comments]);

    const myQuizResultsMap = useMemo(() => {
        const map = {};
        myQuizResults.forEach(r => { map[r.quiz_id] = r; });
        return map;
    }, [myQuizResults]);

    const toggleComments = (assignmentId) => {
        setOpenComments(prev => prev.includes(assignmentId) ? prev.filter(aId => aId !== assignmentId) : [...prev, assignmentId]);
    };

    const handleCreateAssignment = async (formData) => {
        try {
            await axios.post(`/api/courses/${id}/assignments`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            const assignmentsRes = await axios.get(`/api/courses/${id}/assignments`);
            setAssignments(assignmentsRes.data);
            setIsAssignmentModalOpen(false);
            toast.success('Завдання додано!');
        } catch (createErr) {
            console.error(createErr);
            toast.error('Помилка при створенні завдання');
        }
    };

    const handleCreateQuiz = async (quizData) => {
        try {
            await axios.post(`/api/quizzes/course/${id}`, quizData);
            const quizzesRes = await axios.get(`/api/quizzes/course/${id}`);
            setQuizzes(quizzesRes.data);
            setIsQuizModalOpen(false);
            toast.success('Тест створено!');
        } catch (quizErr) {
            console.error(quizErr);
            toast.error('Помилка при створенні тесту');
        }
    };

    const handleStudentSubmit = async (e, assignmentId) => {
        e.preventDefault();
        try {
            const fileInput = document.getElementById(`studentFile-${assignmentId}`);
            const file = fileInput.files[0];
            if (!file) return toast.error('Оберіть файл!');

            const formData = new FormData();
            formData.append('file', file);

            await axios.post(`/api/assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Роботу успішно завантажено!');
            const subRes = await axios.get(`/api/courses/${id}/submissions`);
            setSubmissions(subRes.data);
            fileInput.value = ''; 
        } catch (submitErr) {
            console.error(submitErr);
            toast.error('Помилка при відправці роботи');
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
            toast.success('Оцінку виставлено!');
            const subRes = await axios.get(`/api/courses/${id}/submissions`);
            setSubmissions(subRes.data);
            e.target.reset(); 
        } catch (gradeErr) {
            console.error(gradeErr);
            toast.error('Помилка при виставленні оцінки');
        }
    };

    const handleCommentSubmit = async (assignmentId, text) => {
        try {
            const commentRes = await axios.post(`/api/assignments/${assignmentId}/comments`, { text: text });
            setComments([...comments, commentRes.data.comment]);
        } catch (commentErr) {
            console.error(commentErr);
            toast.error('Помилка відправки коментаря');
        }
    };

    if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
    if (!course || !user) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

    let progressPercentage = 0;
    if (user.role === 'student') {
        const total = assignments.length + quizzes.length;
        const completed = assignments.filter(a => submissionsMap[a.id]?.some(s => s.student_id === user.id)).length + myQuizResults.length;
        progressPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8 mt-4">
            
            <div className="relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 sm:p-12 mb-10 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none overflow-hidden">
                <div className="absolute top-0 right-0 w-150 h-150 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="max-w-2xl">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 mb-6 hover:gap-3 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            НАЗАД ДО ПАНЕЛІ
                        </Link>
                        <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">{course.title}</h1>
                        <div className="prose prose-lg dark:prose-invert text-zinc-500 dark:text-zinc-400 max-w-none line-clamp-2" dangerouslySetInnerHTML={{ __html: course.description }}></div>
                    </div>

                    {user.role === 'student' && (
                        <div className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-800/40 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-700/50 backdrop-blur-sm">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Прогрес</span>
                                <span className="text-xl font-black text-blue-600 dark:text-blue-400">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1 p-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-inner dark:shadow-none rounded-2xl mb-10 w-fit mx-auto sm:mx-0">
                <button 
                    onClick={() => setActiveTab('content')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    Навчання
                </button>
                {(user.role === 'teacher' || user.role === 'admin') && (
                    <button 
                        onClick={() => setActiveTab('submissions')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'submissions' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Перевірка робіт
                        {analytics?.pendingReviews > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{analytics.pendingReviews}</span>}
                    </button>
                )}
                <button 
                    onClick={() => setActiveTab('students')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    Учасники {courseStudents.length > 0 && <span className="opacity-60 ml-1">({courseStudents.length})</span>}
                </button>
            </div>

            <div className="space-y-12">
                {activeTab === 'content' && (
                    <div className="grid grid-cols-1 gap-12">
                        <section>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Тести</h2>
                                {(user.role === 'teacher' || user.role === 'admin') && (
                                    <button onClick={() => setIsQuizModalOpen(true)} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quizzes.map(quiz => {
                                    const myResult = myQuizResultsMap[quiz.id];
                                    return (
                                        <div key={quiz.id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-zinc-200/60 transition-all rounded-3xl flex justify-between items-center group">
                                            <div>
                                                <h3 className="font-bold text-zinc-900 dark:text-white mb-1">{quiz.title}</h3>
                                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Тест • {new Date(quiz.created_at).toLocaleDateString()}</p>
                                            </div>
                                            {user.role === 'student' ? (
                                                myResult ? (
                                                    <div className="text-right">
                                                        <span className="text-lg font-black text-green-600 dark:text-green-400">{myResult.score}%</span>
                                                        <p className="text-[10px] font-bold text-zinc-400">ПРОЙДЕНО</p>
                                                    </div>
                                                ) : (
                                                    <Link to={`/quiz/${quiz.id}`} className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black rounded-xl hover:scale-105 transition-all shadow-md">ПРОЙТИ</Link>
                                                )
                                            ) : (
                                                <button onClick={() => setSelectedQuizForResults(quiz)} className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Завдання та лекції</h2>
                                {(user.role === 'teacher' || user.role === 'admin') && (
                                    <button onClick={() => setIsAssignmentModalOpen(true)} className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-80 transition-all shadow-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                                    </button>
                                )}
                            </div>
                            <div className="space-y-6">
                                {assignments.map(assignment => {
                                    const mySub = submissionsMap[assignment.id]?.find(s => s.student_id === user.id);
                                    const isOverdue = new Date(assignment.due_date) < new Date();
                                    return (
                                        <div key={assignment.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-zinc-200/60 transition-all">
                                            <div className="p-8">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{assignment.title}</h3>
                                                    <span className={`px-3 py-1 text-[10px] font-black rounded-lg border uppercase tracking-widest ${isOverdue ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'}`}>
                                                        Дедлайн: {new Date(assignment.due_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="prose dark:prose-invert max-w-none text-zinc-500 dark:text-zinc-400 mb-8" dangerouslySetInnerHTML={{ __html: assignment.description }}></div>
                                                
                                                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                    {assignment.file_url && <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${assignment.file_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Завантажити матеріали</a>}
                                                </div>

                                                {user.role === 'student' && (
                                                    <div className="mt-6 p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-3xl border border-zinc-100 dark:border-zinc-700/50">
                                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mySub ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500'}`}>
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{mySub ? 'Роботу здано' : 'Роботу не здано'}</p>
                                                                    {mySub?.score !== null && mySub?.score !== undefined && <p className="text-xs font-bold text-green-600 dark:text-green-400">Оцінка: {mySub.score}/100</p>}
                                                                </div>
                                                            </div>
                                                            <form onSubmit={(e) => handleStudentSubmit(e, assignment.id)} className="flex gap-2 w-full sm:w-auto">
                                                                <input type="file" id={`studentFile-${assignment.id}`} className="hidden" onChange={(e) => {if(e.target.files[0]) toast.success(`Файл обрано: ${e.target.files[0].name}`)}} />
                                                                <label htmlFor={`studentFile-${assignment.id}`} className="cursor-pointer px-4 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-xs font-bold rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-all text-zinc-700 dark:text-zinc-300">ОБРАТИ ФАЙЛ</label>
                                                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all">ВІДПРАВИТИ</button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <CommentSection assignmentId={assignment.id} comments={commentsMap[assignment.id] || []} currentUser={user} isOpen={openComments.includes(assignment.id)} onToggle={toggleComments} onCommentSubmit={handleCommentSubmit} />
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'submissions' && (user.role === 'teacher' || user.role === 'admin') && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Роботи студентів</h2>
                        {submissions.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium shadow-xl shadow-zinc-200/40 dark:shadow-none">Зданих робіт поки немає.</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {submissions.map(sub => (
                                    <div key={`${sub.assignment_id}-${sub.student_id}`} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-xl shadow-zinc-200/40 dark:shadow-none">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">{sub.student_name.charAt(0)}</div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900 dark:text-white">{sub.student_name}</h4>
                                                <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${sub.file_url}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">ЗАВАНТАЖИТИ ФАЙЛ</a>
                                            </div>
                                        </div>
                                        {sub.score !== null ? (
                                            <div className="px-6 py-2 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-2xl text-green-600 dark:text-green-400 font-black text-sm">ОЦІНЕНО: {sub.score}/100</div>
                                        ) : (
                                            <form onSubmit={(e) => handleGradeSubmit(e, sub.assignment_id, sub.student_id)} className="flex items-center gap-2 w-full lg:w-auto">
                                                <input type="number" name="scoreInput" placeholder="Бал" min="0" max="100" className="w-20 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                                <input type="text" name="feedbackInput" placeholder="Відгук..." className="flex-1 lg:w-64 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                <button type="submit" className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black rounded-xl hover:opacity-80 transition-all shadow-sm">ОЦІНИТИ</button>
                                            </form>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/40 dark:shadow-none">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-8">Студенти курсу</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courseStudents.length > 0 ? (
                                courseStudents.map(s => (
                                    <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700/50">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                                            {s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="block font-bold text-zinc-900 dark:text-zinc-200">{s.name}</span>
                                            {(user.role === 'teacher' || user.role === 'admin') && <span className="text-xs text-zinc-500">{s.email}</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-zinc-500 text-sm font-medium">Ще ніхто не записався на цей курс.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isAssignmentModalOpen && <CreateAssignmentModal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} onCreate={handleCreateAssignment} />}
            {isQuizModalOpen && <CreateQuizModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} onCreate={handleCreateQuiz} />}
            {selectedQuizForResults && <QuizResultsModal isOpen={!!selectedQuizForResults} onClose={() => setSelectedQuizForResults(null)} quiz={selectedQuizForResults} />}
        </div>
    );
}

export default CoursePage;