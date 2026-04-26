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
                console.error('Помилка завантаження профілю:', error);
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

    if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div></div>;
    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto pb-16">
            
            {/* Header */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 mb-8 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 mb-4 hover:gap-3 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Назад до панелі
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Налаштування</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Керуйте своїми особистими даними та безпекою.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Profile Card */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center sticky top-24">
                        <div className="w-24 h-24 mx-auto rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold text-3xl mb-4">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-1">{user.name}</h2>
                        <p className="text-zinc-500 text-sm mb-4">{user.email}</p>
                        
                        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-900 text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
                            {user.role === 'teacher' ? 'Викладач' : user.role === 'admin' ? 'Адміністратор' : 'Студент'}
                        </span>
                    </div>
                </div>

                {/* Forms */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Personal Info Form */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Особисті дані</h3>
                            <p className="text-sm text-zinc-500 mt-0.5">{"Оновіть своє ім'я та контактну адресу."}</p>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="p-5 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Повне {"ім'я"}</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email адреса</label>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm" 
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    type="submit" 
                                    disabled={isSavingProfile || (name === user.name && email === user.email)} 
                                    className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    {isSavingProfile ? 'Збереження...' : 'Зберегти зміни'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Password Form */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden border-t-2 border-t-red-500">
                        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Безпека</h3>
                            <p className="text-sm text-zinc-500 mt-0.5">Змініть свій пароль для доступу до системи.</p>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="p-5 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Поточний пароль</label>
                                <input 
                                    type="password" 
                                    value={currentPassword} 
                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                    required 
                                    placeholder="Введіть старий пароль"
                                    className="w-full max-w-sm px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm" 
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Новий пароль</label>
                                    <input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        required 
                                        placeholder="Мінімум 6 символів"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Підтвердіть пароль</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        required 
                                        placeholder="Повторіть новий пароль"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm" 
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    type="submit" 
                                    disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword} 
                                    className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
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
