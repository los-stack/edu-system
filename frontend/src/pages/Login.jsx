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
        <section className="auth-layout" aria-labelledby="login-heading">
            <aside className="auth-aside auth-aside-login">
                <div className="auth-aside-content">
                    <div className="app-brand-mark" aria-hidden="true">e</div>
                    <span className="ui-eyebrow text-white/70">НЕ ПРОСТО НАВЧАННЯ</span>
                    <h2>Перетворюй цікавість на рух.</h2>
                    <p>Твоя наступна велика ідея починається з одного заняття.</p>
                </div>
                <div className="auth-aside-note">EPLATFORM <span>—</span> РОЗПОЧНИ ЗАРАЗ</div>
            </aside>

            <div className="auth-form-panel">
                <div className="auth-form-content">
                    <span className="ui-eyebrow">Раді вас бачити</span>
                    <h1 id="login-heading" className="mt-2">З поверненням</h1>
                    <p>Увійдіть у свій акаунт, щоб продовжити навчання.</p>

                    {error && (
                        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div>
                            <label htmlFor="login-email">Email адреса</label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="ui-input"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="login-password">Пароль</label>
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="ui-input"
                                placeholder="Введіть пароль"
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="ui-button-primary mt-1 w-full">
                            {isLoading ? 'Вхід...' : 'Увійти до акаунту'}
                        </button>
                    </form>

                    <p className="auth-form-footer">
                        Ще не маєте акаунту? <Link to="/register">Зареєструватися</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Login;