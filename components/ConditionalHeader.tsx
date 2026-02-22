'use client';

import React from 'react';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function ConditionalHeader() {
    const pathname = usePathname();

    // Lista de rotas onde o cabeçalho global NÃO deve aparecer
    const hideHeaderRoutes = ['/login'];
    const shouldHide = hideHeaderRoutes.includes(pathname);

    if (shouldHide) return null;

    return <Header />;
}
