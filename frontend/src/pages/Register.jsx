import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await axios.post('/api/auth/register', { name, email, password, role });
            toast.success('Реєстрація успішна! Увійдіть у систему.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Помилка підключення до сервера');
            toast.error('Помилка реєстрації');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row-reverse">
                
                <div className="hidden md:flex md:w-5/12 relative bg-zinc-900 dark:bg-zinc-950 p-10 flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 via-transparent to-blue-900/10"></div>
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-600/25">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">Приєднуйтесь</h2>
                        <p className="text-zinc-400 mt-3 text-base leading-relaxed">Створіть свій акаунт, щоб отримати доступ до всіх матеріалів курсу та оцінок.</p>
                    </div>

                    <div className="relative z-10 bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs text-white">10k+</div>
                            </div>
                            <p className="text-sm font-medium text-zinc-300">активних студентів</p>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
                    <div className="max-w-sm w-full mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Створення акаунту</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Заповніть форму нижче для реєстрації.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Повне ім'я</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
                                    placeholder="Іван Іванов" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email адреса</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
                                    placeholder="name@example.com" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Пароль</label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    minLength="6"
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
                                    placeholder="Мінімум 6 символів" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Роль</label>
                                <select 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)} 
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none"
                                >
                                    <option value="student">Студент</option>
                                    <option value="teacher">Викладач</option>
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? 'Реєстрація...' : 'Створити акаунт'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                Вже маєте акаунт?{' '}
                                <Link to="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                                    Увійти
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;