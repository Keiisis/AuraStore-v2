"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User as UserIcon,
    Mail,
    Lock,
    Save,
    Loader2,
    ShieldCheck,
    AlertTriangle,
    Eye,
    EyeOff,
    CreditCard,
    Database
} from "lucide-react";
import { updateProfile, updatePassword } from "@/lib/actions/auth";
import { updateSystemConfig } from "@/lib/actions/system";
import { PaymentConfigEditor } from "./payment-config-editor";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdminSettingsClientProps {
    profile: any;
    initialConfigs: any[];
}

export function AdminSettingsClient({ profile, initialConfigs }: AdminSettingsClientProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<"account" | "security" | "core" | "payments">("account");
    const [configs, setConfigs] = useState(initialConfigs);

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const full_name = formData.get("full_name") as string;
        const email = formData.get("email") as string;

        try {
            const res = await updateProfile({ full_name, email });
            if (res.error) throw new Error(res.error);
            toast.success("Profil Master mis à jour");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirm = formData.get("confirm_password") as string;

        if (password !== confirm) {
            toast.error("Les mots de passe ne correspondent pas");
            setIsSaving(false);
            return;
        }

        try {
            const res = await updatePassword(password);
            if (res.error) throw new Error(res.error);
            toast.success("Clé d'accès modifiée avec succès");
            (e.target as HTMLFormElement).reset();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfigUpdate = async (key: string, value: any) => {
        setIsSaving(true);
        try {
            const res = await updateSystemConfig(key, value);
            if (res.error) throw new Error(res.error);
            toast.success(`Config "${key}" synchronisée`);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-10 max-w-4xl">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                    Configuration Master
                </h2>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">Manage your elite credentials & system access</p>
            </div>

            <div className="flex gap-4 border-b border-white/5 pb-px overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab("account")}
                    className={`pb-4 px-2 text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all relative ${activeTab === "account" ? "text-primary" : "text-white/20 hover:text-white/40"}`}
                >
                    Identité Master
                    {activeTab === "account" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => setActiveTab("security")}
                    className={`pb-4 px-2 text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all relative ${activeTab === "security" ? "text-primary" : "text-white/20 hover:text-white/40"}`}
                >
                    Sécurité & Accès
                    {activeTab === "security" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => setActiveTab("core")}
                    className={`pb-4 px-2 text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all relative ${activeTab === "core" ? "text-primary" : "text-white/20 hover:text-white/40"}`}
                >
                    Aura Core Config (wp-config)
                    {activeTab === "core" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => setActiveTab("payments")}
                    className={`pb-4 px-2 text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all relative ${activeTab === "payments" ? "text-primary" : "text-white/20 hover:text-white/40"}`}
                >
                    Infrastructures de Paiement
                    {activeTab === "payments" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="volcanic-glass p-6 text-center space-y-4 border-primary/10">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary p-0.5 mx-auto">
                            <div className="w-full h-full rounded-[0.9rem] bg-black flex items-center justify-center">
                                <UserIcon className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">{profile.full_name || 'Master Admin'}</h3>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">Platform Creator</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase">Privilèges Master</span>
                        </div>
                        <p className="text-[9px] text-white/40 font-medium leading-relaxed uppercase tracking-tighter italic">
                            Vous détenez les clés de l'infrastructure. Toute modification d'email ou de mot de passe est instantanément répercutée sur les protocoles de sécurité.
                        </p>
                    </div>
                </div>

                {/* Form Area */}
                <div className="md:col-span-2">
                    <AnimatePresence mode="wait">
                        {activeTab === "account" && (
                            <motion.form
                                key="account"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleProfileUpdate}
                                className="volcanic-glass p-8 space-y-8"
                            >
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Nom Complet</label>
                                        <div className="relative group">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                            <input
                                                name="full_name"
                                                defaultValue={profile.full_name}
                                                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Email Master</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                            <input
                                                name="email"
                                                type="email"
                                                defaultValue={profile.email}
                                                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                        <p className="text-[9px] text-white/20 pl-1 uppercase font-bold italic">Une confirmation sera envoyée sur le nouvel email.</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Sauvegarder l'Identité
                                </button>
                            </motion.form>
                        )}

                        {activeTab === "security" && (
                            <motion.form
                                key="security"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handlePasswordUpdate}
                                className="volcanic-glass p-8 space-y-8"
                            >
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Nouvelle Clé d'Accès</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                            <input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••••••"
                                                className="w-full pl-12 pr-12 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Confirmer la Clé</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                            <input
                                                name="confirm_password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••••••"
                                                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-primary/20"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Actualiser les Protocoles
                                </button>
                            </motion.form>
                        )}

                        {activeTab === "core" && (
                            <motion.div
                                key="core"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="volcanic-glass p-8 space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-white/40 mb-6">
                                        <Database className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Global Constants & Registry</span>
                                    </div>

                                    {configs.map((config) => (
                                        <div key={config.key} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[11px] font-black text-white uppercase tracking-tight">{config.key}</p>
                                                    <p className="text-[9px] text-white/30 font-medium">{config.description}</p>
                                                </div>
                                                <span className="text-[8px] font-black text-white/20 uppercase">Last Sync: {new Date(config.updated_at).toLocaleDateString()}</span>
                                            </div>

                                            <div className="flex gap-2">
                                                <input
                                                    defaultValue={JSON.stringify(config.value)}
                                                    onBlur={(e) => {
                                                        try {
                                                            const val = JSON.parse(e.target.value);
                                                            handleConfigUpdate(config.key, val);
                                                        } catch (err) {
                                                            toast.error("Format JSON invalide");
                                                        }
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-black border border-white/5 rounded-xl text-[10px] font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                    <p className="text-[9px] text-emerald-400/60 font-medium uppercase tracking-tighter leading-relaxed">
                                        <span className="font-black">Note :</span> Ces constantes sont injectées au niveau système. Toute erreur de syntaxe JSON peut affecter les opérations critiques.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "payments" && (
                            <motion.div
                                key="payments"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 mb-8">
                                    <div className="flex items-center gap-3 text-indigo-400 mb-2">
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Master Gateway Control</span>
                                    </div>
                                    <p className="text-[10px] text-white/40 font-medium leading-relaxed uppercase tracking-tighter italic">
                                        Configurez les passerelles pour recevoir les paiements d'abonnement des vendeurs. Ces clés sont chiffrées et isolées du reste de l'infrastructure.
                                    </p>
                                </div>
                                <PaymentConfigEditor />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
