'use client';

import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface Profile {
    id: number;
    name: string;
    age: number;
    image: string;
    bio: string;
    distance: string;
}

interface MatchCardProps {
    profile: Profile;
    onSwipe: (direction: 'left' | 'right') => void;
    isTopCard: boolean;
}

export default function MatchCard({ profile, onSwipe, isTopCard }: MatchCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            onSwipe('right');
        } else if (info.offset.x < -100) {
            onSwipe('left');
        }
    };

    return (
        <motion.div
            style={{
                x,
                rotate,
                opacity,
                position: 'absolute',
                width: '100%',
                height: '100%',
                cursor: isTopCard ? 'grab' : 'default',
                zIndex: isTopCard ? 10 : 1,
            }}
            drag={isTopCard ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 0.98 }}
            className="cocotas-card"
        >
            <div
                className="card-image"
                style={{ backgroundImage: `url(${profile.image})` }}
            >
                <div className="card-overlay" />

                <div className="card-info">
                    <div className="status-badge">Online recentemente</div>
                    <h2>{profile.name} <span className="age">{profile.age}</span></h2>
                    <div className="distance">
                        <MapPin size={14} />
                        <span>Mora em {profile.city || 'São Paulo'}</span>
                    </div>
                    <p className="bio">{profile.bio}</p>
                </div>

                {/* Swipe Indicators */}
                <motion.div
                    style={{ opacity: useTransform(x, [0, 50], [0, 1]) }}
                    className="indicator indicator-like"
                >
                    <span>Quero</span>
                </motion.div>

                <motion.div
                    style={{ opacity: useTransform(x, [0, -50], [0, 1]) }}
                    className="indicator indicator-nope"
                >
                    <span>Não quero</span>
                </motion.div>
            </div>
        </motion.div>
    );
}
