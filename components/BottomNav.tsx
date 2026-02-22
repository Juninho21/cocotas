'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Heart, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchLikesCount = async () => {
            try {
                // Forçando a contagem real e ignorando cache se possível
                const { count, error } = await supabase
                    .from('user_swipes')
                    .select('id', { count: 'exact', head: true })
                    .eq('swiped_id', user.id)
                    .eq('direction', 'right');

                if (error) {
                    console.error('Erro no contador:', error);
                    return;
                }

                console.log('Likes encontrados para o usuário:', user.id, 'Total:', count);
                setLikesCount(count || 0);
            } catch (err) {
                console.error('Erro no BottomNav:', err);
            }
        };

        fetchLikesCount();

        // Realtime para a tabela 'user_swipes'
        const channel = supabase
            .channel(`public:user_swipes:swiped_id=eq.${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'user_swipes',
                    filter: `swiped_id=eq.${user.id}`
                },
                (payload: any) => {
                    console.log('RECEBIDO VIA REALTIME:', payload);
                    if (payload.new.direction === 'right') {
                        setLikesCount(prev => prev + 1);
                    }
                }
            )
            .subscribe((status) => {
                console.log('Status da inscrição Realtime:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

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
                                    <span
                                        className="gold-badge"
                                        style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '-8px',
                                            backgroundColor: '#f2ca5a',
                                            color: '#000',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            minWidth: '18px',
                                            height: '18px',
                                            padding: '0 4px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            zIndex: 10
                                        }}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
