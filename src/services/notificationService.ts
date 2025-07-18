import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationConfig {
  id: number;
  title: string;
  body: string;
  scheduledAt: Date;
  sound?: string;
  largeIcon?: string;
  smallIcon?: string;
}

export class NotificationService {
  private static isCapacitor = Capacitor.isNativePlatform();

  static async requestPermissions(): Promise<boolean> {
    if (!this.isCapacitor) {
      console.log('Web environment - using browser notifications');
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }

    try {
      const { display } = await LocalNotifications.requestPermissions();
      return display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(config: NotificationConfig): Promise<boolean> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permission denied');
      return false;
    }

    if (!this.isCapacitor) {
      // Web fallback - schedule using setTimeout for immediate testing
      const timeUntilNotification = config.scheduledAt.getTime() - Date.now();
      if (timeUntilNotification > 0) {
        setTimeout(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(config.title, {
              body: config.body,
              icon: config.largeIcon || '/favicon.ico'
            });
          }
        }, timeUntilNotification);
        return true;
      }
      return false;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: config.id,
          title: config.title,
          body: config.body,
          schedule: {
            at: config.scheduledAt
          },
          sound: config.sound || 'default',
          smallIcon: config.smallIcon || 'ic_stat_icon_config_sample',
          largeIcon: config.largeIcon,
          actionTypeId: 'TASK_REMINDER',
          extra: {
            taskId: config.id.toString()
          }
        }]
      });
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  static async scheduleTaskReminders(
    taskId: number, 
    title: string, 
    deadline: Date,
    prePlacementTalk?: Date
  ): Promise<void> {
    const notifications: NotificationConfig[] = [];

    // Schedule deadline reminder (1 hour before)
    const deadlineReminder = new Date(deadline.getTime() - 60 * 60 * 1000);
    if (deadlineReminder > new Date()) {
      notifications.push({
        id: taskId * 100 + 1,
        title: '⏰ Application Deadline Soon!',
        body: `${title} - Deadline in 1 hour`,
        scheduledAt: deadlineReminder,
        sound: 'deadline_alert'
      });
    }

    // Schedule deadline final reminder (15 minutes before)
    const finalReminder = new Date(deadline.getTime() - 15 * 60 * 1000);
    if (finalReminder > new Date()) {
      notifications.push({
        id: taskId * 100 + 2,
        title: '🚨 URGENT: Deadline in 15 minutes!',
        body: `${title} - Apply now or miss the opportunity!`,
        scheduledAt: finalReminder,
        sound: 'urgent_alert'
      });
    }

    // Schedule pre-placement talk reminder (30 minutes before)
    if (prePlacementTalk) {
      const talkReminder = new Date(prePlacementTalk.getTime() - 30 * 60 * 1000);
      if (talkReminder > new Date()) {
        notifications.push({
          id: taskId * 100 + 3,
          title: '📢 Pre-placement Talk Starting Soon',
          body: `${title} - Talk starts in 30 minutes`,
          scheduledAt: talkReminder,
          sound: 'talk_reminder'
        });
      }
    }

    // Schedule all notifications
    for (const notification of notifications) {
      await this.scheduleNotification(notification);
    }

    console.log(`Scheduled ${notifications.length} reminders for task: ${title}`);
  }

  static async cancelTaskNotifications(taskId: number): Promise<void> {
    if (!this.isCapacitor) return;

    try {
      const notificationIds = [
        taskId * 100 + 1,
        taskId * 100 + 2,
        taskId * 100 + 3
      ];

      await LocalNotifications.cancel({
        notifications: notificationIds.map(id => ({ id }))
      });
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  static async checkPendingNotifications(): Promise<void> {
    if (!this.isCapacitor) return;

    try {
      const { notifications } = await LocalNotifications.getPending();
      console.log(`Pending notifications: ${notifications.length}`);
      notifications.forEach(notification => {
        console.log(`ID: ${notification.id}, Title: ${notification.title}, Schedule: ${notification.schedule?.at}`);
      });
    } catch (error) {
      console.error('Error checking pending notifications:', error);
    }
  }
}