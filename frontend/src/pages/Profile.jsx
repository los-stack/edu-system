import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/users/profile');
                setUser(res.data);
                setName(res.data.name);
                setEmail(res.data.email);
            } catch (error) {
                toast.error('Не вдалося завантажити профіль');
                if (error.response?.status === 401) {
                    localStorage.removeItem('user');
                    navigate('/');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const res = await axios.put('/api/users/profile', { name, email });
            setUser(res.data.user || res.data);
            
            const updatedUser = { ...JSON.parse(localStorage.getItem('user')), name, email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('user-updated'));
            
            toast.success('Особисті дані успішно оновлено!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Помилка при оновленні профілю');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Нові паролі не співпадають');
        }
        setIsSavingPassword(true);
        try {
            await axios.put('/api/users/password', { currentPassword, newPassword });
            toast.success('Пароль успішно змінено!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Помилка при зміні пароля');
        } finally {
            setIsSavingPassword(false);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!user) return null;

    return (
        <div className="w-full relative mt-2">
            
            <div className="relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 sm:p-12 mb-10 shadow-xl shadow-zinc-200/40 dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="relative z-10">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 mb-6 hover:gap-3 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Назад до панелі
                    </Link>
                    <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">Налаштування</h1>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">Керуйте своїми особистими даними та безпекою акаунту.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-4xl p-8 shadow-xl shadow-zinc-200/40 dark:shadow-none text-center sticky top-24">
                        <div className="w-32 h-32 mx-auto rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-blue-600/20 mb-6 border-4 border-white dark:border-zinc-800">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{user.name}</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-6">{user.email}</p>
                        
                        <div className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            <span className="text-sm font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                                {user.role === 'teacher' ? 'Викладач' : user.role === 'admin' ? 'Адміністратор' : 'Студент'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-4xl shadow-xl shadow-zinc-200/40 dark:shadow-none overflow-hidden">
                        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-transparent">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Особисті дані</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Оновіть своє ім'я та контактну адресу.</p>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Повне ім'я</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Email адреса</label>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium" 
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit" 
                                    disabled={isSavingProfile || (name === user.name && email === user.email)} 
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none text-sm"
                                >
                                    {isSavingProfile ? 'Збереження...' : 'Зберегти зміни'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-4xl shadow-xl shadow-zinc-200/40 dark:shadow-none overflow-hidden border-t-4 border-t-zinc-900 dark:border-t-zinc-100">
                        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-transparent">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Безпека</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Змініть свій пароль для доступу до системи.</p>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Поточний пароль</label>
                                <input 
                                    type="password" 
                                    value={currentPassword} 
                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                    required 
                                    placeholder="Введіть старий пароль"
                                    className="w-full max-w-md px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium" 
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Новий пароль</label>
                                    <input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        required 
                                        placeholder="Мінімум 6 символів"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Підтвердіть новий пароль</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        required 
                                        placeholder="Повторіть новий пароль"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium" 
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit" 
                                    disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword} 
                                    className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-80 transition-colors shadow-md disabled:opacity-50 disabled:shadow-none text-sm"
                                >
                                    {isSavingPassword ? 'Оновлення...' : 'Оновити пароль'}
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