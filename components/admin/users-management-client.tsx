"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Users,
    Mail,
    Shield,
    CreditCard,
    MessageSquare,
    Trash2,
    Edit,
    CheckCircle2,
    XCircle,
    Send,
    Loader2,
    Search,
    ChevronDown,
    Lock,
    Crown,
    Zap,
    Activity,
    AlertTriangle,
    ShieldCheck,
    Check,
    Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateUserRole, updateUserPlan, deleteUser } from "@/lib/actions/users";
import { getAdminMessages, sendAdminMessage, markMessagesAsRead } from "@/lib/actions/messages";

interface UserManagementProps {
    initialUsers: any[];
    plans: any[];
    currentAdminId: string;
}

export function UserManagementClient({ initialUsers, plans, currentAdminId }: UserManagementProps) {
    const supabase = createClient();
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const filteredUsers = users?.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.role?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    // REALTIME NEXUS PROTOCOL
    useEffect(() => {
        if (isChatOpen && selectedUser) {
            // Initial Fetch
            const fetchMessages = async () => {
                const res = await getAdminMessages(selectedUser.id);
                if (!res.error) {
                    setMessages(res.messages);
                    markMessagesAsRead(selectedUser.id);
                }
            };
            fetchMessages();

            // Realtime Subscription
            const channel = supabase
                .channel(`nexus_chat_${selectedUser.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'admin_messages'
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            const newMsg = payload.new;
                            // Only add if relevant to this conversation
                            if ((newMsg.sender_id === currentAdminId && newMsg.receiver_id === selectedUser.id) ||
                                (newMsg.sender_id === selectedUser.id && newMsg.receiver_id === currentAdminId)) {
                                setMessages(prev => {
                                    // Avoid duplicates from optimistic updates
                                    if (prev.find(m => m.id === newMsg.id)) return prev;
                                    return [...prev, newMsg];
                                });

                                if (newMsg.sender_id === selectedUser.id) {
                                    markMessagesAsRead(selectedUser.id);
                                }
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [isChatOpen, selectedUser, currentAdminId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isSending || !selectedUser) return;
        setIsSending(true);
        const res = await sendAdminMessage(selectedUser.id, newMessage);
        if (!res.success) {
            toast.error(res.error);
        } else {
            setNewMessage("");
        }
        setIsSending(false);
    };

    const handleRoleUpdate = async (userId: string, role: string) => {
        setIsUpdating(true);
        const res = await updateUserRole(userId, role);
        if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
            toast.success(`Accréditation ${role.toUpperCase()} activée`);
        } else {
            toast.error(res.error);
        }
        setIsUpdating(false);
    };

    const handlePlanUpdate = async (userId: string, planId: string) => {
        setIsUpdating(true);
        const res = await updateUserPlan(userId, planId);
        if (res.success) {
            const updatedPlan = plans.find(p => p.id === planId);
            setUsers(users.map(u => {
                if (u.id === userId) {
                    return {
                        ...u,
                        subscriptions: updatedPlan ? [{
                            ...u.subscriptions?.[0],
                            subscription_plans: updatedPlan
                        }] : []
                    };
                }
                return u;
            }));
            toast.success("Synchronisation Financière Réussie");
        } else {
            toast.error(res.error);
        }
        setIsUpdating(false);
    };

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Registre Total', value: users.length, icon: Users, color: 'primary' },
                    { label: 'Accès Master', value: users.filter(u => u.role === 'admin').length, icon: ShieldCheck, color: 'emerald' },
                    { label: 'Elite Sellers', value: users.filter(u => u.role === 'seller').length, icon: Crown, color: 'amber' },
                    { label: 'Nexus Active', value: users.filter(u => !u.is_suspended).length, icon: Activity, color: 'blue' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="volcanic-glass p-6 border-white/5 group hover:border-primary/20 transition-all duration-500"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                <stat.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <p className="text-xl font-black text-white font-mono">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher dans le Nexus (Nom, Email, Role)..."
                        className="w-full pl-16 pr-8 py-5 bg-white/[0.02] border border-white/5 rounded-[2rem] text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-bold uppercase tracking-widest"
                    />
                </div>
            </div>

            {/* User Grid/Table */}
            <div className="volcanic-glass overflow-hidden border-white/5 relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Identité Nexus</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Accréditation</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Niveau de Plan</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Vérification</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Contrôle Tactique</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user, idx) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-white/[0.02] transition-all group"
                                >
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5 flex items-center justify-center relative shadow-2xl group-hover:border-primary/40 transition-all overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-xl font-black text-white/10 italic">{user.full_name?.[0] || '?'}</div>
                                                )}
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-white uppercase italic tracking-tight">{user.full_name || 'Inconnu'}</p>
                                                    {user.role === 'admin' && <Shield className="w-3 h-3 text-primary" />}
                                                </div>
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1 font-mono">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                            className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-primary/50 transition-all"
                                        >
                                            <option value="customer">Client</option>
                                            <option value="seller">Seller</option>
                                            <option value="admin">Master Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-7">
                                        <select
                                            value={user.subscriptions?.[0]?.subscription_plans?.id || ""}
                                            onChange={(e) => handlePlanUpdate(user.id, e.target.value)}
                                            className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-primary/50 transition-all"
                                        >
                                            <option value="">Aucun Plan</option>
                                            {plans.map(plan => (
                                                <option key={plan.id} value={plan.id}>{plan.name} ({plan.price}€)</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 inline-flex items-center gap-2">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Verified</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => { setSelectedUser(user); setIsChatOpen(true); }}
                                                className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/10 hover:bg-primary hover:text-black transition-all"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Radiation irréversible ?")) deleteUser(user.id);
                                                }}
                                                className="p-4 rounded-2xl bg-red-500/5 text-red-500/40 border border-white/5 hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Direct messaging Modal */}
            <AnimatePresence>
                {isChatOpen && selectedUser && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsChatOpen(false)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="relative w-full max-w-4xl bg-[#08080A] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[80vh]"
                        >
                            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                                        <MessageSquare className="w-8 h-8 text-primary" />
                                        <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#08080A]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Liaison Nexus Direct</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">{selectedUser.full_name}</span>
                                            <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">• Protocole Sécurisé AES-256</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                                {messages.map((msg, i) => {
                                    const isMe = msg.sender_id === currentAdminId;
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] p-6 rounded-[2rem] text-[13px] relative ${isMe ? 'bg-primary text-black font-bold rounded-tr-none' : 'bg-white/[0.03] text-white/80 border border-white/5 rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                                <div className={`flex items-center gap-1.5 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <p className={`text-[8px] uppercase font-black tracking-widest ${isMe ? 'text-black/30' : 'text-white/20'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {isMe && (
                                                        <div className="flex">
                                                            <Check className={`w-2.5 h-2.5 ${msg.status === 'read' ? 'text-blue-600' : 'text-black/20'}`} />
                                                            <Check className={`w-2.5 h-2.5 -ml-1.5 ${msg.status === 'read' ? 'text-blue-600' : 'text-black/20'}`} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-8 bg-[#0A0A0C] border-t border-white/5">
                                <div className="relative">
                                    <input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Synthétisez votre message..."
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-sm text-white placeholder:text-white/10 outline-none focus:border-primary/40 transition-all font-medium pr-28"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isSending || !newMessage.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 rounded-xl bg-primary text-black flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-30"
                                    >
                                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Transmettre
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {isUpdating && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.6em] mt-8 animate-pulse">Synchronisation Nexus...</p>
                </div>
            )}
        </div>
    );
}
