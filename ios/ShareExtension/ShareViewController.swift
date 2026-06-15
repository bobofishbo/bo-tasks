import UIKit
import SwiftUI
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        extractURL()
    }

    private func extractURL() {
        guard
            let item       = extensionContext?.inputItems.first as? NSExtensionItem,
            let attachment = item.attachments?.first
        else { cancel(); return }

        let urlType = UTType.url.identifier
        guard attachment.hasItemConformingToTypeIdentifier(urlType) else { cancel(); return }

        attachment.loadItem(forTypeIdentifier: urlType, options: nil) { [weak self] provider, _ in
            guard let self else { return }

            let urlString: String
            if let url = provider as? URL {
                urlString = url.absoluteString
            } else if let str = provider as? String {
                urlString = str
            } else {
                DispatchQueue.main.async { self.cancel() }
                return
            }

            let platform: String
            if urlString.contains("instagram.com") {
                platform = "instagram"
            } else if urlString.contains("tiktok.com") {
                platform = "tiktok"
            } else {
                DispatchQueue.main.async { self.showUnsupported() }
                return
            }

            DispatchQueue.main.async { self.showShareView(url: urlString, platform: platform) }
        }
    }

    private func showShareView(url: String, platform: String) {
        let view = ShareView(
            url:      url,
            platform: platform,
            onSave:   { [weak self] in self?.extensionContext?.completeRequest(returningItems: nil) },
            onCancel: { [weak self] in self?.cancel() }
        )
        let host = UIHostingController(rootView: view)
        addChild(host)
        self.view.addSubview(host.view)
        host.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            host.view.topAnchor.constraint(equalTo: self.view.topAnchor),
            host.view.leadingAnchor.constraint(equalTo: self.view.leadingAnchor),
            host.view.trailingAnchor.constraint(equalTo: self.view.trailingAnchor),
            host.view.bottomAnchor.constraint(equalTo: self.view.bottomAnchor),
        ])
        host.didMove(toParent: self)
    }

    private func showUnsupported() {
        let label = UILabel()
        label.text = "Only Instagram and TikTok links are supported."
        label.textAlignment = .center
        label.numberOfLines = 0
        label.font = .systemFont(ofSize: 15)
        label.textColor = .secondaryLabel
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
        ])
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak self] in self?.cancel() }
    }

    private func cancel() {
        extensionContext?.cancelRequest(withError: NSError(domain: "BoSpace", code: 0))
    }
}
