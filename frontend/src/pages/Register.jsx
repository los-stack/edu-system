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
            <div className="w-full max-w-5xl bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden flex flex-col md:flex-row-reverse">
                
                <div className="hidden md:flex md:w-5/12 relative bg-linear-to-br from-indigo-900 to-purple-800 p-12 flex-col justify-between overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
                    <div className="absolute bottom-[-10%] left-[-20%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-6 border border-white/20">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight tracking-tight">Почніть свій шлях</h2>
                        <p className="text-purple-100/80 mt-4 text-lg font-medium">Приєднуйтесь до платформи, де знання стають доступними.</p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex -space-x-4 mb-4">
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-blue-500"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-pink-500"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-amber-500 flex items-center justify-center text-xs font-bold text-white">+2k</div>
                        </div>
                        <p className="text-white/80 font-medium text-sm">Вже понад 2000 користувачів навчаються з нами.</p>
                    </div>
                </div>

                <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-8 text-center md:text-left">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Створити акаунт</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Заповніть форму нижче для реєстрації.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Хто ви?</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'student' ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'}`}>
                                        <input type="radio" name="role" value="student" checked={role === 'student'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                                        <svg className={`w-6 h-6 ${role === 'student' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
                                        <span className={`text-sm font-bold ${role === 'student' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>Студент</span>
                                    </label>
                                    <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'teacher' ? 'border-purple-600 bg-purple-50 dark:bg-purple-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-gray-600'}`}>
                                        <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                                        <svg className={`w-6 h-6 ${role === 'teacher' ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        <span className={`text-sm font-bold ${role === 'teacher' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>Викладач</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ім'я та Прізвище</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="Іван Іванов" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email адреса</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="name@example.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Пароль</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="Мінімум 6 символів (з цифрою)" />
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full py-4 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-black tracking-wide transition-all shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed mt-4">
                                {isLoading ? 'РЕЄСТРАЦІЯ...' : 'СТВОРИТИ АКАУНТ'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                Вже є акаунт?{' '}
                                <Link to="/" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
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