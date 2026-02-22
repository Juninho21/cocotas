'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import {
    Send,
    ChevronLeft,
    Shield,
    Flame,
    Heart,
    CheckCircle2,
    MoreVertical,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

// Initial Mock Data
const INITIAL_NEW_MATCHES = [
    { id: 'm1', name: 'Valeria', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000', verified: false },
    { id: 'm2', name: 'Tamires', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000', verified: true },
    { id: 'm3', name: 'Andressa', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000', verified: false },
    { id: 'm4', name: 'Beatriz', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000', verified: false },
];

const INITIAL_RECENT_CHATS = [
    { id: 'c1', name: 'Suelen p', lastMsg: 'Estou bem', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000', verified: false, time: '20:05' },
    { id: 'c2', name: 'Lidiane', lastMsg: '80km', image: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?q=80&w=1000', verified: true, time: '19:30' },
    { id: 'c3', name: 'Juli', lastMsg: 'Oi', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000', verified: false, time: 'Ontem' },
];

function ChatContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');

    const [newMatches, setNewMatches] = useState(INITIAL_NEW_MATCHES);
    const [recentChats, setRecentChats] = useState(INITIAL_RECENT_CHATS);
    const [messages, setMessages] = useState<{ id: string, sender_id: string, content: string, time: string }[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000000';

    useEffect(() => {
        if (userId) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Find existing conversation last message if any
            const existingChat = recentChats.find(c => c.id === userId);

            setMessages([
                {
                    id: '1',
                    sender_id: userId,
                    content: existingChat?.lastMsg || `Oi! Vi que deu match! 😊`,
                    time: timeStr
                }
            ]);
        }
    }, [userId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !userId) return;

        const sentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const content = newMessage.trim();

        const msg = {
            id: Date.now().toString(),
            sender_id: CURRENT_USER_ID,
            content: content,
            time: sentTime
        };

        setMessages(prev => [...prev, msg]);
        setNewMessage('');

        // LOGIC: Move from New Matches to Recent Chats if first message
        const isNewMatch = newMatches.find(m => m.id === userId);
        if (isNewMatch) {
            // Remove from new matches
            setNewMatches(prev => prev.filter(m => m.id !== userId));
            // Add to recent chats
            const newChat = {
                id: isNewMatch.id,
                name: isNewMatch.name,
                image: isNewMatch.image,
                verified: isNewMatch.verified,
                lastMsg: content,
                time: 'Agora'
            };
            setRecentChats(prev => [newChat, ...prev]);
        } else {
            // Just update last message in recent chats
            setRecentChats(prev => prev.map(chat =>
                chat.id === userId ? { ...chat, lastMsg: content, time: 'Agora' } : chat
            ));
        }

        setTimeout(() => {
            const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const replyContent = "Que legal! Estava esperando você mandar mensagem.";

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender_id: userId,
                content: replyContent,
                time: replyTime
            }]);

            // Update recent chats with bot reply
            setRecentChats(prev => prev.map(chat =>
                chat.id === userId ? { ...chat, lastMsg: replyContent, time: 'Agora' } : chat
            ).sort((a, b) => (a.id === userId ? -1 : 1))); // Move active chat to top
        }, 1500);
    };

    // --- VIEW: LIST OF CHATS ---
    if (!userId) {
        return (
            <div style={{ padding: '0 16px', marginTop: '80px', paddingBottom: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>Chat</h1>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ opacity: 0.6 }}><Shield size={24} /></div>
                        <div style={{ opacity: 0.6 }}><Flame size={24} /></div>
                    </div>
                </div>

                {newMatches.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Novos Matches</h2>
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                            {newMatches.map((match) => (
                                <Link
                                    key={match.id}
                                    href={`/messages?userId=${match.id}&userName=${match.name}`}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '95px', textDecoration: 'none' }}
                                >
                                    <div style={{ width: '95px', position: 'relative' }}>
                                        <div style={{ width: '95px', height: '115px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#222', position: 'relative' }}>
                                            <img src={match.image} alt={match.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#000', padding: '4px', borderRadius: '50%' }}>
                                                <div style={{ backgroundColor: '#d4af37', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Heart size={14} fill="#111" color="#111" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{match.name}</span>
                                        {match.verified && <CheckCircle2 size={13} fill="#3bb7db" color="#fff" />}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Mensagens</h2>
                        {recentChats.length > 0 && (
                            <div style={{ backgroundColor: '#ff4458', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900' }}>
                                {recentChats.length}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {recentChats.map((chat) => (
                            <Link
                                key={chat.id}
                                href={`/messages?userId=${chat.id}&userName=${chat.name}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', textDecoration: 'none' }}
                            >
                                <div style={{ width: '75px', height: '75px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#222' }}>
                                    <img src={chat.image} alt={chat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1, borderBottom: '1px solid #222', paddingBottom: '12px', height: '75px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{chat.name}</span>
                                        {chat.verified && <CheckCircle2 size={16} fill="#3bb7db" color="#fff" />}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#888', fontSize: '14px' }}>
                                        <ArrowLeft size={14} />
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{chat.lastMsg}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: ACTIVE CHAT CONTENT ---
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #111', marginTop: '64px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/messages" style={{ color: '#fff' }}><ChevronLeft size={28} /></Link>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden' }}>
                        <img
                            src={recentChats.find(c => c.id === userId)?.image || newMatches.find(m => m.id === userId)?.image || `https://ui-avatars.com/api/?name=${userName}&background=fd297b&color=fff`}
                            alt={userName!}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '18px' }}>{userName}</span>
                </div>
                <div style={{ opacity: 0.6 }}><MoreVertical size={24} /></div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', scrollbarWidth: 'none' }}>
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <span style={{ fontSize: '12px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Hoje</span>
                </div>
                {messages.map(msg => (
                    <div key={msg.id} style={{ alignSelf: msg.sender_id === CURRENT_USER_ID ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '20px',
                            fontSize: '15px',
                            backgroundColor: msg.sender_id === CURRENT_USER_ID ? '#2c8dfc' : '#222',
                            borderBottomRightRadius: msg.sender_id === CURRENT_USER_ID ? '4px' : '20px',
                            borderBottomLeftRadius: msg.sender_id === CURRENT_USER_ID ? '20px' : '4px',
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid #111', display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '100px' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite uma mensagem"
                    style={{ flex: 1, backgroundColor: '#111', border: '1px solid #222', borderRadius: '24px', padding: '12px 20px', color: '#fff', outline: 'none' }}
                />
                <button type="submit" disabled={!newMessage.trim()} style={{ backgroundColor: newMessage.trim() ? '#2c8dfc' : '#111', color: '#fff', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'block' }}>
            <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Carregando...</div>}>
                <ChatContent />
            </Suspense>
            <BottomNav />
        </main>
    );
}
