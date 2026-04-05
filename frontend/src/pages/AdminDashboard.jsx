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
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Назад до панелі
            </Link>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Управління системою
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Тут ви можете керувати всіма користувачами платформи.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300">
                    Всього користувачів: <span className="text-blue-600 dark:text-blue-400 font-bold">{users.length}</span>
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800/30">{error}</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Користувач</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Поточна роль</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Змінити роль</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Дії</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm border border-blue-200 dark:border-blue-800/30">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/30' : user.role === 'teacher' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30'}`}>
                                                {user.role === 'admin' ? 'Адміністратор' : user.role === 'teacher' ? 'Викладач' : 'Студент'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="block w-full py-1.5 pl-3 pr-8 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors">
                                                <option value="student">Студент</option>
                                                <option value="teacher">Викладач</option>
                                                <option value="admin">Адміністратор</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDeleteUser(user.id, user.name)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors inline-flex items-center gap-1" title="Видалити користувача">
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