'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import MatchCard from '@/components/MatchCard';
import ActionButtonBar from '@/components/ActionButtonBar';
import { Flame, MapPin, MessageSquare, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

// Componente de Animação de Match
const MatchOverlay = ({ profile, userProfile, onClose }: { profile: any, userProfile: any, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.96)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px'
      }}
    >
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '48px', fontWeight: '900', color: '#fff', marginBottom: '8px', fontStyle: 'italic', background: 'linear-gradient(135deg, #1786ff 0%, #00c2ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Deu Méti!
        </motion.h1>
        <p style={{ color: '#fff', fontSize: '18px', marginBottom: '40px' }}>Você e {profile.name} se curtiram!</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '50px', position: 'relative' }}>
          <motion.div
            initial={{ x: -100, rotate: -15, opacity: 0 }}
            animate={{ x: 0, rotate: -5, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            style={{ width: '130px', height: '180px', borderRadius: '15px', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 2 }}
          >
            <img src={userProfile?.images?.[0] || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
            style={{ position: 'absolute', zIndex: 10, background: '#fff', borderRadius: '50%', padding: '12px', boxShadow: '0 0 30px rgba(23, 134, 255, 0.5)' }}
          >
            <Heart fill="#1786ff" color="#1786ff" size={32} />
          </motion.div>

          <motion.div
            initial={{ x: 100, rotate: 15, opacity: 0 }}
            animate={{ x: 0, rotate: 5, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            style={{ width: '130px', height: '180px', borderRadius: '15px', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 2 }}
          >
            <img src={profile.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
          <button
            onClick={() => window.location.href = `/messages?userId=${profile.id}&userName=${profile.name}`}
            style={{ padding: '16px', borderRadius: '100px', border: 'none', background: 'linear-gradient(135deg, #1786ff 0%, #00c2ff 100%)', color: '#fff', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <MessageSquare size={20} /> Enviar Mensagem
          </button>
          <button
            onClick={onClose}
            style={{ padding: '16px', borderRadius: '100px', border: '2px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}
          >
            Continuar Deslizando
          </button>
        </div>
      </motion.div>

      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '40px', right: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '10px', color: '#fff', cursor: 'pointer' }}
      >
        <X size={24} />
      </button>
    </motion.div>
  );
};

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  distance: string;
  city?: string;
}

function HomeDeck() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const cityFilter = searchParams.get('city');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  const fetchProfiles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Busca dados do próprio usuário para o match overlay
      const { data: myData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserData(myData);
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id); // Excluir o eu mesmo

      if (cityFilter) {
        query = query.eq('city', cityFilter);
      }

      // Filtro de preferência
      if (myData.preference === 'Homens') {
        query = query.eq('gender', 'Homem');
      } else if (myData.preference === 'Mulheres') {
        query = query.eq('gender', 'Mulher');
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedProfiles = data.map((p: any) => ({
          id: p.id,
          name: p.full_name,
          age: p.age,
          image: p.images[0] || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000&auto=format&fit=crop',
          bio: p.bio,
          distance: p.distance.toString(),
          city: p.city
        }));
        setProfiles(formattedProfiles);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [cityFilter, user]);

  const [history, setHistory] = useState<Profile[]>([]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user) return;
    const swipedProfile = profiles[0];
    if (!swipedProfile) return;

    // Add to history for undo
    setHistory(prev => [swipedProfile, ...prev].slice(0, 10)); // Keep last 10
    setProfiles((prev) => prev.slice(1));

    try {
      const { error } = await supabase
        .from('user_swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: swipedProfile.id,
          direction: direction
        });

      if (error) {
        // Silently fail
      } else if (direction === 'right') {
        const { data: match } = await supabase
          .from('matches')
          .select('*')
          .or(`user_1.eq.${user.id},user_2.eq.${user.id}`)
          .filter('user_1', 'eq', swipedProfile.id < user.id ? swipedProfile.id : user.id)
          .filter('user_2', 'eq', swipedProfile.id > user.id ? swipedProfile.id : user.id)
          .single();

        if (match) {
          setMatchData(swipedProfile);
        }
      }
    } catch (err) {
      console.error('Swipe logic failed:', err);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastProfile = history[0];
    if (lastProfile) {
      setProfiles(prev => [lastProfile, ...prev]);
      setHistory(prev => prev.slice(1));
    }
  };

  return (
    <>
      {cityFilter && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[50] bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/20 text-[10px] uppercase font-bold tracking-widest text-white animate-fade-in flex items-center gap-2">
          <span>Filtrando por: {cityFilter}</span>
          <button onClick={() => window.location.href = '/'} className="text-pink-500 ml-1">X</button>
        </div>
      )}

      {/* Botão de Simulação (Temporário) */}
      <button
        onClick={() => profiles[0] && setMatchData(profiles[0])}
        style={{ position: 'fixed', top: '75px', right: '10px', zIndex: 1001, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '5px', fontSize: '10px', cursor: 'pointer' }}
      >
        Simular Match
      </button>

      <div className="card-container">
        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">
              <span className="animate-spin text-pink-500">⏳</span>
            </div>
            <h3>Carregando Cocotas...</h3>
          </div>
        ) : (
          <AnimatePresence>
            {profiles.length > 0 ? (
              [...profiles].reverse().map((profile, index) => {
                const isTop = index === profiles.length - 1;
                return (
                  <MatchCard
                    key={profile.id}
                    profile={profile as any}
                    onSwipe={handleSwipe}
                    isTopCard={isTop}
                  />
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <span>🔍</span>
                </div>
                <h3>Poxa, acabaram os perfis!</h3>
                <p style={{ color: '#888', marginTop: '8px' }}>
                  {cityFilter ? `Não encontramos ninguém em ${cityFilter} no momento.` : 'Tente mudar sua localização ou aumentar seu raio de busca.'}
                </p>
                <button
                  className="reload-btn"
                  onClick={fetchProfiles}
                >
                  Recarregar Galera
                </button>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {matchData && (
          <MatchOverlay
            profile={matchData}
            userProfile={userData}
            onClose={() => {
              // Quando fechar, remove o perfil da lista se ele ainda for o primeiro (importante para simulação)
              setProfiles(prev => {
                if (prev[0]?.id === matchData.id) {
                  return prev.slice(1);
                }
                return prev;
              });
              setMatchData(null);
            }}
          />
        )}
      </AnimatePresence>

      <ActionButtonBar onSwipe={handleSwipe} onUndo={handleUndo} />
    </>
  );
}

export default function Home() {
  return (
    <main>
      <Suspense fallback={<div className="empty-state"><h3>Carregando...</h3></div>}>
        <HomeDeck />
      </Suspense>
      <BottomNav />
    </main>
  );
}
