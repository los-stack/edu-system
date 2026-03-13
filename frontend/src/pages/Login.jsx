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
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: email,
                password: password
            });

            const { token } = response.data;

            localStorage.setItem('token', token);
            
            navigate('/dashboard');

        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data.error);
            } else {
                setMessage('Помилка з\'єднання з сервером');
            }
        }
    };

    return (
        <div style={{ maxWidth: '300px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>Вхід у систему</h2>
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    type="email" 
                    placeholder="Ваш Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                />
                
                <input 
                    type="password" 
                    placeholder="Пароль" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                />
                
                <button type="submit">Увійти</button>
            </form>

            {message && <p style={{ color: 'red', marginTop: '15px' }}>{message}</p>}
            
            <p style={{ marginTop: '20px', fontSize: '14px' }}>
                Ще не зареєстровані? <Link to="/register">Створити акаунт</Link>
            </p>
        </div>
    );
}

export default Login;