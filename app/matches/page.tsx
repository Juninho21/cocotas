'use client';

import React, { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import { Star, MapPin, Search, Flame, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';

interface Profile {
    id: string;
    name: string;
    age: number;
    image: string;
    distance?: string;
    online?: boolean;
    info_type?: 'distance' | 'search' | 'online';
    isNew?: boolean;
    swipeId?: string;
}

export default function MatchesPage() {
    const { user } = useAuth();
    const [receivedLikes, setReceivedLikes] = useState<Profile[]>([]);
    const [sentLikes, setSentLikes] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'featured'>('received');

    const fetchLikes = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Buscar quem curtiu o usuário (Received)
            const { data: incomingSwipes } = await supabase.from('user_swipes').select('id, swiper_id').eq('swiped_id', user.id).eq('direction', 'right');
            const { data: mySwipes } = await supabase.from('user_swipes').select('swiped_id').eq('swiper_id', user.id);
            const mySwipedIds = new Set(mySwipes?.map(s => s.swiped_id) || []);
            const incomingLikeIds = incomingSwipes?.map(l => l.swiper_id).filter(id => !mySwipedIds.has(id)) || [];

            if (incomingLikeIds.length > 0) {
                const { data: profiles } = await supabase.from('profiles').select('*').in('id', incomingLikeIds);
                if (profiles) {
                    setReceivedLikes(profiles.map((p, idx) => ({
                        id: p.id,
                        swipeId: incomingSwipes?.find(s => s.swiper_id === p.id)?.id,
                        name: (p.full_name || 'Usuário').split(' ')[0],
                        age: p.age,
                        image: p.images?.[0] || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400',
                        info_type: idx % 3 === 0 ? 'online' : idx % 3 === 1 ? 'distance' : 'search'
                    })));
                }
            } else {
                // Fallback para mock se não houver curtidas reais
                setReceivedLikes([
                    { id: 'r1', name: 'Sofia', age: 24, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000', info_type: 'online' },
                    { id: 'r2', name: 'Valentina', age: 22, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000', info_type: 'distance' },
                    { id: 'r3', name: 'Mariana', age: 26, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000', info_type: 'search' },
                    { id: 'r4', name: 'Juliana', age: 23, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000', info_type: 'online' }
                ]);
            }

            // 2. Buscar quem o usuário curtiu (Sent)
            const { data: sentSwipes } = await supabase.from('user_swipes').select('id, swiped_id').eq('swiper_id', user.id).eq('direction', 'right');
            const sentLikeIds = sentSwipes?.map(s => s.swiped_id) || [];
            if (sentLikeIds.length > 0) {
                const { data: profiles } = await supabase.from('profiles').select('*').in('id', sentLikeIds);
                if (profiles) {
                    setSentLikes(profiles.map((p, idx) => ({
                        id: p.id,
                        swipeId: sentSwipes?.find(s => s.swiped_id === p.id)?.id,
                        name: (p.full_name || 'Usuário').split(' ')[0],
                        age: p.age,
                        image: p.images?.[0] || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400',
                        info_type: idx % 2 === 0 ? 'online' : 'distance'
                    })));
                }
            } else {
                setSentLikes([
                    { id: 's1', name: 'Kétlin', age: 26, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000', info_type: 'online' },
                    { id: 's2', name: 'Lana', age: 25, image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400', info_type: 'distance' }
                ]);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const simulateIncomingLike = async () => {
        if (!user) {
            alert("Você precisa estar logado para simular!");
            return;
        }

        // Usando um ID de bot existente para a simulação
        const BOT_ID = '30363a2d-6afe-4bdd-ba8a-1ef1c3ff1842';

        await supabase.from('user_swipes').insert({
            swiper_id: BOT_ID,
            swiped_id: user.id,
            direction: 'right'
        });

        const newLike: Profile = {
            id: 'sim-' + Date.now(),
            name: 'Luana (Simulada)',
            age: 21,
            image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000',
            info_type: 'online',
            isNew: true
        };
        setActiveTab('received');
        setReceivedLikes(prev => [newLike, ...prev]);

        // Remover flag 'isNew' após 4 segundos para parar a animação de borda
        setTimeout(() => {
            setReceivedLikes(prev => prev.map(l => l.id === newLike.id ? { ...l, isNew: false } : l));
        }, 4000);
    };

    const handleDelete = async (profileId: string, swipeId?: string) => {
        if (!swipeId) {
            setReceivedLikes(prev => prev.filter(p => p.id !== profileId));
            setSentLikes(prev => prev.filter(p => p.id !== profileId));
            return;
        }
        try {
            const { error } = await supabase.from('user_swipes').delete().eq('id', swipeId);
            if (error) throw error;
            setReceivedLikes(prev => prev.filter(p => p.id !== profileId));
            setSentLikes(prev => prev.filter(p => p.id !== profileId));
        } catch (err) {
            console.error('Erro ao deletar:', err);
            alert('Não foi possível remover.');
        }
    };

    useEffect(() => {
        if (user) fetchLikes();
    }, [user]);

    const isDarkMode = false;

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'background 0.3s ease', backgroundColor: '#fff', paddingTop: '64px' }}>
            <div style={{ width: '100%', maxWidth: '390px', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>

                {/* Simulation Button */}
                <button
                    onClick={simulateIncomingLike}
                    style={{ position: 'fixed', top: '75px', right: '10px', zIndex: 1001, background: 'rgba(23, 134, 255, 0.1)', color: '#1786ff', border: '1px solid rgba(23, 134, 255, 0.2)', padding: '5px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Simular Like Recebido
                </button>

                {/* Header Section */}
                <div style={{ paddingTop: '32px', paddingLeft: '20px', paddingRight: '20px', position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#fff' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-0.05em', color: '#111' }}>
                        {activeTab === 'received' ? `${receivedLikes.length} Curtidas` : activeTab === 'sent' ? 'Enviadas' : 'Destaques'}
                    </h1>

                    <div style={{ display: 'flex', borderBottom: '1px solid #f2f2f7', position: 'relative', alignItems: 'center', marginBottom: '8px' }}>
                        <button onClick={() => setActiveTab('received')} style={{ flex: 1, paddingBottom: '16px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'received' ? '#111' : '#8e8e93', transition: 'color 0.2s' }}>Recebidas</button>
                        <button onClick={() => setActiveTab('sent')} style={{ flex: 1, paddingBottom: '16px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'sent' ? '#111' : '#8e8e93', transition: 'color 0.2s' }}>Enviadas</button>
                        <button onClick={() => setActiveTab('featured')} style={{ flex: 1, paddingBottom: '16px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'featured' ? '#111' : '#8e8e93', transition: 'color 0.2s' }}>Top Picks</button>
                        <motion.div
                            style={{ position: 'absolute', bottom: '-1px', height: '3px', backgroundColor: '#1786ff', borderRadius: '3px 3px 0 0' }}
                            animate={{ left: activeTab === 'received' ? '0%' : activeTab === 'sent' ? '33.3%' : '66.6%', width: '33.3%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    </div>
                </div>

                {/* Grid Content */}
                <div style={{ flex: 1, paddingLeft: '12px', paddingRight: '12px', paddingTop: '20px', paddingBottom: '180px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '16px' }}>
                            <div className="animate-spin text-pink-500"><Flame size={32} /></div>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#8e8e93', tracking: '0.1em' }}>CARREGANDO PERFIS...</span>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            <AnimatePresence>
                                {(activeTab === 'received' ? receivedLikes : sentLikes).map((profile) => (
                                    <motion.div
                                        key={profile.id}
                                        initial={profile.isNew ? { scale: 0, opacity: 0 } : false}
                                        animate={{ scale: 1, opacity: 1 }}
                                        layout
                                        className="grid-card-premium"
                                        style={{
                                            position: 'relative',
                                            aspectRatio: '165/225',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            backgroundColor: isDarkMode ? '#1c1c1e' : '#f2f2f7',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            border: profile.isNew ? '3px solid #1786ff' : 'none'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                backgroundImage: `url(${profile.image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                transition: 'transform 0.5s ease'
                                            }}
                                        />

                                        {profile.isNew && (
                                            <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#1786ff', color: '#fff', fontSize: '10px', fontWeight: '900', padding: '4px 8px', borderRadius: '4px', zIndex: 10 }}>NOVO!</div>
                                        )}

                                        {/* Glass Overlay for Text */}
                                        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)' }} />

                                        <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', pointerEvents: 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                                <p style={{ fontWeight: '800', fontSize: '16px', color: '#fff', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                                                    {profile.name}, {profile.age}
                                                </p>
                                            </div>

                                            {profile.info_type === 'online' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <div className="pulse-green" style={{ width: '6px', height: '6px', backgroundColor: '#21d07c', borderRadius: '50%', boxShadow: '0 0 8px #21d07c' }} />
                                                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Online recentemente</span>
                                                </div>
                                            )}
                                            {profile.info_type === 'distance' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={10} color="#fff" fill="white" />
                                                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' }}>Mora em São Paulo</span>
                                                </div>
                                            )}
                                            {profile.info_type === 'search' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Search size={10} color="#fff" strokeWidth={3} />
                                                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' }}>Procurando algo sério</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Botão Deletar */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(profile.id, profile.swipeId);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                zIndex: 10,
                                                backdropFilter: 'blur(4px)'
                                            }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <BottomNav />
            </div>

            <style jsx global>{`
                @keyframes pulse-green {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .pulse-green {
                    animation: pulse-green 2s infinite;
                }
                .grid-card-premium:active {
                    transform: scale(0.98);
                }
            `}</style>
        </main>
    );
}
