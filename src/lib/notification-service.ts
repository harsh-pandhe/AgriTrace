import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export type NotificationType =
    | 'COLLECTION_SCHEDULED'
    | 'DELIVERY_COMPLETED'
    | 'PROCESSING_FINISHED'
    | 'PAYMENT_RECEIVED'
    | 'NEW_TASK_NEARBY'
    | 'STATUS_UPDATE';

export interface NotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: any;
}

export const createNotification = async (data: NotificationData) => {
    try {
        const notificationsRef = collection(db, 'notifications');
        await addDoc(notificationsRef, {
            ...data,
            read: false,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

export const getUserNotifications = async (userId: string, unreadOnly = false, limitCount = 20) => {
    try {
        const notificationsRef = collection(db, 'notifications');
        let q = query(
            notificationsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        if (unreadOnly) {
            q = query(q, where('read', '==', false));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const markNotificationAsRead = async (notificationId: string) => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            read: true,
            readAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const markAllNotificationsAsRead = async (userId: string) => {
    try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const snapshot = await getDocs(q);
        const updatePromises = snapshot.docs.map(doc =>
            updateDoc(doc.ref, {
                read: true,
                readAt: serverTimestamp(),
            })
        );

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

export const getUnreadCount = async (userId: string): Promise<number> => {
    try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
};
