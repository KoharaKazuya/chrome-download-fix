//
// [Feature] Hide gray downloading shelf below screen.
//

chrome.downloads.setShelfEnabled(false);

//
// [Feature] Open downloads page when icon clicked.
//

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({ url: "chrome://downloads" });
});

//
// [Feature] Show number badge of download items.
//

function refreshDownloadNumberBadge() {
  chrome.downloads.search({ state: "in_progress" }, results => {
    chrome.storage.local.get({ badge: true }, ({ badge }) => {
      const num = results.length;
      const text = badge && num > 0 ? String(num) : "";
      chrome.browserAction.setBadgeText({ text });
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

function createNotification(type, filename) {
  const base = {
    type: "basic",
    iconUrl: "icons/download.svg",
    title: "Download Started",
    message: filename
  };
  return type === "progress" ? { ...base, type, progress: 0 } : base;
}

chrome.downloads.onCreated.addListener(
  ({ id: downloadItemId, state, filename, totalBytes }) => {
    if (state !== "in_progress") return;

    const noticationType = totalBytes > 0 ? "progress" : "basic";
    chrome.notifications.create(
      createNotification(noticationType, filename),
      notificationId => {
        // keep updating on download
        if (noticationType === "progress") {
          const nextTick = () => {
            chrome.downloads.search({ id: downloadItemId }, downloadItems => {
              if (downloadItems.length === 0) return;
              const { state, bytesReceived, totalBytes } = downloadItems[0];
              if (state !== "in_progress") return;
              if (!(totalBytes > 0)) return;
              const progress = Math.floor((bytesReceived / totalBytes) * 100);
              chrome.notifications.update(notificationId, { progress });
              setTimeout(nextTick, 1000);
            });
          };
          nextTick();
        }

        // remove notification when completed
        const notificationRemover = ({ id, state }) => {
          if (id !== downloadItemId) return;
          if (!state) return;
          if (state.current === "interrupted" || state.current === "complete") {
            chrome.notifications.clear(notificationId);
            chrome.downloads.onChanged.removeListener(notificationRemover);
          }
        };
        chrome.downloads.onChanged.addListener(notificationRemover);
        // remove already completed notification
        chrome.downloads.search({ id: downloadItemId }, downloadItems => {
          if (
            downloadItems.length === 0 ||
            downloadItems[0].state !== "in_progress"
          ) {
            chrome.notifications.clear(notificationId);
            chrome.downloads.onChanged.removeListener(notificationRemover);
          }
        });
      }
    );
  }
);

chrome.downloads.onChanged.addListener(({ id, state }) => {
  if (state && state.previous === "in_progress") {
    chrome.downloads.search({ id }, results => {
      if (!(results.length > 0)) return;
      const { filename } = results[0];

      const success = state.current === "complete";
      chrome.notifications.create({
        type: "basic",
        iconUrl: success ? "icons/success.svg" : "icons/error.svg",
        title: success ? "Download Finished" : "Download Failed",
        message: filename
      });
    });
  }
});
