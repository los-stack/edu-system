import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function CoursePage() {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState('');

    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [newFile, setNewFile] = useState(null); 

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/');

                const profileRes = await axios.get('http://localhost:5000/api/users/profile', { headers: { Authorization: `Bearer ${token}` } });
                setUser(profileRes.data);

                const courseRes = await axios.get(`http://localhost:5000/api/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setCourse(courseRes.data);

                const assignmentsRes = await axios.get(`http://localhost:5000/api/courses/${id}/assignments`, { headers: { Authorization: `Bearer ${token}` } });
                setAssignments(assignmentsRes.data);

                const subRes = await axios.get(`http://localhost:5000/api/courses/${id}/submissions`, { headers: { Authorization: `Bearer ${token}` } });
                setSubmissions(subRes.data);

                const commentsRes = await axios.get(`http://localhost:5000/api/courses/${id}/comments`, { headers: { Authorization: `Bearer ${token}` } });
                setComments(commentsRes.data);

            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити дані курсу.');
            }
        };
        fetchCourseData();
    }, [id, navigate]);

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', newTitle);
            formData.append('description', newDesc);
            formData.append('due_date', newDueDate);
            if (newFile) formData.append('file', newFile);

            const response = await axios.post(`http://localhost:5000/api/courses/${id}/assignments`, formData, { 
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
            });

            alert('Завдання успішно додано!');
            setAssignments([...assignments, response.data.assignment]);
            setNewTitle(''); setNewDesc(''); setNewDueDate(''); setNewFile(null);
            document.getElementById('fileInput').value = ''; 
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при створенні завдання');
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
            if (err.response && err.response.data) alert(err.response.data.error);
            else alert('Помилка при виставленні оцінки');
        }
    };

    const handleCommentSubmit = async (e, assignmentId) => {
        e.preventDefault();
        const textVal = e.target.elements.commentInput.value;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/assignments/${assignmentId}/comments`, 
                { text: textVal }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments([...comments, res.data.comment]);
            e.target.reset(); 
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при відправці коментаря');
        }
    };

    if (error) return <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center mt-10 max-w-2xl mx-auto">{error}</div>;
    if (!course || !user) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-12">
            
            {/* Навігація "Назад" */}
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Назад до панелі
            </Link>
            
            {/* Шапка курсу */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{course.title}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{course.description}</p>
            </div>

            {/* Блок створення завдання для викладача */}
            {user.role === 'teacher' && (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 sm:p-8 mb-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Додати нове завдання</h3>
                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                        <input type="text" placeholder="Назва завдання" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required 
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm" />
                        
                        <textarea placeholder="Детальний опис (умови, вимоги...)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required rows="3"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm resize-none" />
                        
                        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                            <div className="w-full sm:w-auto">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Дедлайн</label>
                                <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} required 
                                    className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700" />
                            </div>
                            <div className="w-full sm:w-auto">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Прикріпити матеріал</label>
                                {/* Магія Tailwind для інпута файлу (file: модифікатори) */}
                                <input type="file" id="fileInput" onChange={(e) => setNewFile(e.target.files[0])} 
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                            </div>
                        </div>
                        <button type="submit" className="mt-2 inline-flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            Опублікувати завдання
                        </button>
                    </form>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Завдання курсу</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{assignments.length} завдань</span>
            </div>

            <div className="space-y-6">
                {assignments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Завдань ще немає.</p>
                    </div>
                ) : assignments.map((assignment) => {
                    
                    const assignmentSubmissions = submissions.filter(s => s.assignment_id === assignment.id);
                    const mySub = assignmentSubmissions.find(s => s.student_id === user.id);
                    const assignmentComments = comments.filter(c => c.assignment_id === assignment.id);

                    return (
                        <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            
                            {/* Тіло завдання */}
                            <div className="p-6 sm:p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{assignment.title}</h3>
                                <p className="text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">{assignment.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-4 mb-2">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-sm font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        Дедлайн: {new Date(assignment.due_date).toLocaleDateString('uk-UA')}
                                    </div>
                                    
                                    {assignment.file_url && (
                                        <a href={`http://localhost:5000${assignment.file_url}`} target="_blank" rel="noreferrer" 
                                           className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 hover:text-blue-600 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                            Матеріали викладача
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Робоча зона (Студент) */}
                            {user.role === 'student' && (
                                <div className="bg-gray-50 px-6 py-5 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Моя відповідь</h4>
                                    
                                    {mySub ? (
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Здано
                                            </span>
                                            <a href={`http://localhost:5000${mySub.file_url}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                                                Переглянути файл
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-600 mb-4 font-medium flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Робота ще не здана
                                        </p>
                                    )}
                                    
                                    <form onSubmit={(e) => handleStudentSubmit(e, assignment.id)} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                        <input type="file" id={`studentFile-${assignment.id}`} required 
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full border-0 file:text-sm file:font-semibold file:bg-white file:border file:border-gray-300 file:text-gray-700 hover:file:bg-gray-50 cursor-pointer" />
                                        <button type="submit" className="whitespace-nowrap px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                                            {mySub ? 'Перездати' : 'Відправити'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Робоча зона (Викладач) */}
                            {user.role === 'teacher' && (
                                <div className="bg-gray-50 px-6 py-5 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Здані роботи студентів ({assignmentSubmissions.length})</h4>
                                    
                                    {assignmentSubmissions.length === 0 ? (
                                        <p className="text-sm text-gray-500">Поки ніхто не здав роботу.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {assignmentSubmissions.map(sub => (
                                                <div key={sub.student_id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                            {sub.student_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <strong className="block text-sm text-gray-900">{sub.student_name}</strong>
                                                            <a href={`http://localhost:5000${sub.file_url}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                                                                Завантажити файл
                                                            </a>
                                                        </div>
                                                    </div>
                                                    
                                                    <form onSubmit={(e) => handleGradeSubmit(e, assignment.id, sub.student_id)} className="flex w-full md:w-auto gap-2 items-center">
                                                        <input type="number" name="scoreInput" placeholder="Бал (0-100)" min="0" max="100" required 
                                                            className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                                        <input type="text" name="feedbackInput" placeholder="Коментар..." 
                                                            className="flex-1 md:w-40 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                                        <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                                                            Оцінити
                                                        </button>
                                                    </form>
                                                    
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="px-6 py-5 border-t border-gray-100 bg-white">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                                    Обговорення ({assignmentComments.length})
                                </h4>
                                
                                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {assignmentComments.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">Немає запитань. Задайте першим!</p>
                                    ) : (
                                        assignmentComments.map(comment => {
                                            const isMe = comment.user_id === user.id;

                                            return (
                                                <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold opacity-90">
                                                                {isMe ? 'Ви' : comment.user_name}
                                                            </span>
                                                            
                                                            {comment.user_role === 'teacher' && (
                                                                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${isMe ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                                                    Викладач
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm">{comment.text}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400 mt-1 px-1">
                                                        {new Date(comment.created_at).toLocaleTimeString('uk-UA', {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <form onSubmit={(e) => handleCommentSubmit(e, assignment.id)} className="flex gap-2">
                                    <input type="text" name="commentInput" placeholder="Написати повідомлення..." required 
                                        className="flex-1 px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                                    <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                    </button>
                                </form>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CoursePage;