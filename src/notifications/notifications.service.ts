import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class NotificationsService {
  constructor(private store: InMemoryStore) {}

  findAll(userId: string) {
    const notifications = this.store.getNotificationsByUser(userId);
    const unreadCount = notifications.filter(n => n.unread).length;
    return { unreadCount, notifications };
  }

  markRead(userId: string, id: string) {
    const n = this.store.markNotificationRead(id, userId);
    return n ?? { message: 'Not found' };
  }

  markAllRead(userId: string) {
    this.store.markAllNotificationsRead(userId);
    return { message: 'All notifications marked as read' };
  }
}
