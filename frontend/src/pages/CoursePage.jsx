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

    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
    if (!course || !user) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Завантаження курсу...</p>;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#008CBA' }}>← На Головну панель</Link>
            
            <div style={{ backgroundColor: '#e9f5f9', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>{course.title}</h1>
                <p style={{ color: '#555', fontSize: '18px', margin: 0 }}>{course.description}</p>
            </div>

            <hr style={{ margin: '30px 0', border: '1px solid #eee' }} />

            {user.role === 'teacher' && (
                <div style={{ backgroundColor: '#fdfdfd', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px dashed #ccc' }}>
                    <h3 style={{ marginTop: 0 }}>Додати нове завдання</h3>
                    <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input type="text" placeholder="Назва завдання" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required style={{ padding: '8px' }} />
                        <textarea placeholder="Опис завдання" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} style={{ padding: '8px', minHeight: '80px' }} required />
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div><label>Дедлайн:</label><br/><input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} required style={{ padding: '8px' }} /></div>
                            <div><label>Прикріпити матеріал:</label><br/><input type="file" id="fileInput" onChange={(e) => setNewFile(e.target.files[0])} style={{ padding: '5px' }} /></div>
                        </div>
                        <button type="submit" style={{ alignSelf: 'flex-start', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>Створити завдання</button>
                    </form>
                </div>
            )}

            <h2>Завдання курсу:</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {assignments.length === 0 ? <p>Для цього курсу ще немає завдань.</p> : assignments.map((assignment) => {
                    
                    const assignmentSubmissions = submissions.filter(s => s.assignment_id === assignment.id);
                    const mySub = assignmentSubmissions.find(s => s.student_id === user.id);
                    
                    const assignmentComments = comments.filter(c => c.assignment_id === assignment.id);

                    return (
                        <div key={assignment.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: 'white' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{assignment.title}</h3>
                            <p style={{ margin: '0 0 15px 0', color: '#555', lineHeight: '1.5' }}>{assignment.description}</p>
                            
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                                <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '5px 10px', borderRadius: '4px', fontSize: '14px' }}>
                                    <strong>Дедлайн:</strong> {new Date(assignment.due_date).toLocaleDateString('uk-UA')}
                                </div>
                                {assignment.file_url && (
                                    <a href={`http://localhost:5000${assignment.file_url}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '5px 10px', backgroundColor: '#e2e3e5', color: '#383d41', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>
                                        📎 Завантажити матеріали викладача
                                    </a>
                                )}
                            </div>

                            {user.role === 'student' && (
                                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f4f6f9', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Моя відповідь:</h4>
                                    {mySub ? (
                                        <div style={{ marginBottom: '10px' }}>
                                            <span style={{ color: '#28a745', marginRight: '10px', fontWeight: 'bold' }}>✅ Роботу завантажено!</span>
                                            <a href={`http://localhost:5000${mySub.file_url}`} target="_blank" rel="noreferrer" style={{ color: '#0056b3' }}>📎 Переглянути мій файл</a>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#dc3545', fontSize: '14px', margin: '0 0 10px 0' }}>Робота ще не здана</p>
                                    )}
                                    <form onSubmit={(e) => handleStudentSubmit(e, assignment.id)} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input type="file" id={`studentFile-${assignment.id}`} required />
                                        <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                            {mySub ? 'Перездати файл' : 'Відправити роботу'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {user.role === 'teacher' && (
                                <div style={{ marginTop: '20px', borderTop: '2px dashed #eee', paddingTop: '15px' }}>
                                    <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Здані роботи студентів:</h4>
                                    {assignmentSubmissions.length === 0 ? (
                                        <p style={{ color: '#777', fontStyle: 'italic', margin: 0 }}>Поки ніхто не здав роботу.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {assignmentSubmissions.map(sub => (
                                                <div key={sub.student_id} style={{ backgroundColor: '#f8f9fa', padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                        <strong style={{ color: '#0056b3' }}>🎓 {sub.student_name}</strong>
                                                        <a href={`http://localhost:5000${sub.file_url}`} target="_blank" rel="noreferrer" style={{ backgroundColor: '#28a745', color: 'white', padding: '4px 10px', borderRadius: '4px', textDecoration: 'none', fontSize: '14px' }}>
                                                            📄 Переглянути файл
                                                        </a>
                                                    </div>
                                                    <form onSubmit={(e) => handleGradeSubmit(e, assignment.id, sub.student_id)} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <input type="number" name="scoreInput" placeholder="Оцінка (0-100)" min="0" max="100" required style={{ width: '120px', padding: '6px' }} />
                                                        <input type="text" name="feedbackInput" placeholder="Короткий відгук..." style={{ flex: 1, padding: '6px' }} />
                                                        <button type="submit" style={{ padding: '6px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Зберегти оцінку</button>
                                                    </form>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ marginTop: '20px', backgroundColor: '#fdfdfd', border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>💬 Обговорення ({assignmentComments.length})</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {assignmentComments.length === 0 ? (
                                        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Поки немає коментарів. Задайте питання першим!</p>
                                    ) : (
                                        assignmentComments.map(comment => (
                                            <div key={comment.id} style={{ padding: '10px', backgroundColor: comment.user_role === 'teacher' ? '#eef8fe' : '#f8f9fa', borderRadius: '6px', borderLeft: comment.user_role === 'teacher' ? '4px solid #007bff' : '4px solid #6c757d' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <strong style={{ fontSize: '14px', color: comment.user_role === 'teacher' ? '#0056b3' : '#333' }}>
                                                        {comment.user_name} {comment.user_role === 'teacher' && '👨‍🏫 (Викладач)'}
                                                    </strong>
                                                    <small style={{ color: '#aaa' }}>{new Date(comment.created_at).toLocaleString('uk-UA')}</small>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '15px', color: '#444' }}>{comment.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={(e) => handleCommentSubmit(e, assignment.id)} style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        name="commentInput" 
                                        placeholder="Написати повідомлення..." 
                                        required 
                                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
                                    />
                                    <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#343a40', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Відправити
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