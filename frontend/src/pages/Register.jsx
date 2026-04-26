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
            toast.success('Реєстрація успішна! Тепер ви можете увійти.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Помилка реєстрації');
            toast.error('Щось пішло не так');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-soft-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row-reverse">
                
                {/* Right side - Branding */}
                <div className="hidden md:flex md:w-5/12 relative bg-zinc-900 dark:bg-zinc-950 p-10 flex-col justify-between overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute inset-0 bg-gradient-to-bl from-primary-600/20 via-transparent to-primary-900/10"></div>
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white mb-8 shadow-lg shadow-primary-600/25">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">Почніть свій шлях</h2>
                        <p className="text-zinc-400 mt-3 text-base leading-relaxed">Приєднуйтесь до платформи, де знання стають доступними для кожного.</p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex -space-x-3 mb-3">
                            <div className="w-9 h-9 rounded-full border-2 border-zinc-900 bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">A</div>
                            <div className="w-9 h-9 rounded-full border-2 border-zinc-900 bg-amber-500 flex items-center justify-center text-white text-xs font-semibold">B</div>
                            <div className="w-9 h-9 rounded-full border-2 border-zinc-900 bg-zinc-600 flex items-center justify-center text-white text-xs font-bold">+2k</div>
                        </div>
                        <p className="text-zinc-400 text-sm">Вже понад 2000 користувачів навчаються з нами.</p>
                    </div>
                </div>

                {/* Left side - Form */}
                <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
                    <div className="max-w-sm w-full mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Створити акаунт</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Заповніть форму нижче для реєстрації.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Хто ви?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'student' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}>
                                        <input type="radio" name="role" value="student" checked={role === 'student'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                                        <svg className={`w-5 h-5 ${role === 'student' ? 'text-primary-600' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
                                        <span className={`text-sm font-medium ${role === 'student' ? 'text-primary-700 dark:text-primary-400' : 'text-zinc-600 dark:text-zinc-400'}`}>Студент</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'teacher' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}>
                                        <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                                        <svg className={`w-5 h-5 ${role === 'teacher' ? 'text-primary-600' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        <span className={`text-sm font-medium ${role === 'teacher' ? 'text-primary-700 dark:text-primary-400' : 'text-zinc-600 dark:text-zinc-400'}`}>Викладач</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{"Ім'я та Прізвище"}</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm" 
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
                                    placeholder="Мінімум 6 символів" 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? 'Реєстрація...' : 'Створити акаунт'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                Вже є акаунт?{' '}
                                <Link to="/" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
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
