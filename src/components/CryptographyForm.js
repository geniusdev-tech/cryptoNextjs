"use client";

import { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 400px;
  margin: 20px auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 10px;
  color: #555;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  &:focus {
    border-color: #333;
  }
`;

const Button = styled.button`
  padding: 10px;
  border-radius: 4px;
  border: none;
  background: #333;
  color: #fff;
  cursor: pointer;
  margin-bottom: 10px;
  &:hover {
    background: #555;
  }
`;

const CryptographyForm = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [action, setAction] = useState('encrypt');
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', name: name || '', password: userPassword || '' }),
    });

    const result = await response.json();
    if (result.success) {
      alert(result.data.name + " logado com sucesso!");
      setLoggedIn(true);
    } else {
      alert(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', name: name || '', password: userPassword || '' }),
    });

    const result = await response.json();
    if (result.success) {
      alert("Usuário registrado com sucesso!");
      setIsRegistering(false);
    } else {
      alert(result.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    formData.append('action', action);

    const response = await fetch('/api/cryptography', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    alert(result.message + (result.hash ? `\nHash: ${result.hash}` : ''));
  };

  return (
    <FormContainer>
      {!loggedIn ? (
        isRegistering ? (
          <Form onSubmit={handleRegister}>
            <Label>
              Nome:
              <Input type="text" value={name || ''} onChange={(e) => setName(e.target.value)} />
            </Label>
            <Label>
              Senha:
              <Input type="password" value={userPassword || ''} onChange={(e) => setUserPassword(e.target.value)} />
            </Label>
            <Button type="submit">Registrar</Button>
            <Button type="button" onClick={() => setIsRegistering(false)}>Já possui uma conta? Faça login</Button>
          </Form>
        ) : (
          <Form onSubmit={handleLogin}>
            <Label>
              Nome:
              <Input type="text" value={name || ''} onChange={(e) => setName(e.target.value)} />
            </Label>
            <Label>
              Senha:
              <Input type="password" value={userPassword || ''} onChange={(e) => setUserPassword(e.target.value)} />
            </Label>
            <Button type="submit">Login</Button>
            <Button type="button" onClick={() => setIsRegistering(true)}>Registrar-se</Button>
          </Form>
        )
      ) : (
        <Form onSubmit={handleSubmit}>
          <Label>
            Selecione o arquivo:
            <Input type="file" onChange={handleFileChange} />
          </Label>
          <Label>
            Senha:
            <Input type="password" value={password || ''} onChange={(e) => setPassword(e.target.value)} />
          </Label>
          <Label>
            <Input
              type="radio"
              value="encrypt"
              checked={action === 'encrypt'}
              onChange={() => setAction('encrypt')}
            />
            Criptografar
          </Label>
          <Label>
            <Input
              type="radio"
              value="decrypt"
              checked={action === 'decrypt'}
              onChange={() => setAction('decrypt')}
            />
            Descriptografar
          </Label>
          <Button type="submit">Processar</Button>
        </Form>
      )}
    </FormContainer>
  );
};

export default CryptographyForm;
