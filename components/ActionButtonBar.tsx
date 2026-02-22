'use client';

import React from 'react';
import { RotateCcw, X, Heart } from 'lucide-react';

interface ActionButtonBarProps {
    onSwipe: (direction: 'left' | 'right') => void;
    onUndo?: () => void;
}

export default function ActionButtonBar({ onSwipe, onUndo }: ActionButtonBarProps) {
    return (
        <div className="action-bar" style={{ justifyContent: 'center', gap: '15px', padding: '0 10px' }}>
            {/* Botão NOPE (Esquerda) */}
            <button
                onClick={() => onSwipe('left')}
                className="round-btn btn-large btn-nope"
                title="Não"
            >
                <X size={32} strokeWidth={3} />
            </button>

            {/* Botão BACK (Meio e Menor) */}
            <button
                onClick={onUndo}
                className="round-btn btn-undo"
                style={{ width: '42px', height: '42px' }}
                title="Voltar"
            >
                <RotateCcw size={18} />
            </button>

            {/* Botão LIKE (Direita) */}
            <button
                onClick={() => onSwipe('right')}
                className="round-btn btn-large btn-like"
                title="Gostei"
            >
                <Heart size={32} fill="currentColor" />
            </button>
        </div>
    );
}
