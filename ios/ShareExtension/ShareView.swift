import SwiftUI

struct ShareView: View {
    let url:      String
    let platform: String
    let onSave:   () -> Void
    let onCancel: () -> Void

    @State private var title        = ""
    @State private var notes        = ""
    @State private var isSaving     = false
    @State private var didSave      = false
    @State private var errorMessage: String?

    private var platformLabel: String {
        platform == "instagram" ? "Instagram" : "TikTok"
    }
    private var platformColor: Color {
        platform == "instagram"
            ? Color(red: 0.91, green: 0.27, blue: 0.40)
            : Color.primary
    }
    private var shortURL: String {
        guard let u = URL(string: url) else { return url }
        let parts = u.path.split(separator: "/").prefix(2).joined(separator: "/")
        return (u.host ?? "") + "/" + parts
    }

    var body: some View {
        NavigationStack {
            Form {
                // URL preview
                Section {
                    HStack(spacing: 10) {
                        Text(platformLabel)
                            .font(.caption2).fontWeight(.bold)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 7).padding(.vertical, 3)
                            .background(platformColor)
                            .clipShape(RoundedRectangle(cornerRadius: 5))
                        Text(shortURL)
                            .font(.caption).foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }

                Section("Title") {
                    TextField("What's this about?", text: $title)
                        .submitLabel(.next)
                }

                Section("Notes") {
                    TextEditor(text: $notes)
                        .frame(minHeight: 72)
                }

                if let error = errorMessage {
                    Section {
                        Label(error, systemImage: "exclamationmark.triangle")
                            .font(.caption).foregroundStyle(.red)
                    }
                }

                Section {
                    Button(action: save) {
                        HStack {
                            Spacer()
                            if isSaving {
                                ProgressView().tint(.white)
                            } else if didSave {
                                Label("Saved!", systemImage: "checkmark.circle.fill")
                                    .fontWeight(.semibold)
                            } else {
                                Text("Save to Bo's Space").fontWeight(.semibold)
                            }
                            Spacer()
                        }
                    }
                    .foregroundStyle(didSave ? .green : .white)
                    .listRowBackground(didSave ? Color.green.opacity(0.15) : Color.blue)
                    .disabled(isSaving || didSave)
                }
            }
            .navigationTitle("Save Inspiration")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel", action: onCancel)
                }
            }
        }
    }

    private func save() {
        let rawURL = SettingsStore.apiURL
        guard !rawURL.isEmpty else {
            errorMessage = "Open Bo's Space app and set your API URL first."
            return
        }
        guard let endpoint = URL(string: rawURL.trimmingCharacters(in: CharacterSet(charactersIn: "/")) + "/api/inspirations") else {
            errorMessage = "Invalid API URL — check your settings."
            return
        }

        isSaving     = true
        errorMessage = nil

        var req = URLRequest(url: endpoint, timeoutInterval: 10)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let key = SettingsStore.apiKey
        if !key.isEmpty { req.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization") }

        let body: [String: String] = [
            "url":      url,
            "platform": platform,
            "title":    title.trimmingCharacters(in: .whitespacesAndNewlines),
            "notes":    notes.trimmingCharacters(in: .whitespacesAndNewlines),
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: req) { _, response, error in
            DispatchQueue.main.async {
                isSaving = false
                if let error {
                    errorMessage = error.localizedDescription
                    return
                }
                guard let http = response as? HTTPURLResponse,
                      (200...299).contains(http.statusCode) else {
                    errorMessage = "Server error — check your API URL and key."
                    return
                }
                didSave = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) { onSave() }
            }
        }.resume()
    }
}
