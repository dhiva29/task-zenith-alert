import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a30b00526a454fc582ce0cc990503373',
  appName: 'task-zenith-alert',
  webDir: 'dist',
  server: {
    url: 'https://a30b0052-6a45-4fc5-82ce-0cc990503373.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    App: {
      appUrlOpen: true,
    },
  },
};

export default config;