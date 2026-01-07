'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { notificationApi } from '../../lib/api';
import type { Notification } from '../../types';
import { Bell, ArrowLeft, Check, CheckCheck, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function NotificationsPage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        fetchNotifications();
    }, [isAuthenticated, router, filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const isRead = filter === 'unread' ? false : undefined;
            const data = await notificationApi.getAll(isRead);
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getSeverityConfig = (severity: string) => {
        switch (severity) {
            case 'success':
                return {
                    icon: <CheckCircle size={18} />,
                    bg: 'bg-green-100',
                    text: 'text-green-600',
                    border: 'border-green-200',
                };
            case 'warning':
                return {
                    icon: <AlertTriangle size={18} />,
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-600',
                    border: 'border-yellow-200',
                };
            case 'error':
                return {
                    icon: <AlertCircle size={18} />,
                    bg: 'bg-red-100',
                    text: 'text-red-600',
                    border: 'border-red-200',
                };
            default:
                return {
                    icon: <Info size={18} />,
                    bg: 'bg-blue-100',
                    text: 'text-blue-600',
                    border: 'border-blue-200',
                };
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'booking':
                return 'Booking';
            case 'laundry':
                return 'Laundry';
            case 'catering':
                return 'Catering';
            default:
                return 'Sistem';
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Kembali ke Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-primary-900 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Bell className="text-white" size={24} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">Notifikasi</h1>
                                    <p className="text-primary-200 text-sm">
                                        {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                                    </p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    <CheckCheck size={16} />
                                    <span className="hidden sm:inline">Tandai Semua</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${filter === 'unread'
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Belum Dibaca
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-gray-500">Memuat notifikasi...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500">
                                {filter === 'unread' ? 'Tidak ada notifikasi belum dibaca' : 'Belum ada notifikasi'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => {
                                const severityConfig = getSeverityConfig(notification.severity);
                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 transition-colors ${!notification.is_read ? 'bg-primary-50/50' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${severityConfig.bg} ${severityConfig.text}`}
                                            >
                                                {severityConfig.icon}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className={`font-medium text-gray-900 ${!notification.is_read ? 'font-semibold' : ''}`}>
                                                            {notification.title}
                                                        </h3>
                                                        {!notification.is_read && (
                                                            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${severityConfig.bg} ${severityConfig.text}`}>
                                                        {getTypeLabel(notification.type)}
                                                    </span>

                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                                                        >
                                                            <Check size={14} />
                                                            Tandai dibaca
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
