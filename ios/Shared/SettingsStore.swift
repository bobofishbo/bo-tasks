import Foundation

/// Shared settings between the container app and the share extension.
/// Uses an App Group so both processes read/write the same UserDefaults store.
struct SettingsStore {
    private static let defaults = UserDefaults(suiteName: "group.com.bo.bospace")

    static var apiURL: String {
        get { defaults?.string(forKey: "apiURL") ?? "" }
        set { defaults?.set(newValue, forKey: "apiURL") }
    }

    static var apiKey: String {
        get { defaults?.string(forKey: "apiKey") ?? "" }
        set { defaults?.set(newValue, forKey: "apiKey") }
    }
}
