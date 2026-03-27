import AppIntents

struct TsumugiShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        [
            AppShortcut(
                intent: RecordShortcutIntent(type: .milk, amountMl: 0),
                phrases: [
                    "Tsumugiでミルクを記録",
                    "ミルクを記録"
                ],
                shortTitle: "ミルクを記録",
                systemImageName: "drop.fill"
            ),
            AppShortcut(
                intent: RecordShortcutIntent(type: .pee, amountMl: 0),
                phrases: [
                    "Tsumugiでおしっこを記録",
                    "おしっこを記録"
                ],
                shortTitle: "おしっこを記録",
                systemImageName: "drop.circle"
            ),
            AppShortcut(
                intent: RecordShortcutIntent(type: .poop, amountMl: 0),
                phrases: [
                    "Tsumugiでうんちを記録",
                    "うんちを記録"
                ],
                shortTitle: "うんちを記録",
                systemImageName: "leaf"
            ),
            AppShortcut(
                intent: RecordShortcutIntent(type: .sleepStart, amountMl: 0),
                phrases: [
                    "Tsumugiでねんね開始を記録",
                    "ねんね開始を記録"
                ],
                shortTitle: "ねんね開始",
                systemImageName: "moon.zzz"
            ),
            AppShortcut(
                intent: RecordShortcutIntent(type: .sleepEnd, amountMl: 0),
                phrases: [
                    "Tsumugiでねんね終了を記録",
                    "ねんね終了を記録"
                ],
                shortTitle: "ねんね終了",
                systemImageName: "sun.max"
            )
        ]
    }
}
