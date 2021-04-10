//
// [Feature] Hide gray downloading shelf below screen.
//

chrome.downloads.setShelfEnabled(false);

//
// [Feature] Open downloads page when icon clicked.
//

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "chrome://downloads" });
});

//
// [Feature] Show number badge of download items.
//

function refreshDownloadNumberBadge() {
  chrome.downloads.search({ state: "in_progress" }, (results) => {
    chrome.storage.local.get({ badge: true }, ({ badge }) => {
      const num = results.length;
      const text = badge && num > 0 ? String(num) : "";
      chrome.action.setBadgeText({ text });
    });
  });
}
chrome.downloads.onCreated.addListener(refreshDownloadNumberBadge);
chrome.downloads.onErased.addListener(refreshDownloadNumberBadge);
chrome.downloads.onChanged.addListener(refreshDownloadNumberBadge);
chrome.downloads.onDeterminingFilename.addListener(refreshDownloadNumberBadge);

//
// [Feature] Notify start and completion of download.
//

function createNotification({ title, filename, icon }) {
  self.registration.showNotification(title, {
    body: filename,
    icon: `icons/${icon}.svg.png`,
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
});

chrome.downloads.onCreated.addListener(({ state, filename }) => {
  if (state !== "in_progress") return;

  chrome.storage.local.get({ notifyStart: true }, ({ notifyStart }) => {
    if (!notifyStart) return;

    createNotification({
      title: "Download Started",
      filename,
      icon: "download",
    });
  });
});

chrome.downloads.onChanged.addListener(({ id, state }) => {
  if (state?.previous !== "in_progress") return;

  chrome.downloads.search({ id }, (results) => {
    if (!(results.length > 0)) return;
    const { filename } = results[0];

    chrome.storage.local.get(
      { notifySuccess: true, notifyFailure: true },
      ({ notifySuccess, notifyFailure }) => {
        const success = state.current === "complete";
        if ((success && !notifySuccess) || (!success && !notifyFailure)) return;

        createNotification({
          title: `Download ${success ? "Finished" : "Failed"}`,
          filename,
          icon: success ? "success" : "error",
        });
      }
    );
  });
});
