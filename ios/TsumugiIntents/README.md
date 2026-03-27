# Tsumugi Intents

These sample App Intents files demonstrate the MVP Siri flow for Tsumugi.

## How it works

1. Siri or the Shortcuts app runs `RecordShortcutIntent`.
2. The intent opens `tsumugi://shortcut?type=pee` style deep links.
3. The React Native app listens for those links and routes them into the same record creation logic used by manual input.

## Integration note

This repository does not contain a generated native iOS project yet. After running Expo prebuild or creating the iOS target, add these files to an App Intents target and ensure the app scheme remains `tsumugi`.
