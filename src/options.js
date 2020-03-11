import "@material/mwc-switch";

const optionDefault = {
  badge: true,
  notification: true
};

(function initialize() {
  chrome.storage.local.get(optionDefault, items => {
    for (const key of Object.keys(items)) {
      const elem = document.querySelector(
        `mwc-switch[data-option-key="${key}"]`
      );
      elem.checked = Boolean(items[key]);
    }
  });
})();

for (const switchElement of Array.from(
  document.querySelectorAll("mwc-switch[data-option-key]"),
  x => x
)) {
  const key = switchElement.dataset.optionKey;
  switchElement.addEventListener("change", () => {
    chrome.storage.local.set({ [key]: switchElement.checked });
  });
}
