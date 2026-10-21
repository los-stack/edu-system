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
        <section className="auth-layout" aria-labelledby="register-heading">
            <aside className="auth-aside auth-aside-register">
                <div className="auth-aside-content">
                    <div className="app-brand-mark" aria-hidden="true">e</div>
                    <span className="ui-eyebrow text-white/70">ТВОЯ ІСТОРІЯ ПОЧИНАЄТЬСЯ</span>
                    <h2>Будь новачком у чомусь новому.</h2>
                    <p>Збирай навички, проходь власний маршрут і помічай, як далеко ти вже зайшов.</p>
                </div>
                <div className="auth-aside-note">EPLATFORM <span>—</span> ТВІЙ МАРШРУТ</div>
            </aside>

            <div className="auth-form-panel">
                <div className="auth-form-content">
                    <span className="ui-eyebrow">Почнімо разом</span>
                    <h1 id="register-heading" className="mt-2">Створіть акаунт</h1>
                    <p>Заповніть кілька даних, щоб розпочати навчання.</p>

                    {error && (
                        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div>
                            <label htmlFor="register-name">Повне ім'я</label>
                            <input
                                id="register-name"
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="ui-input"
                                placeholder="Іван Іванов"
                            />
                        </div>
                        <div>
                            <label htmlFor="register-email">Email адреса</label>
                            <input
                                id="register-email"
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
                            <label htmlFor="register-password">Пароль</label>
                            <input
                                id="register-password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="6"
                                className="ui-input"
                                placeholder="Мінімум 6 символів"
                            />
                        </div>
                        <div>
                            <label htmlFor="register-role">Я реєструюся як</label>
                            <select
                                id="register-role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="ui-input"
                            >
                                <option value="student">Студент</option>
                                <option value="teacher">Викладач</option>
                            </select>
                        </div>
                        <button type="submit" disabled={isLoading} className="ui-button-primary mt-1 w-full">
                            {isLoading ? 'Створюємо акаунт...' : 'Створити акаунт'}
                        </button>
                    </form>

                    <p className="auth-form-footer">
                        Вже маєте акаунт? <Link to="/">Увійти</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Register;