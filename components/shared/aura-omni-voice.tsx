"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    MessageSquare,
    X,
    Send,
    Loader2,
    Sparkles,
    Maximize2,
    Minimize2,
    Shield,
    Bot,
    User,
    Check,
    Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAdminMessages, sendAdminMessage, markMessagesAsRead } from "@/lib/actions/messages";
import { toast } from "sonner";

interface AuraAssistantProps {
    storeId: string;
    context?: "admin" | "seller" | "customer";
    userRole?: string;
}

export function AuraOmniVoice({ storeId, context: initialContext, userRole }: AuraAssistantProps) {
    const supabase = createClient();
    const pathname = usePathname();
    const context = (userRole === 'admin' ? 'admin' : null) || initialContext || (
        pathname.startsWith("/admin") ? "admin" :
            pathname.startsWith("/dashboard") ? "seller" : "customer"
    );

    const [isOpen, setIsOpen] = useState(false);
    const [activeMode, setActiveMode] = useState<"ai" | "nexus">("ai");
    const [isThinking, setIsThinking] = useState(false);
    const [input, setInput] = useState("");
    const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [nexusMessages, setNexusMessages] = useState<any[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Auth and Mode Logic
    useEffect(() => {
        const getAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        getAuth();

        // If we are on dashboard (seller), we might want to default to AI but have Nexus available
        if (context === "admin") setActiveMode("ai"); // Admin usually talks to AI about global stats
    }, [context]);

    // Realtime for Nexus Messages
    useEffect(() => {
        if (isOpen && activeMode === "nexus" && currentUserId) {
            const fetchNexus = async () => {
                const res = await getAdminMessages(context === 'admin' ? '' : 'admin_search'); // This needs a specific server action for sellers
                // Note: For sellers, getAdminMessages should fetch messages where receiver OR sender is ADMIN.
                // I'll simplify: getAdminMessages (without ID) could fetch with Admin.
            };

            // For now, let's use a simplified realtime listener for the current user
            const channel = supabase
                .channel(`aura_nexus_${currentUserId}`)
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'admin_messages' },
                    (payload) => {
                        const newMsg = payload.new;
                        if (newMsg.sender_id === currentUserId || newMsg.receiver_id === currentUserId) {
                            setNexusMessages(prev => [...prev.filter(m => m.id !== newMsg.id), newMsg]);
                        }
                    }
                )
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [isOpen, activeMode, currentUserId]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [aiMessages, nexusMessages, isThinking, activeMode]);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const msgContent = input.trim();
        setInput("");

        if (activeMode === "ai") {
            setAiMessages(prev => [...prev, { role: 'user', content: msgContent }]);
            setIsThinking(true);
            try {
                const response = await fetch("/api/ai/aura-brain", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: msgContent, storeId, context, audioPrompt: false })
                });
                const data = await response.json();
                if (data.text) setAiMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
            } catch (error) {
                setAiMessages(prev => [...prev, { role: 'assistant', content: "Erreur de connexion Aura Core AI." }]);
            } finally { setIsThinking(false); }
        } else {
            // Send to Admin (Nexus Support)
            // Note: For sellers, receiverId is always the Admin ID. 
            // In a real multi-admin system, this would be a support queue.
            // For this project, we target the platform owner.
            // In a better system, this would be the actual store owner's ID
            const res = await sendAdminMessage(currentUserId || 'admin', msgContent);
            if (!res.success) toast.error("Nexus Support est indisponible.");
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`bg-[#08080A] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col mb-4 transition-all duration-500 overflow-hidden 
                            ${isExpanded
                                ? 'w-[calc(100vw-2rem)] md:w-[600px] h-[calc(100vh-10rem)] md:h-[800px] rounded-[2rem]'
                                : 'w-[calc(100vw-2rem)] md:w-[400px] h-[600px] max-h-[calc(100vh-10rem)] rounded-[2.5rem]'
                            }`}
                    >
                        {/* Mode Switcher Header */}
                        <div className="p-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-center gap-1">
                            <button
                                onClick={() => setActiveMode("ai")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeMode === 'ai' ? 'bg-primary text-black' : 'text-white/20 hover:text-white/40'}`}
                            >
                                <Bot className="w-3.5 h-3.5" /> Aura AI Brain
                            </button>
                            <button
                                onClick={() => setActiveMode("nexus")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeMode === 'nexus' ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white/40'}`}
                            >
                                <Shield className="w-3.5 h-3.5" /> Nexus Support (Admin)
                            </button>
                        </div>

                        {/* Traditional Header */}
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    {activeMode === 'ai' ? <Sparkles className="w-5 h-5 text-primary" /> : <MessageSquare className="w-5 h-5 text-emerald-400" />}
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase italic tracking-tighter">
                                        {activeMode === 'ai' ? 'Aura Strategic Intelligence' : 'Nexus Liaison Officer'}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Opérationnel • Chiffré</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-white/5 rounded-lg text-white/20 transition-colors">
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/20 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-[#09090B]">
                            {activeMode === 'ai' ? (
                                aiMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-20">
                                        <Bot className="w-12 h-12" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
                                            Intelligence de Croissance Activée.<br />Demandez une analyse de performance.
                                        </p>
                                    </div>
                                ) : (
                                    aiMessages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-[12px] leading-relaxed ${msg.role === 'user' ? 'bg-primary text-black font-bold rounded-tr-none' : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                nexusMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-20">
                                        <Lock className="w-12 h-12" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
                                            Ligne Directe avec l'Admin.<br />Posez vos questions techniques.
                                        </p>
                                    </div>
                                ) : (
                                    nexusMessages.map((msg, i) => {
                                        const isMe = msg.sender_id === currentUserId;
                                        return (
                                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-[12px] leading-relaxed ${isMe ? 'bg-white/10 text-white font-bold rounded-tr-none border border-white/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-tl-none'}`}>
                                                    {msg.content}
                                                    <div className="flex items-center gap-1 mt-2 justify-end opacity-40">
                                                        <span className="text-[7px] uppercase font-black">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isMe && <Check className={`w-2.5 h-2.5 ${msg.status === 'read' ? 'text-blue-400' : ''}`} />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )
                            )}
                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-white/[0.01] border-t border-white/5">
                            <div className="relative">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={activeMode === 'ai' ? "Demandez une stratégie..." : "Message à l'Admin..."}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] px-6 py-4 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 transition-all font-medium pr-16"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isThinking || !input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-primary text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-30 shadow-xl"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-primary text-black shadow-[0_25px_60px_rgba(254,117,1,0.5)] flex items-center justify-center relative overflow-hidden group border border-white/10"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-50 group-hover:rotate-180 transition-all duration-1000" />
                <AnimatePresence mode="wait">
                    {isOpen ? <X className="w-8 h-8 relative z-10" /> : <MessageSquare className="w-8 h-8 relative z-10" />}
                </AnimatePresence>
                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            </motion.button>
        </div>
    );
}
