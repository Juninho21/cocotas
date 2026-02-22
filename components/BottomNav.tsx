'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Heart, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function BottomNav() {
    const pathname = usePathname();
    const [likesCount, setLikesCount] = useState(0);
    const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000000';

    useEffect(() => {
        const fetchLikesCount = async () => {
            try {
                // Busca quem curtiu o usuário (Received)
                const { data: incomingSwipes } = await supabase
                    .from('swipes')
                    .select('swiper_id')
                    .eq('swiped_id', CURRENT_USER_ID)
                    .eq('direction', 'right');

                // Busca quem o usuário já interagiu (para não contar curtidas que viraram matches ou já foram vistas)
                const { data: mySwipes } = await supabase
                    .from('swipes')
                    .select('swiped_id')
                    .eq('swiper_id', CURRENT_USER_ID);

                const mySwipedIds = new Set(mySwipes?.map(s => s.swiped_id) || []);
                const finalLikes = incomingSwipes?.filter(l => !mySwipedIds.has(l.swiper_id)) || [];

                // Se não houver curtidas no banco, usamos o mock (Sofia, Valentina, Mariana, Juliana = 4)
                setLikesCount(finalLikes.length > 0 ? finalLikes.length : 4);
            } catch (err) {
                console.error('Erro ao buscar contador de curtidas:', err);
                setLikesCount(4); // Fallback para o mock
            }
        };

        fetchLikesCount();
    }, []);

    const navItems = [
        { icon: Flame, label: 'Deslizar', href: '/', id: 'swipes' },
        { icon: Heart, label: 'Curtidas', href: '/matches', id: 'matches', badge: likesCount },
        { icon: MessageSquare, label: 'Chat', href: '/messages', id: 'messages' },
        { icon: User, label: 'Perfil', href: '/profile', id: 'profile' },
    ];

    return (
        <nav className="bottom-navbar">
            <div className="bottom-navbar-container">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`nav-btn ${isActive ? 'active' : ''}`}
                        >
                            <div className="icon-wrapper">
                                <item.icon
                                    size={28}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    fill={isActive ? "currentColor" : "none"}
                                />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="gold-badge">{item.badge}</span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
