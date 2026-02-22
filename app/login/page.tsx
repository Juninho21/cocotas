'use client';

import React, { useState } from 'react';
import { Flame, Mail, Lock, User, Github, Chrome, ArrowRight, Eye, EyeOff, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simular login/cadastro
        setTimeout(() => {
            setIsLoading(false);
            router.push('/');
        }, 2000);
    };

    return (
        <div className="login-container">
            {/* Background Animated Gradient */}
            <div className="login-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <main className="login-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="login-card glass"
                >
                    {/* Logo Section */}
                    <div className="login-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div className="login-logo-container" style={{ margin: 0, width: '48px', height: '48px' }}>
                                <Flame size={24} fill="#fff" className="text-white" />
                            </div>
                            <h1 className="login-title" style={{ fontSize: '42px' }}>cocotas</h1>
                        </div>
                        <p className="login-subtitle">
                            {isLogin ? 'Bem-vindo de volta!' : 'Comece sua jornada hoje'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="login-tabs">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`login-tab ${isLogin ? 'active' : ''}`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`login-tab ${!isLogin ? 'active' : ''}`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    key="name"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="input-group"
                                >
                                    <label>Nome Completo</label>
                                    <div className="input-wrapper">
                                        <User size={18} className="input-icon" />
                                        <input type="text" placeholder="Seu nome" required={!isLogin} />
                                    </div>
                                </motion.div>
                            )}
                            {!isLogin && (
                                <motion.div
                                    key="city"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="input-group"
                                >
                                    <label>Cidade onde vive</label>
                                    <div className="input-wrapper">
                                        <MapPin size={18} className="input-icon" />
                                        <input type="text" placeholder="Sua cidade" required={!isLogin} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="input-group">
                            <label>E-mail</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input type="email" placeholder="email@exemplo.com" required />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Senha</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-submit-btn" disabled={isLoading}>
                            {isLoading ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="login-footer">
                        Ao clicar em {isLogin ? 'Entrar' : 'Criar Conta'}, você concorda com nossos{' '}
                        <Link href="#">Termos de Serviço</Link> e{' '}
                        <Link href="#">Política de Privacidade</Link>.
                    </p>
                </motion.div>
            </main>

            <style jsx>{`
                .login-container {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #000;
                    overflow: hidden;
                    z-index: 2000;
                }

                .login-bg {
                    position: absolute;
                    inset: 0;
                    z-index: -1;
                }

                .blob {
                    position: absolute;
                    filter: blur(80px);
                    opacity: 0.4;
                    border-radius: 50%;
                }

                .blob-1 {
                    width: 400px;
                    height: 400px;
                    background: #ff4458;
                    top: -100px;
                    left: -100px;
                    animation: float 10s infinite alternate;
                }

                .blob-2 {
                    width: 300px;
                    height: 300px;
                    background: #ff7854;
                    bottom: -50px;
                    right: -50px;
                    animation: float 8s infinite alternate-reverse;
                }

                .blob-3 {
                    width: 250px;
                    height: 250px;
                    background: #c83b5d;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation: float 12s infinite alternate;
                }

                @keyframes float {
                    from { transform: translate(0, 0); }
                    to { transform: translate(30px, 30px); }
                }

                .login-content {
                    width: 100%;
                    max-width: 400px;
                    padding: 20px;
                }

                .login-card {
                    padding: 40px 30px;
                    border-radius: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                }

                .login-logo-container {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(45deg, #ff4458, #ff7854);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    box-shadow: 0 10px 30px rgba(255, 68, 88, 0.3);
                }

                .login-title {
                    font-size: 36px;
                    font-weight: 900;
                    letter-spacing: -2px;
                    margin: 0;
                    background: linear-gradient(to right, #fff, #888);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .login-subtitle {
                    color: #888;
                    font-size: 14px;
                    margin-top: 8px;
                }

                .login-tabs {
                    display: flex;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 4px;
                    border-radius: 14px;
                    margin: 24px 0;
                }

                .login-tab {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    background: none;
                    color: #888;
                    font-weight: 700;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .login-tab.active {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    text-align: left;
                }

                .input-group label {
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #555;
                    margin-left: 4px;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: #555;
                }

                .input-wrapper input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 14px 16px 14px 48px;
                    color: #fff;
                    font-size: 15px;
                    transition: all 0.3s;
                }

                .input-wrapper input:focus {
                    outline: none;
                    border-color: #ff4458;
                    background: rgba(255, 255, 255, 0.08);
                }

                .password-toggle {
                    position: absolute;
                    right: 16px;
                    background: none;
                    border: none;
                    color: #555;
                    cursor: pointer;
                }

                .login-submit-btn {
                    margin-top: 10px;
                    padding: 16px;
                    border-radius: 18px;
                    border: none;
                    background: linear-gradient(45deg, #ff4458, #ff7854);
                    color: #fff;
                    font-weight: 800;
                    font-size: 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                    box-shadow: 0 10px 20px rgba(255, 68, 88, 0.2);
                }

                .login-submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(255, 68, 88, 0.3);
                }

                .login-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .login-divider {
                    position: relative;
                    margin: 30px 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .login-divider::before,
                .login-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                }

                .login-divider span {
                    padding: 0 16px;
                    color: #555;
                    font-size: 12px;
                    text-transform: uppercase;
                    font-weight: 700;
                }

                .social-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .social-btn {
                    padding: 12px;
                    border-radius: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .social-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .login-footer {
                    margin-top: 32px;
                    color: #555;
                    font-size: 11px;
                    line-height: 1.6;
                }

                .login-footer a {
                    color: #888;
                    text-decoration: none;
                    font-weight: 700;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
