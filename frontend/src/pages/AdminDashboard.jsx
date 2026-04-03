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
                const response = await axios.get('/api/admin/users');
                setUsers(response.data);
            } catch (err) {
                console.error(err);
                setError('Помилка доступу. Ви не адміністратор або сесія застаріла.');
                if (err.response?.status === 401) {
                    localStorage.removeItem('user');
                    navigate('/');
                }
            }
        };
        fetchUsers();
    }, [navigate]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка зміни ролі');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Ви впевнені, що хочете видалити користувача ${userName}? Всі його дані будуть втрачені!`)) return;

        try {
            await axios.delete(`/api/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Помилка:', err);
            alert('Помилка при видаленні');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Назад до панелі
            </Link>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Управління системою
                    </h1>
                    <p className="text-gray-500 mt-1">Тут ви можете керувати всіма користувачами платформи.</p>
                </div>
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-700">
                    Всього користувачів: <span className="text-blue-600 font-bold">{users.length}</span>
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Користувач</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Поточна роль</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Змінити роль</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Дії</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : user.role === 'teacher' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                {user.role === 'admin' ? 'Адміністратор' : user.role === 'teacher' ? 'Викладач' : 'Студент'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="block w-full py-1.5 pl-3 pr-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                                <option value="student">Студент</option>
                                                <option value="teacher">Викладач</option>
                                                <option value="admin">Адміністратор</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDeleteUser(user.id, user.name)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1" title="Видалити користувача">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;