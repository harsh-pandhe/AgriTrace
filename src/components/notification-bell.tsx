'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notification-service';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: any;
}

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;

        // Real-time listener for notifications
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const notifs: Notification[] = [];
            let unread = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                notifs.push({
                    id: doc.id,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    link: data.link,
                    read: data.read || false,
                    createdAt: data.createdAt,
                });

                if (!data.read) {
                    unread++;
                }
            });

            // Sort by date
            notifs.sort((a, b) => {
                const aDate = a.createdAt?.toDate?.() || new Date(0);
                const bDate = b.createdAt?.toDate?.() || new Date(0);
                return bDate.getTime() - aDate.getTime();
            });

            setNotifications(notifs.slice(0, 10)); // Show latest 10
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, [user]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.uid) return;
        try {
            await markAllNotificationsAsRead(user.uid);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'COLLECTION_SCHEDULED':
                return '📋';
            case 'DELIVERY_COMPLETED':
                return '✅';
            case 'PROCESSING_FINISHED':
                return '♻️';
            case 'PAYMENT_RECEIVED':
                return '💰';
            case 'NEW_TASK_NEARBY':
                return '📍';
            case 'STATUS_UPDATE':
                return 'ℹ️';
            default:
                return '🔔';
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp?.toDate) return 'Just now';
        const date = timestamp.toDate();
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications yet
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''
                                    }`}
                                onClick={() => {
                                    handleMarkAsRead(notification.id);
                                    if (notification.link) {
                                        setOpen(false);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-2 w-full">
                                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-sm text-muted-foreground">
                            <Link href="/notifications" onClick={() => setOpen(false)}>
                                View all notifications
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
