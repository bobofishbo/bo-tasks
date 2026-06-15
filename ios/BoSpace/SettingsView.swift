import SwiftUI

struct SettingsView: View {
    @State private var apiURL = SettingsStore.apiURL
    @State private var apiKey = SettingsStore.apiKey
    @State private var saved  = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("Set your app URL and API key once. Then use the iOS Share Sheet inside Instagram or TikTok to save reels directly to your inspiration repo.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section("App URL") {
                    TextField("https://your-app.vercel.app", text: $apiURL)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                        .keyboardType(.URL)
                }

                Section("API Key") {
                    SecureField("Your INSPIRATION_API_KEY value", text: $apiKey)
                }
                Section {
                    Text("Set INSPIRATION_API_KEY in your Vercel environment variables. Leave blank for local/dev testing.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section {
                    Button(action: saveSettings) {
                        Label(
                            saved ? "Saved!" : "Save Settings",
                            systemImage: saved ? "checkmark.circle.fill" : "square.and.arrow.down"
                        )
                        .frame(maxWidth: .infinity, alignment: .center)
                        .foregroundStyle(saved ? .green : .blue)
                    }
                }
            }
            .navigationTitle("Bo's Space")
            .navigationSubtitle("Share Extension Settings")
        }
    }

    private func saveSettings() {
        SettingsStore.apiURL = apiURL.trimmingCharacters(in: .whitespacesAndNewlines)
        SettingsStore.apiKey = apiKey.trimmingCharacters(in: .whitespacesAndNewlines)
        saved = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { saved = false }
    }
}
