'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import BottomNav from '@/components/BottomNav';
import {
    Settings as SettingsIcon, Edit3, Camera, X, Plus, ChevronLeft,
    Music, Moon, GraduationCap, Baby, MessageCircle,
    Heart, Dog, GlassWater as Wine, Cigarette, Dumbbell, AtSign, MapPin,
    CheckCircle, Loader, User
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

// ─── Sub-componentes fora do escopo principal (evita perda de foco) ──────────

const SectionHeader = ({ title, badge }: { title: string; badge?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{title}</h2>
        {badge && (
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#1786ff', background: 'rgba(23, 134, 255, 0.1)', padding: '2px 8px', borderRadius: '100px' }}>
                {badge}
            </span>
        )}
    </div>
);

const EditableListItem = ({
    icon: Icon, label, field, profileData, updateField, color = '#8e8e93'
}: {
    icon: any; label: string; field: string;
    profileData: any; updateField: (f: string, v: any) => void; color?: string;
}) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icon size={20} color={color} />
            <span style={{ fontSize: '16px', fontWeight: '700' }}>{label}</span>
        </div>
        <input
            value={profileData[field] || ''}
            onChange={(e) => updateField(field, e.target.value)}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '14px', textAlign: 'right', outline: 'none', width: '130px', cursor: 'text' }}
            placeholder="Toque para editar"
        />
    </div>
);

