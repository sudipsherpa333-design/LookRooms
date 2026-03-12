import admin from 'firebase-admin';

// Initialize firebase admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}'))
  });
}

export const pushService = {
  async sendPush({ token, title, body, data, imageUrl }: any) {
    const message = {
      token,
      notification: { title, body, imageUrl },
      data: {
        type: data.type,
        actionUrl: data.actionUrl,
        notificationId: data.notificationId
      },
      android: {
        priority: 'high' as 'high' | 'normal',
        notification: {
          sound: 'default',
          channelId: 'lookrooms_notifications',
          color: '#3b82f6',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: { aps: { sound: 'default' } }
      },
      webpush: {
        notification: { icon: '/icons/logo-192.png', badge: '/icons/badge.png' },
        fcmOptions: { link: data.actionUrl }
      }
    };
    
    return await admin.messaging().send(message);
  }
};
