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
                } else if (currentUser.role === 'teacher') {
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

    if (error) return <div className="p-8 text-center text-red-500 text-sm font-medium">{error}</div>;
    if (!course || !user) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div></div>;

    let progressPercentage = 0;
    if (user.role === 'student') {
        const total = assignments.length + quizzes.length;
        const completed = assignments.filter(a => submissionsMap[a.id]?.some(s => s.student_id === user.id)).length + myQuizResults.length;
        progressPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    }

    return (
        <div className="max-w-7xl mx-auto pb-16">
            
            {/* Header */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 mb-8 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="max-w-2xl">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 mb-4 hover:gap-3 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Назад до панелі
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">{course.title}</h1>
                        <div className="prose dark:prose-invert text-zinc-500 dark:text-zinc-400 max-w-none line-clamp-2 text-sm" dangerouslySetInnerHTML={{ __html: course.description }}></div>
                    </div>

                    {user.role === 'student' && (
                        <div className="w-full md:w-56 bg-zinc-50 dark:bg-zinc-800 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-medium text-zinc-500">Прогрес</span>
                                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl mb-8 w-fit">
                <button 
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                    Навчання
                </button>
                {user.role === 'teacher' && (
                    <button 
                        onClick={() => setActiveTab('submissions')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'submissions' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                        Перевірка
                        {analytics?.pendingReviews > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{analytics.pendingReviews}</span>}
                    </button>
                )}
                <button 
                    onClick={() => setActiveTab('students')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                    Учасники {courseStudents.length > 0 && <span className="opacity-60 ml-1">({courseStudents.length})</span>}
                </button>
            </div>

            <div className="space-y-10">
                {activeTab === 'content' && (
                    <div className="grid grid-cols-1 gap-10">
                        {/* Quizzes Section */}
                        <section>
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Тести</h2>
                                {user.role === 'teacher' && (
                                    <button onClick={() => setIsQuizModalOpen(true)} className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    </button>
                                )}
                            </div>
                            {quizzes.length === 0 ? (
                                <p className="text-zinc-500 text-sm">Тестів поки немає.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {quizzes.map(quiz => {
                                        const myResult = myQuizResultsMap[quiz.id];
                                        return (
                                            <div key={quiz.id} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex justify-between items-center group hover:border-primary-300 dark:hover:border-primary-800 transition-all">
                                                <div>
                                                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{quiz.title}</h3>
                                                    <p className="text-xs text-zinc-500">{new Date(quiz.created_at).toLocaleDateString()}</p>
                                                </div>
                                                {user.role === 'student' ? (
                                                    myResult ? (
                                                        <div className="text-right">
                                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">{myResult.score}%</span>
                                                            <p className="text-[10px] font-medium text-zinc-400">ПРОЙДЕНО</p>
                                                        </div>
                                                    ) : (
                                                        <Link to={`/quiz/${quiz.id}`} className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium rounded-lg hover:opacity-90 transition-all">Пройти</Link>
                                                    )
                                                ) : (
                                                    <button onClick={() => setSelectedQuizForResults(quiz)} className="p-2 text-zinc-400 hover:text-primary-500 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Assignments Section */}
                        <section>
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Завдання та лекції</h2>
                                {user.role === 'teacher' && (
                                    <button onClick={() => setIsAssignmentModalOpen(true)} className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    </button>
                                )}
                            </div>
                            {assignments.length === 0 ? (
                                <p className="text-zinc-500 text-sm">Завдань поки немає.</p>
                            ) : (
                                <div className="space-y-5">
                                    {assignments.map(assignment => {
                                        const mySub = submissionsMap[assignment.id]?.find(s => s.student_id === user.id);
                                        return (
                                            <div key={assignment.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{assignment.title}</h3>
                                                        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-lg">
                                                            До {new Date(assignment.due_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="prose dark:prose-invert max-w-none text-zinc-500 dark:text-zinc-400 mb-6 text-sm" dangerouslySetInnerHTML={{ __html: assignment.description }}></div>
                                                    
                                                    {user.role === 'student' && (
                                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mySub ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-700'}`}>
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{mySub ? 'Роботу здано' : 'Роботу не здано'}</p>
                                                                        {mySub?.score !== null && mySub?.score !== undefined && <p className="text-xs font-medium text-green-600">Оцінка: {mySub.score}/100</p>}
                                                                    </div>
                                                                </div>
                                                                <form onSubmit={(e) => handleStudentSubmit(e, assignment.id)} className="flex gap-2 w-full sm:w-auto">
                                                                    <input type="file" id={`studentFile-${assignment.id}`} className="hidden" onChange={(e) => {if(e.target.files[0]) toast.success(`Файл обрано: ${e.target.files[0].name}`)}} />
                                                                    <label htmlFor={`studentFile-${assignment.id}`} className="cursor-pointer px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-all">Обрати файл</label>
                                                                    <button type="submit" className="px-3 py-2 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-all">Відправити</button>
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
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'submissions' && user.role === 'teacher' && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Роботи студентів</h2>
                        {submissions.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 text-sm">Зданих робіт поки немає.</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {submissions.map(sub => (
                                    <div key={`${sub.assignment_id}-${sub.student_id}`} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">{sub.student_name.charAt(0)}</div>
                                            <div>
                                                <h4 className="font-medium text-zinc-900 dark:text-white">{sub.student_name}</h4>
                                                <a href={`${import.meta.env.VITE_API_URL}${sub.file_url}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors">Завантажити файл</a>
                                            </div>
                                        </div>
                                        {sub.score !== null ? (
                                            <div className="px-4 py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 font-medium text-sm">Оцінено: {sub.score}/100</div>
                                        ) : (
                                            <form onSubmit={(e) => handleGradeSubmit(e, sub.assignment_id, sub.student_id)} className="flex items-center gap-2 w-full lg:w-auto">
                                                <input type="number" name="scoreInput" placeholder="Бал" className="w-20 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                                                <input type="text" name="feedbackInput" placeholder="Відгук..." className="flex-1 lg:w-48 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                                <button type="submit" className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium rounded-lg hover:opacity-90 transition-all">Оцінити</button>
                                            </form>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Студенти курсу</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {courseStudents.length > 0 ? (
                                courseStudents.map(s => (
                                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                        <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center font-medium text-primary-600 dark:text-primary-400">
                                            {s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="block font-medium text-zinc-900 dark:text-zinc-200 text-sm">{s.name}</span>
                                            {user.role === 'teacher' && <span className="text-xs text-zinc-500">{s.email}</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-zinc-500 text-sm">Ще ніхто не записався на цей курс.</p>
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
