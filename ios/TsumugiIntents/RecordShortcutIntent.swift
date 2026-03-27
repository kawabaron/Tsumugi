import AppIntents
import Foundation

enum TsumugiRecordType: String, AppEnum {
    case milk
    case pee
    case poop
    case sleepStart = "sleep_start"
    case sleepEnd = "sleep_end"

    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Tsumugi Record")

    static var caseDisplayRepresentations: [TsumugiRecordType: DisplayRepresentation] = [
        .milk: "ミルクを記録",
        .pee: "おしっこを記録",
        .poop: "うんちを記録",
        .sleepStart: "ねんね開始を記録",
        .sleepEnd: "ねんね終了を記録"
    ]
}

struct RecordShortcutIntent: AppIntent {
    static var title: LocalizedStringResource = "Tsumugi に記録"
    static var description = IntentDescription("育児記録を追加して Tsumugi に渡します。")
    static var openAppWhenRun = true

    @Parameter(title: "種別")
    var type: TsumugiRecordType

    @Parameter(title: "ミルク量", default: 0)
    var amountMl: Int

    func perform() async throws -> some IntentResult {
        guard let encodedType = type.rawValue.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else {
            return .result()
        }

        var components = URLComponents()
        components.scheme = "tsumugi"
        components.host = "shortcut"
        components.queryItems = [
            URLQueryItem(name: "type", value: encodedType)
        ]

        if type == .milk && amountMl > 0 {
            components.queryItems?.append(URLQueryItem(name: "amount", value: String(amountMl)))
        }

        if let url = components.url {
            return .result(opensIntent: OpenURLIntent(url))
        }

        return .result()
    }
}
