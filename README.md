# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Over-the-air updates (EAS Update)

Small JavaScript/asset fixes can ship without an App Store or Play Store review.
Installed apps check for an update each time they launch and switch to it on
the next launch.

```bash
npm run update:production -- --message "Fix course list crash"
```

Rules:

- **JS-only changes only.** Anything that adds or upgrades a native module,
  changes permissions, icons, splash screen, `app.json` native settings or the
  `ios/` project needs a new store build (`eas build --profile production`).
- **Runtime version.** An update only reaches builds with the same runtime
  version (currently `1.0.1`). When a release changes native code, bump the app
  version and runtime version together in `app.json`,
  `ios/SCTTraining/Supporting/Expo.plist` (`EXUpdatesRuntimeVersion`) and
  `MARKETING_VERSION` in the Xcode project. `src/__tests__/config/updatesConfig.test.ts`
  fails if they drift apart.
- **Channels.** Store builds listen on `production`, internal builds on
  `preview`. Try an update on `preview` first with `npm run update:preview`.
- **Rollback.** `eas update:rollback` or republish a previous update from the
  EAS dashboard.
- Builds made before updates were enabled (1.0.1 build and earlier) cannot
  receive updates; the first build after this change is the first one that can.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
