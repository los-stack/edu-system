import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(''); 
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/users/profile');
                setUser(res.data);
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити профіль. Можливо, ви забули виконати SQL-запит для додавання колонки avatar_url у базу даних.');
            }
        };
        fetchProfile();
    }, []);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setIsUploading(true);
        try {
            const res = await axios.post('/api/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser({ ...user, avatar_url: res.data.avatar_url });
            
            const localUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({ ...localUser, avatar_url: res.data.avatar_url }));
            
            window.dispatchEvent(new Event('user-updated'));
            
            toast.success('Аватарку оновлено!');
        } catch (err) {
            console.error('Помилка:', err);
            toast.error('Помилка завантаження файлу');
        } finally {
            setIsUploading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Нові паролі не збігаються!');
        }

        try {
            await axios.put('/api/users/password', { currentPassword, newPassword });
            toast.success('Пароль успішно змінено!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при зміні пароля');
        }
    };

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800/30 text-center">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2">Помилка завантаження</h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
        );
    }

    if (!user) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    const avatarPath = user.avatar_url ? `${import.meta.env.VITE_API_URL}${user.avatar_url}` : null;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Назад до панелі
            </Link>

            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Налаштування профілю</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center transition-colors">
                        <div className="relative mb-4 group cursor-pointer">
                            {avatarPath ? (
                                <img src={avatarPath} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 dark:border-gray-900 shadow-md" />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-extrabold text-4xl border-4 border-gray-50 dark:border-gray-900 shadow-md">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            
                            <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                {isUploading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
                            </label>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.email}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : user.role === 'teacher' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {user.role}
                        </span>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            Зміна пароля
                        </h3>
                        
                        <form onSubmit={handlePasswordChange} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Поточний пароль</label>
                                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm" />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Новий пароль</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength="6" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Підтвердіть новий пароль</label>
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm" />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button type="submit" className="px-6 py-2.5 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors shadow-sm">
                                    Оновити пароль
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Profile;