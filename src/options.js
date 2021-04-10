import { initialize } from "@ionic/core/components";
import { IonToggle } from "@ionic/core/components/ion-toggle";

initialize();
customElements.define("ion-toggle", IonToggle);

const optionDefault = {
  badge: true,
  notifyStart: true,
  notifySuccess: true,
  notifyFailure: true,
};

chrome.storage.local.get(optionDefault, (items) => {
  for (const key of Object.keys(items)) {
    const elem = document.querySelector(`[data-option-key="${key}"]`);
    elem.checked = Boolean(items[key]);
  }

  for (const switchElement of document.querySelectorAll("[data-option-key]")) {
    const key = switchElement.dataset.optionKey;
    switchElement.addEventListener("ionChange", () => {
      chrome.storage.local.set({ [key]: switchElement.checked });
    });
  }
});
