import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/');

                const response = await axios.get('http://localhost:5000/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
            } catch (err) {
                console.error(err);
                setError('Помилка доступу. Ви не адміністратор або токен застарів.');
            }
        };
        fetchUsers();
    }, [navigate]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, 
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            alert('Роль успішно змінено!');
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка зміни ролі');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Ви впевнені, що хочете видалити користувача ${userName}? Всі його дані будуть втрачені!`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Користувача видалено!');
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при видаленні');
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#008CBA' }}>← На Головну панель</Link>
            
            <h1 style={{ marginTop: '20px', color: '#dc3545' }}>👑 Панель Адміністратора</h1>
            <p style={{ color: '#555' }}>Тут ви можете керувати всіма користувачами системи.</p>

            {error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#343a40', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>ID</th>
                            <th style={{ padding: '12px' }}>Ім'я</th>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Поточна Роль</th>
                            <th style={{ padding: '12px' }}>Змінити роль</th>
                            <th style={{ padding: '12px' }}>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px' }}>{user.id}</td>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.name}</td>
                                <td style={{ padding: '12px' }}>{user.email}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '14px', color: 'white',
                                        backgroundColor: user.role === 'admin' ? '#dc3545' : user.role === 'teacher' ? '#28a745' : '#007bff'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <select 
                                        value={user.role} 
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        style={{ padding: '5px' }}
                                    >
                                        <option value="student">Студент</option>
                                        <option value="teacher">Викладач</option>
                                        <option value="admin">Адміністратор</option>
                                    </select>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <button 
                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                        style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminDashboard;