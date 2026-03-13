import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function CoursePage() {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [error, setError] = useState('');

    const [enrolledStudents, setEnrolledStudents] = useState([]);

    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newDueDate, setNewDueDate] = useState('');

    const [gradingAssignmentId, setGradingAssignmentId] = useState(null); 
    const [studentId, setStudentId] = useState('');
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/');
                    return;
                }

                const profileRes = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const currentUser = profileRes.data;
                setUser(currentUser);

                const courseRes = await axios.get(`http://localhost:5000/api/courses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourse(courseRes.data);

                const assignmentsRes = await axios.get(`http://localhost:5000/api/courses/${id}/assignments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignments(assignmentsRes.data);

                if (currentUser.role === 'teacher') {
                    const studentsRes = await axios.get(`http://localhost:5000/api/courses/${id}/students`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setEnrolledStudents(studentsRes.data);
                }

            } catch (err) {
                console.error('Помилка:', err);
                setError('Не вдалося завантажити дані курсу.');
            }
        };

        fetchCourseData();
    }, [id, navigate]);

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:5000/api/courses/${id}/assignments`, {
                title: newTitle, description: newDesc, due_date: newDueDate
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert('Завдання успішно додано!');
            setAssignments([...assignments, response.data.assignment]);
            setNewTitle(''); setNewDesc(''); setNewDueDate('');
        } catch (err) {
            console.error(err);
            alert('Помилка при створенні завдання');
        }
    };

    const handleGradeSubmit = async (e, assignmentId) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/assignments/${assignmentId}/grade`, {
                student_id: studentId,
                score: Number(score),
                feedback: feedback
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert('Оцінку успішно виставлено!');
            setGradingAssignmentId(null);
            setStudentId(''); setScore(''); setFeedback('');
        } catch (err) {
            if (err.response && err.response.data) {
                alert(err.response.data.error);
            } else {
                alert('Помилка при виставленні оцінки');
            }
        }
    };

    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
    if (!course || !user) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Завантаження курсу...</p>;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#008CBA' }}>← Повернутися до Головної панелі</Link>
            
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
                        <div>
                            <label style={{ marginRight: '10px', color: '#555' }}>Дедлайн:</label>
                            <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} required style={{ padding: '8px' }} />
                        </div>
                        <button type="submit" style={{ alignSelf: 'flex-start', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
                            Створити завдання
                        </button>
                    </form>
                </div>
            )}

            <h2>Завдання курсу:</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {assignments.length === 0 ? (
                    <p>Для цього курсу ще немає завдань.</p>
                ) : (
                    assignments.map((assignment) => (
                        <div key={assignment.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: 'white' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{assignment.title}</h3>
                            <p style={{ margin: '0 0 15px 0', color: '#555', lineHeight: '1.5' }}>{assignment.description}</p>
                            <div style={{ display: 'inline-block', backgroundColor: '#fff3cd', color: '#856404', padding: '5px 10px', borderRadius: '4px', fontSize: '14px', marginBottom: '15px' }}>
                                <strong>Дедлайн:</strong> {new Date(assignment.due_date).toLocaleDateString('uk-UA')}
                            </div>

                            {user.role === 'teacher' && (
                                <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                    <button 
                                        onClick={() => setGradingAssignmentId(gradingAssignmentId === assignment.id ? null : assignment.id)}
                                        style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: gradingAssignmentId === assignment.id ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        {gradingAssignmentId === assignment.id ? 'Скасувати оцінювання' : 'Оцінити студентів'}
                                    </button>

                                    {gradingAssignmentId === assignment.id && (
                                        <form onSubmit={(e) => handleGradeSubmit(e, assignment.id)} style={{ marginTop: '15px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            
                                            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required style={{ padding: '8px' }}>
                                                <option value="" disabled>Оберіть студента...</option>
                                                {enrolledStudents.map(student => (
                                                    <option key={student.id} value={student.id}>
                                                        {student.name} ({student.email})
                                                    </option>
                                                ))}
                                            </select>

                                            <input type="number" placeholder="Оцінка (0-100)" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} required style={{ padding: '8px' }} />
                                            <textarea placeholder="Коментар / Відгук" value={feedback} onChange={(e) => setFeedback(e.target.value)} style={{ padding: '8px', minHeight: '50px' }} />
                                            
                                            <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                                                Зберегти оцінку
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CoursePage;