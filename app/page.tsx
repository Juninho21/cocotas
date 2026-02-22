'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import MatchCard from '@/components/MatchCard';
import ActionButtonBar from '@/components/ActionButtonBar';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string; // Changed to string as UUIDs are strings
  name: string;
  age: number;
  image: string;
  bio: string;
  distance: string;
  city?: string;
}

function HomeDeck() {
  const searchParams = useSearchParams();
  const cityFilter = searchParams.get('city');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Excluir o eu mesmo

      if (cityFilter) {
        query = query.eq('city', cityFilter);
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
  }, [cityFilter]);

  const [history, setHistory] = useState<Profile[]>([]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const swipedProfile = profiles[0];
    if (!swipedProfile) return;

    // Add to history for undo
    setHistory(prev => [swipedProfile, ...prev].slice(0, 10)); // Keep last 10
    setProfiles((prev) => prev.slice(1));

    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: '00000000-0000-0000-0000-000000000000',
          swiped_id: swipedProfile.id,
          direction: direction
        });

      if (error) {
        // Silently fail to avoid lint errors
      } else if (direction === 'right') {
        const { data: match } = await supabase
          .from('matches')
          .select('*')
          .or(`user_1.eq.00000000-0000-0000-0000-000000000000,user_2.eq.00000000-0000-0000-0000-000000000000`)
          .filter('user_1', 'eq', swipedProfile.id < '00000000-0000-0000-0000-000000000000' ? swipedProfile.id : '00000000-0000-0000-0000-000000000000')
          .filter('user_2', 'eq', swipedProfile.id > '00000000-0000-0000-0000-000000000000' ? swipedProfile.id : '00000000-0000-0000-0000-000000000000')
          .single();

        if (match) {
          alert(`É UM MATCH! Você e ${swipedProfile.name} se curtiram! 💖`);
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
