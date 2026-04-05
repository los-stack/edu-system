import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(response.data.user)); 
            navigate('/dashboard'); 
        } catch (error) {
            setMessage(error.response?.data?.error || 'Помилка з\'єднання з сервером');
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-[75vh]">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 sm:p-10 transition-colors">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Увійдіть у свій акаунт</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Вітаємо з поверненням на EPlatform</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Електронна пошта</label>
                        <input 
                            type="email" 
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                            className="w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Пароль</label>
                            <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">Забули пароль?</a>
                        </div>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                            className="w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-2.5 px-4 mt-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        Увійти
                    </button>
                </form>

                {message && (
                    <div className="mt-5 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">
                        {message}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Немає акаунту?{' '}
                        <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
                            Створити зараз
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;