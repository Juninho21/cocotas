'use client';

import React from 'react';
import { Flame, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <header className="header glass" style={{ justifyContent: 'space-between' }}>
            <div className="logo">
                <div className="logo-icon">
                    <Flame size={20} fill="currentColor" />
                </div>
                <span>cocotas</span>
            </div>

            <button
                onClick={handleLogout}
                title="Sair"
                style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8e8e93',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.color = '#1786ff';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(23, 134, 255, 0.4)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(23, 134, 255, 0.1)';
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.color = '#8e8e93';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                }}
            >
                <LogOut size={16} />
            </button>
        </header>
    );
}
