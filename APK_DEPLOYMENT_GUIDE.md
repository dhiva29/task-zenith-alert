# APK Deployment Guide - Task Zenith Alert

This guide will help you build and deploy the Task Zenith Alert app as an APK for Android devices.

## Prerequisites

Before you begin, ensure you have:

1. **Android Studio** installed with Android SDK
2. **Node.js** (version 16 or higher)
3. **Git** for version control
4. **Java Development Kit (JDK)** version 11 or higher

## Step 1: Export and Setup Project

1. **Export to GitHub**:
   - Click the "Export to GitHub" button in Lovable
   - Clone the repository to your local machine:
   ```bash
   git clone <your-github-repo-url>
   cd task-zenith-alert
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

## Step 2: Add Android Platform

1. **Add Android Platform**:
   ```bash
   npx cap add android
   ```

2. **Update Native Dependencies**:
   ```bash
   npx cap update android
   ```

## Step 3: Configure Android Permissions

The app requires specific permissions for notifications and reminders. These are automatically configured in the `capacitor.config.ts` file, but verify the following permissions in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
```

## Step 4: Build the Project

1. **Build the Web Assets**:
   ```bash
   npm run build
   ```

2. **Sync with Native Platform**:
   ```bash
   npx cap sync android
   ```

## Step 5: Generate Signing Key (For Production APK)

1. **Create a Keystore**:
   ```bash
   keytool -genkey -v -keystore task-zenith-alert.keystore -alias task-zenith-alert -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Remember your credentials**:
   - Store password
   - Key alias
   - Key password

## Step 6: Configure Gradle for Signing

1. **Create `gradle.properties`** in `android/` directory:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=../task-zenith-alert.keystore
   MYAPP_UPLOAD_KEY_ALIAS=task-zenith-alert
   MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
   MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
   ```

2. **Update `android/app/build.gradle`**:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               storeFile file(MYAPP_UPLOAD_STORE_FILE)
               storePassword MYAPP_UPLOAD_STORE_PASSWORD
               keyAlias MYAPP_UPLOAD_KEY_ALIAS
               keyPassword MYAPP_UPLOAD_KEY_PASSWORD
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled false
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

## Step 7: Build Release APK

1. **Open Android Studio**:
   ```bash
   npx cap open android
   ```

2. **Build APK**:
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Or via command line:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **Find your APK**:
   - Location: `android/app/build/outputs/apk/release/app-release.apk`

## Step 8: Testing and Installation

1. **Install on Device**:
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

2. **Enable Unknown Sources**:
   - On your Android device, go to Settings → Security
   - Enable "Unknown Sources" or "Install apps from unknown sources"

3. **Transfer and Install**:
   - Copy the APK file to your device
   - Tap the file and follow installation prompts

## Key Features Enabled in APK

✅ **Smart Placement Parser**: Extracts company names, roles, CTC, and dates with times  
✅ **Intelligent Reminders**: Multiple reminders (1 hour before, 15 minutes before deadline)  
✅ **Pre-placement Talk Notifications**: Separate reminders for company presentations  
✅ **Battery Optimization Resistance**: Configured to work even in Doze mode  
✅ **Custom Sound Support**: Uses device default notification sound with fallbacks  

## Notification Features

- **Application Deadline**: Reminds 1 hour and 15 minutes before
- **Pre-placement Talk**: Reminds 30 minutes before company presentation
- **Persistent Reminders**: Survives device restarts and battery optimization
- **Rich Notifications**: Shows task details and urgency levels

## Troubleshooting

### Common Issues:

1. **Gradle Build Fails**:
   - Ensure Android SDK is properly installed
   - Check Java version compatibility
   - Clear gradle cache: `./gradlew clean`

2. **Notifications Not Working**:
   - Check battery optimization settings
   - Ensure notification permissions are granted
   - Verify app is not in restricted background mode

3. **APK Installation Fails**:
   - Enable developer options
   - Check if device supports the target API level
   - Ensure sufficient storage space

### Advanced Configuration:

1. **Battery Optimization Bypass**:
   ```xml
   <!-- Add to AndroidManifest.xml -->
   <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
   ```

2. **Auto-start on Boot**:
   ```xml
   <!-- Add to AndroidManifest.xml -->
   <receiver android:name=".BootReceiver">
       <intent-filter>
           <action android:name="android.intent.action.BOOT_COMPLETED" />
       </intent-filter>
   </receiver>
   ```

## App Permissions Explained

- **POST_NOTIFICATIONS**: Send local notifications for reminders
- **SCHEDULE_EXACT_ALARM**: Schedule precise notifications for deadlines
- **WAKE_LOCK**: Keep device awake for critical notifications
- **RECEIVE_BOOT_COMPLETED**: Restart notifications after device reboot
- **VIBRATE**: Vibrate device for urgent notifications

## Security Considerations

- APK is signed with your private key
- All data is stored locally on device
- No external API calls for sensitive placement data
- Supabase integration is secure with row-level security

## Performance Optimizations

- Lazy loading of components
- Optimized notification scheduling
- Minimal battery usage
- Efficient date parsing algorithms

The APK will be production-ready with all notification features working reliably across different Android versions and manufacturers.