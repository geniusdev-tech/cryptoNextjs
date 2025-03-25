"use client";

import React, { useState } from 'react';

const CryptographyForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [action, setAction] = useState('encrypt');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setMessage('');
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const actionType = isLogin ? 'login' : 'register';
    const data = { action: actionType, name: email, password };

    if (!isLogin && password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        setMessage(actionType === 'login' ? 'Login successful' : 'Registration successful');
        if (actionType === 'login') setIsLoggedIn(true);
      } else {
        setMessage(result.error || 'An error occurred');
      }
    } catch (error) {
      setMessage('Erro ao processar a solicitação.');
    }
  };

  const handleCryptoSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('action', action);
    formData.append('password', password);
    if (file) formData.append('file', file);
  
    try {
      const response = await fetch('/api/cryptography', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
      if (response.ok) {
        setMessage(result.message || 'Operação realizada com sucesso');
      } else {
        setMessage(result.error || 'Erro desconhecido ao processar a solicitação');
      }
    } catch (error) {
      console.error('Erro no cliente:', error);
      setMessage('Erro ao processar a solicitação: ' + error.message);
    }
  };

  return (
    <div className="container">
      {isLoggedIn ? (
        <form onSubmit={handleCryptoSubmit} className="crypto-form">
          <h1 className="form-title">Crypto-Terminal</h1>
          <div className="input-group">
            <label htmlFor="file">Upload Data</label>
            <input type="file" id="file" onChange={handleFileChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Key</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="action">Operation</label>
            <select
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              required
            >
              <option value="encrypt">Encrypt</option>
              <option value="decrypt">Decrypt</option>
            </select>
          </div>
          <button type="submit" className="submit-btn">
            {action === 'encrypt' ? 'Encrypt' : 'Decrypt'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleAuthSubmit} className="auth-form">
          <h1 className="form-title">
            {isLogin ? '' : 'Initialize Node'}
          </h1>
          <div className="input-group">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              placeholder="user@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Verify Passcode</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
          <p className="toggle-text">
            {isLogin ? (
              <> Create an account <a onClick={toggleForm}>here</a></>
            ) : (
              <> Already have an account? <a onClick={toggleForm}>Access here</a></>
            )}
          </p>
        </form>
      )}
      {message && <p className="message">{message}</p>}

      <style jsx>{`
        .container {
          max-width: 450px;
          margin: 50px auto;
          padding: 70px;
          padding-left: 50px;
          background: #1C2526; /* Dark background similar to the image */
          border: 3px solid #00A3E0; /* Electric blue border */
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 163, 224, 0.5); /* Blue glow */
          animation: glowPulse 1.5s infinite alternate;
        }

        .form-title {
          font-size: 24px;
          color: #FFFFFF; /* White text */
          text-align: center;
          margin-bottom: 25px;
          font-family: 'Orbitron', sans-serif;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(0, 163, 224, 0.7); /* Blue glow on text */
        }

        .input-group {
          margin-bottom: 20px;
          position: relative;
        }

        label {
          display: block;
          color: #FFFFFF; /* White text for labels */
          margin-bottom: 10px;
          padding-left: 5px;
          font-family: 'Roboto Mono', monospace;
          font-size: 14px;
          text-transform: uppercase;
        }

        input, select {
          width: 100%;
          padding: 12px;
          background: #2A3435; /* Slightly lighter dark shade for inputs */
          border: 1px solid #00A3E0; /* Blue border */
          border-radius: 5px;
          color: #FFFFFF; /* White text */
          font-family: 'Roboto Mono', monospace;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        input:focus, select:focus {
          border-color: #00BFFF; /* Brighter blue on focus */
          box-shadow: 0 0 10px rgba(0, 163, 224, 0.5); /* Blue glow on focus */
          outline: none;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          padding-left: 20px;
          margin-left: 11px;
          background: #000000; /* Black button background */
          border: 1px solid #00A3E0; /* Blue border */
          border-radius: 5px;
          color: #FFFFFF; /* White text */
          font-family: 'Orbitron', sans-serif;
          font-size: 16px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.4s ease;
          box-shadow: 0 0 15px rgba(0, 163, 224, 0.5); /* Blue glow */
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(0, 163, 224, 0.8); /* Brighter blue glow on hover */
        }

        .toggle-text {
          text-align: center;
          color: #FFFFFF; /* White text */
          margin-top: 20px;
          font-family: 'Roboto Mono', monospace;
        }

        a {
          color: #00A3E0; /* Blue links */
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        a:hover {
          text-shadow: 0 0 10px rgba(0, 163, 224, 0.7); /* Blue glow on hover */
        }

        .message {
          text-align: center;
          color:rgb(43, 255, 0); /* Soft red for messages/errors */
          margin-top: 20px;
          font-family: 'Roboto Mono', monospace;
          animation: fadeIn 0.5s ease-in;
        }

        .message.error {
          text-align: center;
          color:rgb(255, 0, 0); /* Soft red for messages/errors */
          margin-top: 20px;
          font-family: 'Roboto Mono', monospace;
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes glowPulse {
          0% { box-shadow: 0 0 20px rgba(0, 163, 224, 0.5); }
          100% { box-shadow: 0 0 30px rgba(0, 163, 224, 0.8); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CryptographyForm;