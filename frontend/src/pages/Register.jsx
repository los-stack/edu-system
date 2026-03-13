import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); 
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
                role
            });

            setMessage('Реєстрація успішна! Перенаправляємо на сторінку входу...');
            
            setTimeout(() => {
                navigate('/');
            }, 2000);

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
            <h2>Реєстрація</h2>
            
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    type="text" 
                    placeholder="Ваше повне ім'я" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                
                <input 
                    type="email" 
                    placeholder="Ваш Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                
                <input 
                    type="password" 
                    placeholder="Придумайте пароль" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '5px' }}>
                    <option value="student">Студент</option>
                    <option value="teacher">Викладач</option>
                </select>
                
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Зареєструватися</button>
            </form>

            {message && <p style={{ color: message.includes('успішна') ? 'green' : 'red', marginTop: '15px' }}>{message}</p>}

            <p style={{ marginTop: '20px', fontSize: '14px' }}>
                Вже маєте акаунт? <Link to="/">Увійти тут</Link>
            </p>
        </div>
    );
}

export default Register;