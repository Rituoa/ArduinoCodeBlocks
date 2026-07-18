import React, { useState, useEffect } from 'react';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import './App.css';
import { initSpriteBlocks } from './SpriteBlocks';
import MainIDE from './MainIDE';

initSpriteBlocks();
Blockly.setLocale(En);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false); 

  useEffect(() => {
    const savedSession = localStorage.getItem('robonist_session');
    if (savedSession) setCurrentUser(JSON.parse(savedSession)); 
  }, []);

  const handleLogout = () => {
    setCurrentUser(null); 
    localStorage.removeItem('robonist_session'); 
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError('');
    try {
      if (isSignUpMode) {
        const checkRes = await fetch(`http://localhost:5000/users?username=${username}`);
        const existingUsers = await checkRes.json();
        if (existingUsers.length > 0) return setError('Username is already taken. Pick another!');

        const newUser = { username, password, role: 'Student' };
        const createRes = await fetch('http://localhost:5000/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
        const savedUser = await createRes.json();
        
        if (rememberMe) localStorage.setItem('robonist_session', JSON.stringify(savedUser));
        setCurrentUser(savedUser); 
      } else {
          const loginRes = await fetch(`http://localhost:5000/users?username=${username}`);
          const foundUsers = await loginRes.json();
          if (foundUsers.length > 0) {
            const matchedUser = foundUsers.find(u => u.password === password);
            if (matchedUser) {
              if (rememberMe) localStorage.setItem('robonist_session', JSON.stringify(matchedUser));
              setCurrentUser(matchedUser); 
            } else setError('Incorrect password! Please try again.');
          } else setError('User not found! Check your spelling or sign up.');
      }
    } catch (err) {
      setError('Cannot connect to server. Is json-server running?');
    }
  };

  if (currentUser) return <MainIDE user={currentUser} onLogout={handleLogout} />;

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #74ebd5 0%, #9face6 100%)', fontFamily: "'Quicksand', 'Comic Sans MS', 'Inter', sans-serif" }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', width: '380px', textAlign: 'center', border: '4px solid white' }}>
        <div style={{ fontSize: '60px', marginBottom: '10px', textShadow: '0px 5px 10px rgba(0,0,0,0.1)' }}>🤖</div>
        <h1 style={{ color: '#FF6680', margin: '0 0 10px 0', fontSize: '28px', fontWeight: '900' }}>Robonist-ArduBLOCK</h1>
        <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '16px', fontWeight: 'bold' }}>{isSignUpMode ? "Create your builder profile! ✨" : "Ready to build a robot? 🚀"}</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="What's your name?" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '16px', borderRadius: '16px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontSize: '16px', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#5CB1D6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} required />
          <input type="password" placeholder="Secret password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '16px', borderRadius: '16px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontSize: '16px', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#5CB1D6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} required />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 5px' }}>
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#42CC8C' }} />
            <label htmlFor="rememberMe" style={{ color: '#64748b', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Remember me next time!</label>
          </div>
          
          {error && (<div style={{ backgroundColor: '#ffe4e6', border: '2px solid #fda4af', padding: '12px', borderRadius: '12px' }}><p style={{ color: '#e11d48', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Oh no! {error}</p></div>)}
          
          <button type="submit" style={{ padding: '16px', backgroundColor: isSignUpMode ? '#9966FF' : '#42CC8C', color: 'white', border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: '900', cursor: 'pointer', marginTop: '5px', boxShadow: isSignUpMode ? '0 6px 0px #7c3aed' : '0 6px 0px #2ba86c', transition: 'transform 0.1s, box-shadow 0.1s' }} onMouseDown={(e) => { e.target.style.transform = 'translateY(4px)'; e.target.style.boxShadow = '0 2px 0px transparent'; }} onMouseUp={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = isSignUpMode ? '0 6px 0px #7c3aed' : '0 6px 0px #2ba86c'; }}>
            {isSignUpMode ? "Join the Fun!" : "Let's Go! 🎮"}
          </button>
        </form>

        <p style={{ marginTop: '30px', fontSize: '15px', color: '#64748b', fontWeight: 'bold' }}>
          {isSignUpMode ? "Already have an account?" : "New here?"}
          <span onClick={() => { setIsSignUpMode(!isSignUpMode); setError(''); }} style={{ color: '#00979D', cursor: 'pointer', marginLeft: '8px', textDecoration: 'underline' }}>{isSignUpMode ? "Log in" : "Sign up!"}</span>
        </p>
      </div>
    </div>
  );
}