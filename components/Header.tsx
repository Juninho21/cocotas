'use client';

import React from 'react';
import { Flame } from 'lucide-react';

export default function Header() {
    return (
        <header className="header glass" style={{ justifyContent: 'center' }}>
            <div className="logo">
                <div className="logo-icon">
                    <Flame size={20} fill="currentColor" />
                </div>
                <span>cocotas</span>
            </div>
        </header>
    );
}
