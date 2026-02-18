import { o as objectModules, h as bodyLockStatus, i as bodyLock, j as bodyUnlock } from "./app.min.js";
/* empty css                */
import "./reviewCart.min.js";
/* empty css                      */
class Modal {
  #isOpen = false;
  #reopen = false;
  #bodyLock = false;
  #focusElements = [
    "a[href]",
    'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
    "button:not([disabled]):not([aria-hidden])",
    "select:not([disabled]):not([aria-hidden])",
    "textarea:not([disabled]):not([aria-hidden])",
    "area[href]",
    "iframe",
    "object",
    "embed",
    "[contenteditable]",
    '[tabindex]:not([tabindex^="-"])'
  ];
  selectorOpen = false;
  youTubeCode = null;
  hash = null;
  dataValue = null;
  lastFocusElement = null;
  targetOpen = {
    selector: null,
    element: null
  };
  previousOpen = {
    selector: null,
    element: null
  };
  lastClosed = {
    selector: null,
    element: null
  };
  constructor(options = {}) {
    let defaultConfig = {
      logging: true,
      init: true,
      focusCatch: true,
      closeEsc: true,
      bodyLock: true,
      setAutoplayYoutube: true,
      hashSettings: {
        location: true,
        goHash: true
      },
      on: {
        beforeOpen: () => {
        },
        afterOpen: () => {
        },
        beforeClose: () => {
        },
        afterClose: () => {
        }
      }
    };
    this.modalClasses = {
      modal: "modal",
      modalWrapper: "modal__wrapper",
      modalContent: "modal__content",
      modalActive: "modal--show",
      bodyActive: "modal-show"
    };
    this.modalAttributes = {
      openButton: "data-modal",
      closeButton: "data-close",
      fixElementSelector: "[data-lp]",
      youtube: "data-modal-youtube",
      youtubePlace: "data-modal-youtube-place"
    };
    this.options = {
      ...defaultConfig,
      ...options,
      hashSettings: {
        ...defaultConfig.hashSettings,
        ...options?.hashSettings
      },
      on: {
        ...defaultConfig.on,
        ...options?.on
      }
    };
    if (this.options.init) {
      this.initModals();
    }
  }
  initModals() {
    this.#modalLogging(`Initializing a modal window`);
    this.eventsModal();
  }
  eventsModal() {
    document.addEventListener("click", (e) => {
      const buttonOpen = e.target.closest(`[${this.modalAttributes.openButton}]`);
      const buttonClose = e.target.closest(`[${this.modalAttributes.closeButton}]`);
      const clickOutside = !e.target.closest(`.${this.modalClasses.modalContent}`) && this.#isOpen;
      if (buttonOpen) {
        e.preventDefault();
        this.dataValue = buttonOpen.getAttribute(this.modalAttributes.openButton) || "error";
        if (this.dataValue === "error") {
          this.#modalLogging(`The attribute is not filled ${buttonOpen.classList}`);
          return;
        }
        if (!this.#isOpen) {
          this.lastFocusElement = buttonOpen;
        }
        this.youTubeCode = buttonOpen.getAttribute(this.modalAttributes.youtube) || null;
        this.targetOpen.selector = `${this.dataValue}`;
        this.selectorOpen = true;
        this.open();
        return;
      }
      if (buttonClose || clickOutside) {
        e.preventDefault();
        this.close();
        return;
      }
    });
    document.addEventListener("keydown", (e) => {
      if (!this.#isOpen) return;
      if (this.options.closeEsc && e.key === "Escape") {
        e.preventDefault();
        this.close();
        return;
      }
      if (this.options.focusCatch && e.key === "Tab") {
        this.#focusCatch(e);
        return;
      }
    });
    if (!this.options.hashSettings.goHash) return;
    window.addEventListener("hashchange", () => {
      window.location.hash ? this.#openToHash() : this.close(this.targetOpen.selector);
    });
    window.addEventListener("load", () => {
      if (window.location.hash) {
        this.#openToHash();
      }
    });
  }
  open(selectorValue) {
    if (!bodyLockStatus) return;
    this.#bodyLock = document.documentElement.classList.contains("lock") && !this.#isOpen ? true : false;
    if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
      this.targetOpen.selector = selectorValue;
      this.selectorOpen = true;
    }
    if (this.#isOpen) {
      this.#reopen = true;
      this.close();
    }
    if (!this.selectorOpen) {
      this.targetOpen.selector = this.lastClosed.selector;
    }
    this.targetOpen.element = document.querySelector(this.targetOpen.selector);
    if (!this.targetOpen.element) {
      this.#modalLogging(`Modal not found. Check the selector.`);
      return;
    }
    if (this.youTubeCode) {
      const iframe = document.createElement("iframe");
      const autoplay = this.options.setAutoplayYoutube ? "1" : "0";
      const mute = this.options.setAutoplayYoutube ? "1" : "0";
      iframe.setAttribute("width", "560");
      iframe.setAttribute("height", "315");
      iframe.setAttribute("title", "YouTube video player");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      iframe.setAttribute(
        "allow",
        `${this.options.setAutoplayYoutube ? "autoplay;" : ""} accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share`
      );
      iframe.setAttribute(
        "src",
        `https://www.youtube.com/embed/${this.youTubeCode}?rel=0&modestbranding=1&autoplay=${autoplay}&mute=${mute}`
      );
      const youtubePlace = this.targetOpen.element.querySelector(`[${this.modalAttributes.youtubePlace}]`);
      youtubePlace?.appendChild(iframe);
    }
    if (this.options.hashSettings.location) {
      this.#getHash();
      this.#setHash();
    }
    this.options.on.beforeOpen(this);
    document.dispatchEvent(
      new CustomEvent("beforeModalOpen", {
        detail: {
          modal: this
        }
      })
    );
    this.targetOpen.element.classList.add(this.modalClasses.modalActive);
    document.documentElement.classList.add(this.modalClasses.bodyActive);
    !this.#reopen ? !this.#bodyLock ? bodyLock() : null : this.#reopen = false;
    this.targetOpen.element.setAttribute("aria-hidden", "false");
    this.previousOpen = { ...this.targetOpen };
    this.selectorOpen = false;
    this.#isOpen = true;
    setTimeout(() => this.#focusTrap(), 50);
    this.options.on.afterOpen(this);
    document.dispatchEvent(
      new CustomEvent("afterModalOpen", {
        detail: {
          modal: this
        }
      })
    );
    this.#modalLogging(`Open modal window`);
  }
  close(selectorValue) {
    if (!this.#isOpen || !bodyLockStatus) return;
    if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
      this.previousOpen.selector = selectorValue;
    }
    this.options.on.beforeClose(this);
    document.dispatchEvent(
      new CustomEvent("beforeModalClose", {
        detail: {
          modal: this
        }
      })
    );
    if (this.youTubeCode) {
      if (this.targetOpen.element.querySelector(`[${this.modalAttributes.youtubePlace}]`)) {
        this.targetOpen.element.querySelector(`[${this.modalAttributes.youtubePlace}]`).innerHTML = "";
      }
      this.youTubeCode = null;
    }
    this.previousOpen.element.classList.remove(this.modalClasses.modalActive);
    if (!this.#reopen) {
      document.documentElement.classList.remove(this.modalClasses.bodyActive);
      !this.#bodyLock ? bodyUnlock() : null;
      this.#isOpen = false;
    }
    setTimeout(() => {
      this.#focusTrap();
      this.previousOpen.element.setAttribute("aria-hidden", "true");
    }, 50);
    this.#removeHash();
    if (this.selectorOpen) {
      this.lastClosed.selector = this.previousOpen.selector;
      this.lastClosed.element = this.previousOpen.element;
    }
    this.options.on.afterClose(this);
    document.dispatchEvent(
      new CustomEvent("afterModalClose", {
        detail: {
          modal: this
        }
      })
    );
    this.#modalLogging(`Close modal window`);
  }
  #getHash() {
    this.hash = this.targetOpen.selector.includes("#") ? this.targetOpen.selector : this.targetOpen.selector.replace(".", "#");
  }
  #openToHash() {
    const classInHash = this.#getHashSelector();
    const button = document.querySelector(`[${this.modalAttributes.openButton} = "${classInHash}"]`) ? document.querySelector(`[${this.modalAttributes.openButton} = "${classInHash}"]`) : document.querySelector(`[${this.modalAttributes.openButton} = "${classInHash.replace(".", "#")}"]`);
    this.youTubeCode = button.getAttribute(this.modalAttributes.youtube) || null;
    if (button && classInHash) {
      this.open(classInHash);
    }
  }
  #getHashSelector() {
    if (document.querySelector(`.${window.location.hash.replace("#", "")}`)) {
      return `.${window.location.hash.replace("#", "")}`;
    } else {
      if (document.querySelector(`${window.location.hash}`)) {
        return `${window.location.hash}`;
      }
    }
  }
  #setHash() {
    history.pushState("", "", this.hash);
  }
  #removeHash() {
    history.pushState("", "", window.location.href.split("#")[0]);
  }
  #focusCatch(e) {
    const focusArray = [...this.targetOpen.element.querySelectorAll(this.#focusElements)];
    const focusedIndex = focusArray.indexOf(document.activeElement);
    if (e.shiftKey && focusedIndex === 0) {
      focusArray[focusArray.length - 1].focus();
      e.preventDefault();
    }
    if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
      focusArray[0].focus();
      e.preventDefault();
    }
  }
  #focusTrap() {
    const focusable = this.previousOpen.element.querySelectorAll(this.#focusElements);
    if (!this.lastFocusElement) {
      this.lastFocusElement = document.querySelectorAll(this.#focusElements)[0];
    }
    if (!this.#isOpen && this.lastFocusElement) {
      this.lastFocusElement.focus();
    } else if (focusable.length) {
      focusable[0].focus();
    }
  }
  #modalLogging(message) {
    if (this.options.logging) ;
  }
}
if (document.querySelector("[data-modal]")) {
  objectModules.modal = new Modal({});
}