const ControlToggle = ({
    label, field, profileData, updateField
}: {
    label: string; field: string; profileData: any; updateField: (f: string, v: any) => void;
}) => {
    const active = profileData[field];
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: '16px', fontWeight: '700' }}>{label}</span>
            <div
                onClick={() => updateField(field, !active)}
                style={{
                    width: '44px', height: '24px', flexShrink: 0,
                    backgroundColor: active ? '#1786ff' : '#3a3a3c',
                    borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                }}>
                <div style={{
                    width: '18px', height: '18px', backgroundColor: '#fff', borderRadius: '50%',
                    position: 'absolute', top: '3px', left: active ? '23px' : '3px',
                    transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }} />
            </div>
        </div>
    );
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null, null]);

    const [profileData, setProfileData] = useState({
        name: '',
        age: 25,
        city: '',
        bio: '',
        interests: '',
        intention: '',
        musicalStyle: '',
        gender: '',
        orientation: '',
        hideAge: false,
        hideCity: false,
        sign: '',
        education: '',
        family: '',
        communication: '',
        loveLanguage: '',
        pets: '',
        drink: '',
        smoke: '',
        exercise: '',
        social: '',
        preference: 'Todos',
    });

    const { user } = useAuth();

    // ── Carregar dados do Supabase ao montar ──────────────────────────────────
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setProfileData({
                        name: data.full_name || '',
                        age: data.age || 25,
                        city: data.city || '',
                        bio: data.bio || '',
                        interests: data.interests || '',
                        intention: data.intention || '',
                        musicalStyle: data.musical_style || '',
                        gender: data.gender || '',
                        orientation: data.orientation || '',
                        hideAge: data.hide_age || false,
                        hideCity: data.hide_city || false,
                        sign: data.sign || '',
                        education: data.education || '',
                        family: data.family || '',
                        communication: data.communication || '',
                        loveLanguage: data.love_language || '',
                        pets: data.pets || '',
                        drink: data.drink || '',
                        smoke: data.smoke || '',
                        exercise: data.exercise || '',
                        social: data.social || '',
                        preference: data.preference || 'Todos',
                    });

                    if (data.images && data.images.length > 0) {
                        const photoSlots: (string | null)[] = [...data.images];
                        while (photoSlots.length < 6) photoSlots.push(null);
                        setPhotos(photoSlots.slice(0, 6));
                    }
                }
            } catch (err: any) {
                console.error('Erro ao carregar perfil:', err?.message || err);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    // ── Salvar dados no Supabase ──────────────────────────────────────────────
    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const validPhotos = photos.filter(Boolean) as string[];

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: profileData.name,
                    age: profileData.age,
                    city: profileData.city,
                    bio: profileData.bio,
                    interests: profileData.interests,
                    intention: profileData.intention,
                    musical_style: profileData.musicalStyle,
                    gender: profileData.gender,
                    orientation: profileData.orientation,
                    hide_age: profileData.hideAge,
                    hide_city: profileData.hideCity,
                    sign: profileData.sign,
                    education: profileData.education,
                    family: profileData.family,
                    communication: profileData.communication,
                    love_language: profileData.loveLanguage,
                    pets: profileData.pets,
                    drink: profileData.drink,
                    smoke: profileData.smoke,
                    exercise: profileData.exercise,
                    social: profileData.social,
                    preference: profileData.preference,
                    images: validPhotos,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                setIsEditing(false);
            }, 1500);
        } catch (err: any) {
            console.error('Erro ao salvar perfil:', err?.message || err);
            alert('Ops! Erro ao salvar: ' + (err?.message || 'tente novamente.'));
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = useCallback((field: string, value: any) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleAddPhoto = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newPhoto = event.target?.result as string;
                setPhotos(prev => {
                    const nextEmpty = prev.indexOf(null);
                    if (nextEmpty !== -1) {
                        const updated = [...prev];
                        updated[nextEmpty] = newPhoto;
                        return updated;
                    }
                    return prev;
                });
            };
            reader.readAsDataURL(file);
        }
        // Limpar para permitir re-upload do mesmo arquivo
        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => {
            const updated = [...prev];
            updated[index] = null;
            const filtered: (string | null)[] = updated.filter(p => p !== null);
            while (filtered.length < 6) filtered.push(null);
            return filtered;
        });
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid #1c1c1e', borderTopColor: '#1786ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#8e8e93', fontSize: '14px', fontWeight: '700' }}>Carregando perfil...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </main>
        );
    }

    // ── Tela de edição ────────────────────────────────────────────────────────
    if (isEditing) {
        return (
            <main style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', paddingBottom: '120px' }}>
                {/* Header */}
                <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#000', borderBottom: '1px solid #1c1c1e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
                        <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#1786ff', cursor: 'pointer', padding: '4px' }}>
                            <ChevronLeft size={28} />
                        </button>
                        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '800', marginRight: '28px' }}>Editar perfil</h1>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', padding: '0 20px' }}>
                        {(['edit', 'preview'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1, padding: '14px', border: 'none', background: 'none',
                                    color: activeTab === tab ? '#fff' : '#8e8e93',
                                    fontWeight: '800', fontSize: '15px',
                                    borderBottom: activeTab === tab ? '2px solid #1786ff' : '2px solid transparent',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                {tab === 'edit' ? 'Editar' : 'Visualizar'}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '0 20px' }}>
                    {activeTab === 'edit' ? (
                        <>
                            {/* Foto Section */}
                            <SectionHeader title="Mídia" />
                            <p style={{ color: '#8e8e93', fontSize: '14px', marginBottom: '16px' }}>Adicione até 6 fotos.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                                {photos.map((photo, index) => (
                                    <div key={index} style={{ position: 'relative', aspectRatio: '1/1.4', borderRadius: '12px', background: '#1c1c1e', overflow: 'hidden', border: photo ? 'none' : '2px dashed rgba(255,255,255,0.1)' }}>
                                        {photo ? (
                                            <>
                                                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button onClick={() => removePhoto(index)} style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '50%', padding: '5px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <X size={13} strokeWidth={3} />
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={handleAddPhoto} style={{ width: '100%', height: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg,#1786ff,#00c2ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                    <Plus size={18} strokeWidth={3} />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Dados Básicos */}
                            <SectionHeader title="Informações Básicas" />
                            <div style={{ backgroundColor: '#1c1c1e', borderRadius: '16px', padding: '0 16px', marginBottom: '12px' }}>
                                <EditableListItem icon={User} label="Nome" field="name" profileData={profileData} updateField={updateField} />
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '20px' }}>🎂</span>
                                        <span style={{ fontSize: '16px', fontWeight: '700' }}>Idade</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={profileData.age}
                                        onChange={(e) => updateField('age', parseInt(e.target.value) || '')}
                                        style={{ background: 'none', border: 'none', color: '#fff', fontSize: '14px', textAlign: 'right', outline: 'none', width: '130px', cursor: 'text' }}
                                        min="18"
                                        max="100"
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <SectionHeader title="Sobre mim" />
                            <div style={{ padding: '16px', backgroundColor: '#1c1c1e', borderRadius: '16px', position: 'relative' }}>
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => updateField('bio', e.target.value)}
                                    maxLength={500}
                                    style={{ width: '100%', background: 'none', border: 'none', color: '#fff', fontSize: '15px', lineHeight: '1.6', minHeight: '120px', outline: 'none', resize: 'none', cursor: 'text' }}
                                    placeholder="Escreva algo sobre você..."
                                />
                                <span style={{ position: 'absolute', bottom: '12px', right: '16px', color: '#8e8e93', fontSize: '12px' }}>{profileData.bio.length}/500</span>
                            </div>

                            {/* Interesses */}
                            <SectionHeader title="Interesses" />
                            <div style={{ padding: '16px', backgroundColor: '#1c1c1e', borderRadius: '16px' }}>
                                <input
                                    value={profileData.interests}
                                    onChange={(e) => updateField('interests', e.target.value)}
                                    style={{ width: '100%', background: 'none', border: 'none', color: '#fff', fontSize: '15px', outline: 'none', cursor: 'text' }}
                                    placeholder="ex: Música, Viagens, Esportes"
                                />
                            </div>

                            {/* Intenção */}
                            <SectionHeader title="Intenção" />
                            <div style={{ padding: '16px', backgroundColor: '#1c1c1e', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ fontSize: '22px' }}>👁️</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', color: '#8e8e93', marginBottom: '4px' }}>Tô procurando...</div>
                                    <input
                                        value={profileData.intention}
                                        onChange={(e) => updateField('intention', e.target.value)}
                                        style={{ width: '100%', background: 'none', border: 'none', color: '#fff', fontSize: '15px', fontWeight: '700', outline: 'none', cursor: 'text' }}
                                        placeholder="Relacionamento, amizade..."
                                    />
                                </div>
                            </div>

                            {/* Sexo */}
                            <SectionHeader title="Sexo" />
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                {['Homem', 'Mulher'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => updateField('gender', g)}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                            backgroundColor: profileData.gender === g ? '#1786ff' : '#1c1c1e',
                                            color: '#fff', fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}>
                                        {g}
                                    </button>
                                ))}
                            </div>

                            {/* Orientação */}
                            <SectionHeader title="Orientação sexual" />
                            <div style={{ padding: '16px', backgroundColor: '#1c1c1e', borderRadius: '16px' }}>
                                <input
                                    value={profileData.orientation}
                                    onChange={(e) => updateField('orientation', e.target.value)}
                                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', fontWeight: '700', outline: 'none', width: '100%', cursor: 'text' }}
                                    placeholder="Sua orientação"
                                />
                            </div>

                            {/* Controles */}
                            <SectionHeader title="Controle seu perfil" />
                            <div style={{ backgroundColor: '#1c1c1e', borderRadius: '16px', padding: '0 16px' }}>
                                <ControlToggle label="Não mostrar minha idade" field="hideAge" profileData={profileData} updateField={updateField} />
                                <ControlToggle label="Não mostrar minha cidade" field="hideCity" profileData={profileData} updateField={updateField} />
                            </div>

                            {/* Preferência de busca */}
                            <SectionHeader title="Mostrar" />
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                {['Homens', 'Mulheres', 'Todos'].map(pref => (
                                    <button
                                        key={pref}
                                        onClick={() => updateField('preference', pref)}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                            backgroundColor: profileData.preference === pref ? '#1786ff' : '#1c1c1e',
                                            color: '#fff', fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}>
                                        {pref}
                                    </button>
                                ))}
                            </div>

                            {/* Cidade */}
                            <SectionHeader title="Cidade onde vive" />
                            <div style={{ padding: '16px', backgroundColor: '#1c1c1e', borderRadius: '16px' }}>
                                <input
                                    value={profileData.city}
                                    onChange={(e) => updateField('city', e.target.value)}
                                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', fontWeight: '700', outline: 'none', width: '100%', cursor: 'text' }}
                                    placeholder="Sua cidade"
                                />
                            </div>

                            {/* Mais sobre mim */}
                            <SectionHeader title="Mais sobre mim" />
                            <div style={{ backgroundColor: '#1c1c1e', borderRadius: '16px', padding: '0 16px' }}>
                                <EditableListItem icon={Moon} label="Signo" field="sign" profileData={profileData} updateField={updateField} />
                                <EditableListItem icon={GraduationCap} label="Formação" field="education" profileData={profileData} updateField={updateField} />
                                <EditableListItem icon={Baby} label="Família" field="family" profileData={profileData} updateField={updateField} />
                                <EditableListItem icon={MessageCircle} label="Comunicação" field="communication" profileData={profileData} updateField={updateField} />
                                <EditableListItem icon={Heart} label="Linguagem do amor" field="loveLanguage" profileData={profileData} updateField={updateField} />
                                <EditableListItem icon={Music} label="Estilo musical" field="musicalStyle" profileData={profileData} updateField={updateField} />
                            </div>

                            {/* Estilo de vida */}
                            <SectionHeader title="Estilo de vida" />
                            <div style={{ backgroundColor: '#1c1c1e', borderRadius: '16px', padding: '0 16px' }}>
                                <EditableListItem icon={Dog} label="Pets" field="pets" profileData={profileData} updateField={updateField} />
                                <EditableListItem icon={Wine} label="Bebida" field="drink" profileData={profileData} updateField={updateField} />
                                <EditableListItem icon={Cigarette} label="Você fuma?" field="smoke" profileData={profileData} updateField={updateField} />
                                <EditableListItem icon={Dumbbell} label="Atividade física" field="exercise" profileData={profileData} updateField={updateField} />
                                <EditableListItem icon={AtSign} label="Redes sociais" field="social" profileData={profileData} updateField={updateField} />
                            </div>
                        </>
                    ) : (
                        /* Preview Mode */
                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.3', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#1c1c1e' }}>
                                {photos[0] && <img src={photos[0]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                                    <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '0 0 4px' }}>{profileData.name || 'Sem nome'}{!profileData.hideAge ? `, ${profileData.age}` : ''}</h1>
                                    {!profileData.hideCity && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ddd', fontSize: '14px' }}>
                                            <MapPin size={14} />
                                            <span>{profileData.city}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ padding: '0 4px' }}>
                                {profileData.bio && (
                                    <>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>Sobre mim</h3>
                                        <p style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.6', marginBottom: '24px' }}>{profileData.bio}</p>
                                    </>
                                )}

                                {profileData.interests && (
                                    <>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Interesses</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {profileData.interests.split(',').map((tag, i) => tag.trim() && (
                                                <span key={i} style={{ padding: '6px 14px', borderRadius: '100px', border: '1px solid #1786ff', color: '#1786ff', fontSize: '13px', fontWeight: '700' }}>
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

                {/* Botão Salvar */}
                <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 101, width: '100%', maxWidth: '380px', padding: '0 20px' }}>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            width: '100%', padding: '16px', borderRadius: '100px', border: 'none',
                            background: saveSuccess
                                ? 'linear-gradient(45deg,#21d07c,#00b360)'
                                : 'linear-gradient(45deg,#1786ff,#00c2ff)',
                            color: '#fff', fontWeight: '900', fontSize: '16px',
                            boxShadow: saveSuccess
                                ? '0 10px 30px rgba(33,208,124,0.4)'
                                : '0 10px 30px rgba(23, 134, 255, 0.4)',
                            textTransform: 'uppercase', cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            opacity: isSaving ? 0.85 : 1, transition: 'background 0.3s, box-shadow 0.3s'
                        }}>
                        {isSaving
                            ? <><Loader size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Salvando...</>
                            : saveSuccess
                                ? <><CheckCircle size={18} /> Salvo com sucesso!</>
                                : 'Salvar Alterações'}
                    </button>
                </div>

                <style>{`@keyframes spin { to { transform: rotate(360deg); } } textarea::-webkit-scrollbar { display: none; } input:focus, textarea:focus { color: #fff !important; }`}</style>
            </main>
        );
    }

    // ── Tela de perfil (visualização) ─────────────────────────────────────────
    return (
        <main style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '80px 32px 32px' }}>

                {/* Foto de perfil */}
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: '#1c1c1e', padding: '4px', border: '2px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                            <img
                                src={photos.find(Boolean) || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400'}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{ position: 'absolute', bottom: '5px', right: '5px', width: '40px', height: '40px', background: '#fff', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', cursor: 'pointer' }}>
                        <Camera size={20} />
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 4px' }}>
                        {profileData.name || 'Seu Perfil'}{!profileData.hideAge ? `, ${profileData.age}` : ''}
                    </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8e8e93', fontSize: '14px', marginBottom: '40px' }}>
                    <MapPin size={14} color="#21d07c" />
                    <span>{!profileData.hideCity ? (profileData.city || 'Sem cidade') : 'Cidade oculta'}</span>
                </div>

                {/* Botões de controle */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: '100%', maxWidth: '360px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => setIsEditing(true)} style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1c1c1e', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8e8e93', cursor: 'pointer' }}>
                            <SettingsIcon size={22} />
                        </button>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ajustes</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transform: 'translateY(-10px)' }}>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(45deg,#1786ff,#00c2ff)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 20px rgba(23, 134, 255, 0.3)', cursor: 'pointer' }}>
                            <Camera size={28} />
                        </button>
                        <span style={{ fontSize: '12px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mídia</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1c1c1e', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8e8e93', cursor: 'pointer' }}>
                            <Edit3 size={22} />
                        </button>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Editar</span>
                    </div>
                </div>
            </div>

            <BottomNav />

            <style>{`
                button { transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                button:active { transform: scale(0.93); }
                textarea::-webkit-scrollbar { display: none; }
                input:focus, textarea:focus { color: #fff !important; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </main>
    );
}
