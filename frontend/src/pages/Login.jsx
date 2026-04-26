import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.dispatchEvent(new Event('user-updated'));
            toast.success('Успішний вхід!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Помилка підключення до сервера');
            toast.error('Помилка входу');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-soft-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row">
                
                {/* Left side - Branding */}
                <div className="hidden md:flex md:w-5/12 relative bg-zinc-900 dark:bg-zinc-950 p-10 flex-col justify-between overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-primary-900/10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white mb-8 shadow-lg shadow-primary-600/25">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">EPlatform</h2>
                        <p className="text-zinc-400 mt-3 text-base leading-relaxed">Сучасна платформа для онлайн-навчання та управління освітнім процесом.</p>
                    </div>

                    <div className="relative z-10 bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
                        <p className="text-zinc-300 font-medium text-sm leading-relaxed">"Освіта - це найпотужніша зброя, яку ви можете використати, щоб змінити світ."</p>
                        <p className="text-zinc-500 text-xs mt-2">- Нельсон Мандела</p>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
                    <div className="max-w-sm w-full mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">З поверненням</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Введіть ваші дані для входу в систему.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email адреса</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm" 
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
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm" 
                                    placeholder="Введіть пароль" 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-primary-600/25 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? 'Вхід...' : 'Увійти'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                Ще не маєте акаунту?{' '}
                                <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                                    Зареєструватися
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
