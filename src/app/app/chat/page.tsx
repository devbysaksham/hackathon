'use client';

import React from 'react';
import AIChatBox from '@/components/AIChatBox';

export default function AppChatPage() {
    return (
        <div className="flex flex-col flex-1 min-h-0 glass-card rounded-[28px] overflow-hidden border border-white/5 relative animate-fade-in-up w-full">
            <AIChatBox className="flex-1 min-h-0 border-none shadow-none rounded-none bg-transparent" />
        </div>
    );
}
