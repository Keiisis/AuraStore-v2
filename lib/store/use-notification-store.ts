import { create } from 'zustand';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'order' | 'system' | 'alert';
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'time'>) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
    unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    addNotification: (n) => {
        const newNotification: Notification = {
            ...n,
            id: Math.random().toString(36).substring(7),
            read: false,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        };
        set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 20),
        }));
    },
    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    })),
    clearAll: () => set({ notifications: [] }),
    unreadCount: () => get().notifications.filter(n => !n.read).length,
}));
