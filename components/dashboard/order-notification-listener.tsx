"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { formatPrice } from "@/lib/currency-engine";
import { useNotificationStore } from "@/lib/store/use-notification-store";

export function OrderNotificationListener() {
    const supabase = createClient();
    const addNotification = useNotificationStore(state => state.addNotification);

    useEffect(() => {
        // Subscribe to NEW orders
        const channel = supabase
            .channel('dashboard-orders')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    const newOrder = payload.new;

                    // Add to Global Store
                    addNotification({
                        title: "Nouvelle Commande Aura",
                        message: `Commande de ${newOrder.customer_name} de ${newOrder.total} FCFA`,
                        type: 'order'
                    });

                    // Trigger Elite Notification
                    toast.custom((t) => (
                        <div className="glass-card rounded-2xl p-4 border border-primary/30 shadow-[0_0_20px_rgba(254,117,1,0.2)] bg-[#121216] flex items-center gap-4 min-w-[300px] animate-in slide-in-from-right-full">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-[0_0_15px_#fe7501]">
                                <Zap className="w-5 h-5 text-black fill-current" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Nouveau Flux Détecté</p>
                                    <span className="text-[9px] text-white/20 font-bold uppercase">Maintenant</span>
                                </div>
                                <p className="text-[12px] font-black text-white uppercase tracking-tight">
                                    Commande par {newOrder.customer_name}
                                </p>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                                    Montant: <span className="text-white">{newOrder.total} {newOrder.currency || ''}</span> • Statut: {newOrder.status}
                                </p>
                            </div>
                            <button
                                onClick={() => toast.dismiss(t)}
                                className="text-white/20 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    ), {
                        duration: 8000,
                        position: 'top-right'
                    });

                    // Optional: Play a subtle "Elite" sound
                    const playSound = () => {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.volume = 0.4;
                        audio.play().catch(() => console.log("Audio blocked"));
                    };
                    playSound();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return null; // This component registers the listener only
}
