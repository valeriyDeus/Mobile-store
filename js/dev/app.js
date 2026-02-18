(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const getHash = () => {
  if (location.hash) {
    location.hash.replace("#", "");
  }
};
const setHash = (hash) => {
  hash = hash ? `#${hash}` : window.location.href.split("#")[0];
  history.pushState("", "", hash);
};
const uniqArray = (array) => [...new Set(array)];
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time * 1e3));
const camelCase = (str) => str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
const dataMediaQueries = (array, dataSetValue) => {
  const prop = camelCase(dataSetValue);
  const media = Array.from(array).filter((item) => item.dataset[prop]);
  if (!media.length) return [];
  const breakpointsArray = [];
  media.forEach((item) => {
    const params = item.dataset[prop];
    const breakpoint = {};
    const paramsArray = params.split(",");
    breakpoint.value = paramsArray[0];
    breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
    breakpoint.item = item;
    breakpointsArray.push(breakpoint);
  });
  let mdQueries = breakpointsArray.map((item) => `(${item.type}-width: ${item.value}px),${item.value},${item.type}`);
  mdQueries = uniqArray(mdQueries);
  const mdQueriesArray = [];
  if (mdQueries.length) {
    mdQueries.forEach((breakpoint) => {
      const paramsArray = breakpoint.split(",");
      const mediaBreakpoint = paramsArray[1];
      const mediaType = paramsArray[2];
      const matchMedia = window.matchMedia(paramsArray[0]);
      const itemsArray = breakpointsArray.filter((item) => {
        if (item.value === mediaBreakpoint && item.type === mediaType) {
          return true;
        }
      });
      mdQueriesArray.push({
        itemsArray,
        matchMedia
      });
    });
    return mdQueriesArray;
  }
};
const debounce = (func, delay2 = 250) => {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay2);
  };
};
const setItemToLocalStorage = (key, value) => {
  return localStorage.setItem(key, JSON.stringify(value));
};
const getItemFromLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
};
const removeItemFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};
const formatingValue = (value, fixed = 1) => Number.isInteger(value) ? value.toFixed(fixed) : value.toString();
const detectTouchDevice = () => {
  if (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window) {
    document.documentElement.classList.add("touch");
  } else {
    document.documentElement.classList.remove("touch");
  }
};
const headerHeight = () => {
  const getHeaderHeight = () => {
    const headerHeight2 = document.querySelector(".header").offsetHeight;
    document.querySelector(":root").style.setProperty("--header-height", `${headerHeight2}px`);
  };
  getHeaderHeight();
  window.addEventListener("orientationchange", getHeaderHeight);
  window.addEventListener("resize", debounce(getHeaderHeight, 200));
};
let bodyLockStatus = true;
const bodyUnlock = (delay2 = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.classList.remove("lock");
    }, delay2);
    bodyLockStatus = false;
    setTimeout(() => {
      bodyLockStatus = true;
    }, delay2);
  }
};
const bodyLock = (delay2 = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.classList.add("lock");
    bodyLockStatus = false;
    setTimeout(() => {
      bodyLockStatus = true;
    }, delay2);
  }
};
const bodyLockToggle = (delay2 = 500) => {
  document.documentElement.classList.contains("lock") ? bodyUnlock(delay2) : bodyLock(delay2);
};
const menuClose = () => {
  bodyUnlock();
  document.documentElement.classList.remove("menu-open");
};
const gotoBlock = (targetSelector, config = {}) => {
  const targetBlockElement = typeof targetSelector === "string" ? document.querySelector(targetSelector) : targetSelector;
  if (!targetBlockElement) {
    return;
  }
  let defaultConfig = {
    noHeader: false,
    offsetTop: 0
  };
  const { noHeader, offsetTop } = { ...defaultConfig, ...config };
  const getHeaderHeight = () => {
    const headerElement = document.querySelector("header.header");
    let headerHeight2 = 0;
    if (!headerElement.classList.contains("header-scroll")) {
      headerElement.style.cssText = `transition-duration: 0s;`;
      headerElement.classList.add("header-scroll");
      headerHeight2 = headerElement.offsetHeight;
      headerElement.classList.remove("header-scroll");
      setTimeout(() => {
        headerElement.style.cssText = ``;
      }, 0);
    } else {
      headerHeight2 = headerElement.offsetHeight;
    }
    return headerHeight2;
  };
  const headerItemHeight = noHeader ? getHeaderHeight() : 0;
  const isMenuOpen = document.documentElement.classList.contains("menu-open");
  if (isMenuOpen) menuClose();
  const targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY - headerItemHeight - offsetTop;
  window.scrollTo({
    top: targetBlockElementPosition,
    behavior: "smooth"
  });
};
const _slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("slide")) {
    target.classList.add("slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("slide");
      document.dispatchEvent(
        new CustomEvent("slideUpDone", {
          detail: {
            target
          }
        })
      );
    }, duration);
  }
};
const _slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("slide")) {
    target.classList.add("slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("slide");
      document.dispatchEvent(
        new CustomEvent("slideDownDone", {
          detail: {
            target
          }
        })
      );
    }, duration);
  }
};
const formatDate = (date, sepp = "", monthFormat = "numeric") => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: monthFormat }).toUpperCase();
  const year = d.getFullYear();
  return `${month}${sepp}${day}${sepp}${year}`;
};
const menuInit = () => {
  const burgerIcon = document.querySelector("[data-menu-open]");
  const subMenuLink = document.querySelector("[data-submenu-link]");
  if (burgerIcon && subMenuLink) {
    document.addEventListener("click", (e) => {
      const menuButton = e.target.closest("[data-menu-open]");
      const subMenuLink2 = e.target.closest("[data-submenu-link]");
      const backButton = e.target.closest("[data-submenu-link-back]");
      const isMenuOpen = document.documentElement.classList.contains("menu-open");
      const isOpenSubmenu = document.documentElement.classList.contains("submenu-open");
      if (bodyLockStatus && menuButton) {
        toogleMenu(isMenuOpen);
        return;
      }
      if (menuButton && document.documentElement.classList.contains("search-form-open") && bodyLockStatus) {
        document.documentElement.classList.remove("search-form-open");
        toogleMenu(isMenuOpen);
        return;
      }
      if (subMenuLink2) {
        const subMenu = subMenuLink2.closest(".menu__item").querySelector("[data-submenu]");
        if (subMenu && !subMenu.classList.contains("submenu-open")) {
          removeOpenSubmenus();
          subMenu.classList.add("submenu-open");
          document.documentElement.classList.add("submenu-open");
        } else {
          removeOpenSubmenus();
        }
        e.preventDefault();
      }
      if (!subMenuLink2 && !backButton && isOpenSubmenu && !isMenuOpen) {
        removeOpenSubmenus();
        e.preventDefault();
        return;
      }
      if (backButton && isOpenSubmenu) {
        removeOpenSubmenus();
        e.preventDefault();
        return;
      }
    });
  }
  function toogleMenu(isMenuOpen) {
    if (isMenuOpen) {
      bodyUnlock();
      document.documentElement.classList.remove("menu-open");
    } else {
      bodyLock();
      document.documentElement.classList.add("menu-open");
    }
    removeOpenSubmenus();
  }
  function removeOpenSubmenus() {
    document.documentElement.classList.remove("submenu-open");
    document.querySelectorAll("[data-submenu].submenu-open").forEach((item) => item.classList.remove("submenu-open"));
  }
};
if (document.querySelector("[data-menu]")) {
  menuInit();
}
const formHeaderInit = () => {
  document.addEventListener("click", ({ target }) => {
    const searchButton = target.closest("[data-form-search-button]");
    const searchHeaderForm = target.closest("[data-form-header]");
    const closeButton = target.closest("[data-form-search-close]");
    const isSearchOpen = document.documentElement.classList.contains("search-form-open");
    if (searchHeaderForm && isSearchOpen && !closeButton) return;
    if (bodyLockStatus && searchButton) {
      bodyLockToggle();
      document.documentElement.classList.toggle("search-form-open");
      return;
    }
    if (closeButton && isSearchOpen && bodyLockStatus) {
      document.documentElement.classList.remove("search-form-open");
      bodyLockToggle();
      return;
    }
    if (!searchHeaderForm && isSearchOpen && bodyLockStatus) {
      document.documentElement.classList.remove("search-form-open");
      bodyLockToggle();
      return;
    }
  });
};
formHeaderInit();
let addWindowScrollEvent = false;
const headerScroll = () => {
  addWindowScrollEvent = true;
  const header = document.querySelector("header.header");
  const headerShow = header.hasAttribute("data-header-scroll-show");
  const headerShowTimer = +header.dataset.scrollShow || 500;
  const startPoint = +header.dataset.scroll || 1;
  let scrollDirection = 0;
  let timer;
  document.addEventListener("windowScroll", (e) => {
    const { scrollTop } = e.detail;
    if (scrollTop >= startPoint) {
      toggleClass(header, "header--scroll", true);
      if (headerShow) {
        if (scrollTop > scrollDirection) {
          clearTimeout(timer);
          toggleClass(header, "header--show", false);
        } else {
          toggleClass(header, "header--show", true);
        }
        timer = setTimeout(() => {
          toggleClass(header, "header--show", true);
        }, headerShowTimer);
      }
    } else {
      toggleClass(header, "header--scroll", false);
      if (headerShow) {
        toggleClass(header, "header--show", false);
      }
    }
    scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
  });
  function toggleClass(element, className, condition) {
    if (condition) {
      if (!element.classList.contains(className)) {
        element.classList.add(className);
      }
    } else {
      if (element.classList.contains(className)) {
        element.classList.remove(className);
      }
    }
  }
};
setTimeout(() => {
  if (addWindowScrollEvent) {
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const windowScroll = new CustomEvent("windowScroll", {
        detail: { scrollTop }
      });
      document.dispatchEvent(windowScroll);
    });
  }
}, 0);
headerScroll();
function preloader() {
  const hasPreloaded = localStorage.getItem(location.href) === "preloaded";
  const preloaderEnabled = document.querySelector('[data-preloader="true"]');
  const isPreloaded = hasPreloaded && preloaderEnabled;
  if (!isPreloaded) {
    const preloaderTemplate = `
      <div class="preloader">
        <div class="preloader__loader"></div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", preloaderTemplate);
    document.documentElement.classList.add("loading", "lock");
    document.querySelector(".preloader");
    window.addEventListener("load", () => {
      setTimeout(() => {
        addLoadedClass();
      }, 1e3);
    });
    const preloaderOnce = () => localStorage.setItem(location.href, "preloaded");
    if (document.querySelector('[data-preloader="true"]')) {
      preloaderOnce();
    }
  } else {
    addLoadedClass();
  }
  function addLoadedClass() {
    document.documentElement.classList.add("loaded");
    document.documentElement.classList.remove("loading", "lock");
  }
}
window.addEventListener("DOMContentLoaded", preloader);
const objectModules = {};
const showLoader = (container) => {
  container.querySelector(".loader")?.classList.add("is-loading");
};
const hideLoader = (container) => {
  container.querySelector(".loader")?.classList.remove("is-loading");
};
const FORM_ERRORS = {
  en: {
    valueMissing: "This field is required.",
    validateName: {
      enterName: "Please enter your name.",
      containsNumbers: "Name cannot contain numbers.",
      containsOnlyAlphabet: "Name must contain only letters and start with a capital letter."
    },
    validateEmail: {
      enterEmail: "Please enter your email address.",
      invalidEmail: "Please enter a valid email address.",
      missingAtSymbol: (value) => `Email address must contain "@". "${value}" does not include "@".`
    },
    validatePhone: {
      enterPhone: "Please enter your phone number.",
      invalidPhone: "Please enter a valid phone number."
    },
    validateSelect: "Please select an option from the list."
  },
  uk: {
    valueMissing: "Будь ласка, заповніть це поле.",
    validateName: {
      enterName: `Будь ласка, введіть Ваше ім’я.`,
      containsNumbers: `Ім’я не може містити цифри.`,
      containsOnlyAlphabet: `Ім’я може містити лише літери українського алфавіту та починатися з великої літери.`
    },
    validateEmail: {
      enterEmail: `Будь ласка, введіть Ваш email`,
      invalidEmail: `Ви ввели некоректну єлектронну адресу`,
      missingAtSymbol: (value) => `Електронна адреса має містити символ "@". Єлектронна адреса "${value}" не містить символ "@"`
    },
    validatePhone: {
      enterPhone: "Будь ласка, введіть Ваш номер телефону.",
      invalidPhone: "Ви ввели некоректний номер."
    },
    validateSelect: `Будь ласка, виберіть варіант зі списку.`
  }
};
const FORM_REGEX = {
  uk: {
    name: /^[А-ЩЬЮЯЄІЇҐ][а-щьюяєіїґ']{1,29}(-[А-ЩЬЮЯЄІЇҐ][а-щьюяєіїґ']{1,29})?$/,
    email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/,
    phone: /^\+38\(\d{3}\)\d{3}[\s-]?\d{3}[\s-]?\d{2}$/
  },
  en: {
    name: /^[A-Z][a-z']{1,29}(-[A-Z][a-z']{1,29})?$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    //ChatGPT
    // phone: /^\+1\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/, // США/Канада
    phone: /^\+38\(\d{3}\)\d{3}[\s-]?\d{3}[\s-]?\d{2}$/
  }
};
const initCheckoutTotals = () => {
  const checkout = document.querySelector("[data-page-checkout]");
  if (!checkout) return;
  const subtotalElement = checkout.querySelector("[data-subtotal]").querySelector(".total-page__value");
  const totalElement = checkout.querySelector("[data-total]").querySelector(".total-page__value");
  const totalObject = getItemFromLocalStorage("cartTotal");
  if (!totalObject) {
    subtotalElement.textContent = "$0.00";
    totalElement.textContent = "$0.00";
    return;
  }
  const { subtotal, total } = totalObject;
  subtotalElement.textContent = `$${formatingValue(subtotal, 2)}`;
  totalElement.textContent = `$${formatingValue(total, 2)}`;
};
if (document.querySelector("[data-page-checkout]")) {
  initCheckoutTotals();
}
const updateCartButtonProduct = (button, isAdded) => {
  button.classList.toggle("is-added", isAdded);
  const addCartButtonText = button.querySelector("span");
  addCartButtonText.textContent = isAdded ? "Remove from cart" : "Add to cart";
  button.setAttribute("aria-label", isAdded ? "Remove from cart" : "Add to cart");
};
const syncCartFromStorage = async (container = document) => {
  const cart2 = getItemFromLocalStorage("cart") || [];
  const cartCounter = document.querySelector("[data-cart] span");
  if (!cart2.length) {
    if (cartCounter) {
      cartCounter.textContent = `(${cart2.length})`;
    }
    return;
  }
  const products2 = container.querySelectorAll("[data-product-id]");
  products2.forEach(async (productEl) => {
    const productId = +productEl.dataset.productId;
    const inCart = cart2.some((item) => item.productId === productId);
    if (inCart) {
      productEl.classList.add("is-cart-added");
      const button = productEl.querySelector("[data-add-to-cart]");
      if (button) updateCartButtonProduct(button, true);
    }
  });
  if (cartCounter) {
    cartCounter.textContent = `(${cart2.length})`;
  }
};
const saveToLocalStorage = (product, counter) => {
  const cart2 = JSON.parse(localStorage.getItem("cart")) || [];
  const productId = +product.dataset.productId;
  const index = cart2.findIndex((item) => item.productId === productId);
  if (index !== -1) {
    cart2.splice(index, 1);
  } else {
    const cartItem = {
      productId,
      title: product.querySelector("[data-product-title]")?.dataset.productTitle || "",
      price: +product.querySelector("[data-product-price]")?.dataset.productPrice || 0,
      image: product.querySelector("img")?.getAttribute("src") || "",
      addCount: product.querySelector("[data-quantity-value]")?.value || 1
    };
    cart2.push(cartItem);
  }
  setItemToLocalStorage("cart", cart2);
  if (counter) {
    counter.textContent = `(${cart2.length})`;
  }
};
const addToCart = (e) => {
  console.log(e.target, "До");
  if (!e.target.closest("[data-add-to-cart]")) return;
  console.log(e.target, "После");
  const addToCartButton = e.target.closest("[data-add-to-cart]");
  const currentProduct = addToCartButton.closest("[data-product-cart]");
  if (!currentProduct) return;
  const cart2 = document.querySelector("[data-cart]");
  const cartCounter = cart2.querySelector("span");
  const addCartButton = currentProduct.querySelector("[data-add-to-cart]");
  const isAdded = currentProduct.classList.contains("is-cart-added");
  currentProduct.classList.toggle("is-cart-added", !isAdded);
  updateCartButtonProduct(addCartButton, !isAdded);
  saveToLocalStorage(currentProduct, cartCounter);
};
if (document.querySelector("[data-products]")) {
  document.addEventListener("click", addToCart);
}
const lang = document.documentElement.lang || "uk";
class FormsValidation {
  constructor(options) {
    let defaultConfig = {
      logging: true,
      errorMessages: FORM_ERRORS[lang] || FORM_ERRORS.uk,
      reqexp: FORM_REGEX[lang] || FORM_REGEX.uk,
      on: {
        formSend: () => {
        }
      }
    };
    this.config = {
      ...defaultConfig,
      ...options,
      errorMessages: {
        ...defaultConfig.errorMessages,
        ...options?.errorMessages
      },
      reqexp: {
        ...defaultConfig.reqexp,
        ...options?.reqexp
      },
      on: {
        ...defaultConfig.on,
        ...options?.on
      }
    };
    this.errorsLength = 0;
    this.formAttributes = {
      required: "data-form-required",
      validate: "data-form-validate",
      noValidate: "data-form-novalidate",
      noFocusClasses: "data-form-nofocus-classes",
      formModalMessage: "data-form-modal-message",
      gotoError: "data-form-goto-error",
      error: "data-form-error"
    };
    this.formClasses = {
      formFocus: "form-focus",
      formSuccess: "form-success",
      formError: "form-error",
      formSending: "form-sending"
    };
    this.formEvents();
  }
  formEvents() {
    document.addEventListener("focusin", ({ target }) => this.focusIn(target));
    document.addEventListener("focusout", ({ target }) => this.focusOut(target));
    document.addEventListener("change", ({ target }) => this.inputChange(target));
    document.addEventListener("selectCallback", ({ detail }) => this.selectChange(detail));
    document.addEventListener("submit", (e) => this.formSubmit(e));
  }
  formSubmit(e) {
    const formElement = e.target.closest("[data-form-validation]");
    if (!formElement) return;
    this.formSubmitAction(formElement, e);
  }
  async formSubmitAction(form, e) {
    e.preventDefault();
    const error = !form.hasAttribute(this.formAttributes.noValidate) ? this.getErrorField(form) : true;
    if (!error) {
      if (form.querySelector(this.formClasses.formError) && form.hasAttribute(this.formAttributes.gotoError)) {
        const formGoToErrorClass = form.dataset.formGotoError || ".form-error";
        gotoBlock(formGoToErrorClass, { noHeader: true, speed: 1e3 });
      }
      return;
    }
    const mode = form.dataset.formValidation;
    try {
      if (mode === "ajax") await this.#handleAjax(form);
      if (mode === "dev") this.formSending(form);
    } catch (error2) {
      this.#formLogging(error2);
    } finally {
      form.classList.remove(this.formClasses.formSending);
    }
  }
  async #handleAjax(form) {
    const action = form.getAttribute("action")?.trim() || "#";
    const method = form.getAttribute("method")?.trim() || "GET";
    const formData = new FormData(form);
    form.classList.add(this.formClasses.formSending);
    const response = await fetch(action, {
      method,
      body: method !== "GET" ? formData : null
    });
    if (!response.ok) throw new Error("Щось пішло не так!");
    const data = await response.json();
    this.formSending(form, data);
  }
  formSending(form, responseResult = ``) {
    document.dispatchEvent(
      new CustomEvent("formSent", {
        detail: {
          form,
          response: responseResult
        }
      })
    );
    setTimeout(() => {
      if (objectModules.modal && form.hasAttribute(this.formAttributes.formModalMessage)) {
        const { formModalMessage } = form.dataset;
        if (formModalMessage) {
          objectModules.modal.open(formModalMessage);
        }
      }
    }, 0);
    this.config.on.formSend(form, responseResult);
    this.formClean(form);
    this.#formLogging(`Form send!`);
  }
  formClean(form) {
    form.reset();
    setTimeout(() => {
      const inputs = form.querySelectorAll("input,textarea");
      const checkboxes = form.querySelectorAll("input[type=checkbox]");
      const radioButtons = form.querySelectorAll("input[type=radio]");
      if (inputs.length > 0) {
        inputs.forEach((input) => {
          this.removeFieldError(input);
          this.removeFieldSuccess(input);
        });
      }
      if (checkboxes.length > 0) {
        checkboxes.forEach((checkbox) => checkbox.checked = false);
      }
      if (radioButtons.length > 0) {
        radioButtons.forEach((radio) => radio.checked = false);
      }
      if (objectModules.select) {
        const selects = form.querySelectorAll("div.select");
        if (selects.length > 0) {
          selects.forEach((selectItem) => {
            const originalSelect = selectItem.querySelector("select");
            const { options, multiple } = originalSelect;
            this.removeSelectFieldError(selectItem, originalSelect);
            this.removeSelectFieldSuccess(selectItem, originalSelect);
            Array.from(options).forEach((option, index) => {
              if (!multiple) {
                index === 0 ? option.setAttribute("selected", "") : option.removeAttribute("selected");
              } else {
                option.removeAttribute("selected");
              }
            });
            objectModules.select.selectBuild(originalSelect);
          });
        }
      }
    }, 0);
  }
  inputChange(target) {
    const { type } = target;
    if (type === "checkbox" || type === "radio") {
      this.validateField(target);
    }
  }
  focusIn(target) {
    const { tagName } = target;
    if (tagName === "INPUT" || tagName === "TEXTAREA") {
      if (!target.hasAttribute(this.formAttributes.noFocusClasses)) {
        target.classList.add(this.formClasses.formFocus);
        target.parentElement.classList.add(this.formClasses.formFocus);
      }
      if (target.hasAttribute(this.formAttributes.validate)) {
        this.removeFieldError(target);
      }
    }
  }
  focusOut(target) {
    const { tagName } = target;
    if (tagName === "INPUT" || tagName === "TEXTAREA") {
      if (!target.hasAttribute(this.formAttributes.noFocusClasses)) {
        target.classList.remove(this.formClasses.formFocus);
        target.parentElement.classList.remove(this.formClasses.formFocus);
      }
      if (target.hasAttribute(this.formAttributes.validate)) {
        this.validateField(target);
      }
    }
  }
  selectChange(detail) {
    const { select } = detail;
    if (select) this.validateField(select);
  }
  getErrorField(form) {
    const selector = `*[${this.formAttributes.required}]`;
    const insideForm = form.querySelectorAll(selector);
    const linkedToForm = document.querySelectorAll(`${selector}[form="${form.id}"]`);
    const formRequiredItems = [...insideForm, ...linkedToForm];
    let errorCount = 0;
    formRequiredItems.forEach((formRequiredItem) => {
      if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
        const isValid = this.validateField(formRequiredItem);
        if (!isValid) errorCount++;
      }
    });
    return errorCount === 0;
  }
  validateField(formRequiredItem) {
    const { formRequired } = formRequiredItem.dataset;
    const { type, tagName } = formRequiredItem;
    const isRequired = formRequired !== void 0;
    let isValid = true;
    if (formRequired === "name") {
      isValid = this.#validateName(formRequiredItem);
    }
    if (formRequired === "email") {
      isValid = this.#validateEmail(formRequiredItem);
    }
    if (formRequired === "phone") {
      isValid = this.#validatePhone(formRequiredItem);
    }
    if (type === "checkbox" && isRequired) {
      console.log(formRequired);
      isValid = this.#validateCheckbox(formRequiredItem);
    }
    if (type === "radio") {
      isValid = this.#validateRadio(formRequiredItem);
    }
    if (objectModules.select && tagName === "SELECT") {
      isValid = this.#validateSelect(formRequiredItem);
    }
    if (tagName !== "SELECT" && type !== "checkbox" && type !== "radio" && isRequired) {
      isValid = this.#validateRequiredField(formRequiredItem);
    }
    return isValid;
  }
  #validateName(formRequiredItem) {
    if (!formRequiredItem.value.trim()) {
      this.removeFieldSuccess(formRequiredItem);
      this.addFieldError(formRequiredItem, this.config.errorMessages.validateName.enterName);
      return false;
    }
    formRequiredItem.value = formRequiredItem.value.replace(/\s+/g, " ");
    if (this.#digitsTest(formRequiredItem)) {
      this.removeFieldSuccess(formRequiredItem);
      this.addFieldError(formRequiredItem, this.config.errorMessages.validateName.containsNumbers);
      return false;
    }
    if (this.#nameTest(formRequiredItem)) {
      this.removeFieldSuccess(formRequiredItem);
      this.addFieldError(formRequiredItem, this.config.errorMessages.validateName.containsOnlyAlphabet);
      return false;
    }
    this.removeFieldError(formRequiredItem);
    this.addFieldSuccess(formRequiredItem);
    return true;
  }
  #validateEmail(formRequiredItem) {
    if (!formRequiredItem.value.trim()) {
      this.removeFieldSuccess(formRequiredItem);
      this.addFieldError(formRequiredItem, this.config.errorMessages.validateEmail.enterEmail);
      return false;
    }
    formRequiredItem.value = formRequiredItem.value.replace(" ", "");
    if (this.#emailTest(formRequiredItem)) {
      this.removeFieldSuccess(formRequiredItem);
      this.addFieldError(formRequiredItem, this.config.errorMessages.validateEmail.invalidEmail);
      if (!formRequiredItem.value.includes("@")) {
        this.addFieldError(
          formRequiredItem,
          this.config.errorMessages.validateEmail.missingAtSymbol(formRequiredItem.value)
        );
      }
      return false;
    }
    this.removeFieldError(formRequiredItem);
    this.addFieldSuccess(formRequiredItem);
    return true;
  }
  #validatePhone(formRequiredItem) {
    if (!formRequiredItem.value.trim()) {
      this.removeFieldSuccess(formRequiredItem);
      this.addFieldError(formRequiredItem, this.config.errorMessages.validatePhone.enterPhone);
      return false;
    }
    formRequiredItem.value = formRequiredItem.value.replace(" ", "");
    if (this.#phoneTest(formRequiredItem)) {
      this.addFieldError(formRequiredItem, this.config.errorMessages.validatePhone.invalidPhone);
      this.removeFieldSuccess(formRequiredItem);
      return false;
    }
    this.removeFieldError(formRequiredItem);
    this.addFieldSuccess(formRequiredItem);
    return true;
  }
  #validateCheckbox(formRequiredItem) {
    if (!formRequiredItem.checked) {
      this.addFieldError(formRequiredItem, this.config.errorMessages.valueMissing);
      this.removeFieldSuccess(formRequiredItem);
      return false;
    }
    this.removeFieldError(formRequiredItem);
    this.addFieldSuccess(formRequiredItem);
  }
  #validateRadio(formRequiredItem) {
    const { name } = formRequiredItem;
    const radioGroup = document.querySelectorAll(`input[name="${name}"]`);
    const isChecked = Array.from(radioGroup).some((radio) => radio.checked);
    const parentBlock = formRequiredItem.closest("fieldset") || formRequiredItem.parentElement;
    const formErrorItem = parentBlock.querySelector(".form__error");
    if (formErrorItem) parentBlock.removeChild(formErrorItem);
    if (!isChecked) {
      if (!formErrorItem && parentBlock.hasAttribute(this.formAttributes.error)) {
        const { formError } = parentBlock.dataset;
        parentBlock.insertAdjacentHTML(
          "beforeend",
          this.getFormErrorHTML(formError, this.config.errorMessages.valueMissing)
        );
      }
      radioGroup.forEach((radio) => {
        this.addFieldError(radio);
        this.removeFieldSuccess(radio);
      });
      if (!parentBlock.classList.contains(this.formClasses.formError)) {
        parentBlock.classList.remove(this.formClasses.formSuccess);
        parentBlock.classList.add(this.formClasses.formError);
      }
      return false;
    }
    radioGroup.forEach((radio) => {
      this.removeFieldError(radio);
      this.addFieldSuccess(radio);
    });
    if (parentBlock.classList.contains(this.formClasses.formError)) {
      parentBlock.classList.remove(this.formClasses.formError);
      parentBlock.classList.add(this.formClasses.formSuccess);
    }
    return true;
  }
  #validateSelect(formRequiredItem) {
    const selectItem = formRequiredItem.parentElement;
    const isValid = formRequiredItem.multiple ? [...formRequiredItem.selectedOptions].some((option) => option.value) : Boolean(formRequiredItem.value.trim());
    if (!isValid) {
      this.removeSelectFieldSuccess(selectItem, formRequiredItem);
      this.addSelectFieldError(selectItem, formRequiredItem, this.config.errorMessages.validateSelect);
      return false;
    }
    this.removeSelectFieldError(selectItem, formRequiredItem);
    this.addSelectFieldSuccess(selectItem, formRequiredItem);
    return true;
  }
  #validateRequiredField(formRequiredItem) {
    if (!formRequiredItem.value.trim()) {
      this.removeFieldSuccess(formRequiredItem);
      this.addFieldError(formRequiredItem, this.config.errorMessages.valueMissing);
      return false;
    }
    this.removeFieldError(formRequiredItem);
    this.addFieldSuccess(formRequiredItem);
    return true;
  }
  addSelectFieldError(selectItem, originalSelect, errorMessage = "") {
    const parentSelectFormField = this.getFieldParent(selectItem);
    const formErrorItem = parentSelectFormField.querySelector(".form__error");
    if (formErrorItem) formErrorItem.remove();
    this.formFieldsToggleErrorClass(selectItem, parentSelectFormField, true);
    this.formFieldSetInvalidAttr(originalSelect);
    this.formFieldSetInvalidAttr(selectItem);
    if (originalSelect.hasAttribute(this.formAttributes.error)) {
      const { formError } = originalSelect.dataset;
      parentSelectFormField.insertAdjacentHTML("beforeend", this.getFormErrorHTML(formError, errorMessage));
    }
  }
  removeSelectFieldError(selectItem) {
    const parentSelectFormField = this.getFieldParent(selectItem);
    const formErrorItem = parentSelectFormField.querySelector(".form__error");
    if (formErrorItem) formErrorItem.remove();
    this.formFieldsToggleErrorClass(selectItem, parentSelectFormField);
  }
  addSelectFieldSuccess(selectItem, originalSelect) {
    const parentSelectFormField = this.getFieldParent(selectItem);
    this.formFieldsToggleSuccessClass(selectItem, parentSelectFormField, true);
    this.formFieldSetInvalidAttr(originalSelect, false);
    this.formFieldSetInvalidAttr(selectItem, false);
  }
  removeSelectFieldSuccess(selectItem) {
    const parentSelectFormField = this.getFieldParent(selectItem);
    this.formFieldsToggleSuccessClass(selectItem, parentSelectFormField);
  }
  addFieldError(formRequiredItem, errorMessage = "") {
    const parentFormField = formRequiredItem.parentElement;
    const formErrorItem = parentFormField.querySelector(".form__error");
    if (formErrorItem) {
      parentFormField.removeChild(formErrorItem);
    }
    if (formRequiredItem.hasAttribute(this.formAttributes.error)) {
      const { formError } = formRequiredItem.dataset;
      parentFormField.insertAdjacentHTML("beforeend", this.getFormErrorHTML(formError, errorMessage));
    }
    this.formFieldsToggleErrorClass(formRequiredItem, parentFormField, true);
    this.formFieldSetInvalidAttr(formRequiredItem);
  }
  removeFieldError(formRequiredItem) {
    const parentFormField = this.getFieldParent(formRequiredItem);
    const formErrorItem = parentFormField.querySelector(".form__error");
    if (formErrorItem) {
      parentFormField.removeChild(formErrorItem);
    }
    this.formFieldsToggleErrorClass(formRequiredItem, parentFormField);
  }
  addFieldSuccess(formRequiredItem) {
    const parentFormField = this.getFieldParent(formRequiredItem);
    this.formFieldsToggleSuccessClass(formRequiredItem, parentFormField, true);
    this.formFieldSetInvalidAttr(formRequiredItem, false);
  }
  removeFieldSuccess(formRequiredItem) {
    const parentFormField = this.getFieldParent(formRequiredItem);
    this.formFieldsToggleSuccessClass(formRequiredItem, parentFormField);
  }
  formFieldSetInvalidAttr(formRequiredItem, isInvalid = true) {
    formRequiredItem.setAttribute("aria-invalid", `${isInvalid ? true : false}`);
  }
  formFieldsToggleSuccessClass(formRequiredItem, parentFormField, isSuccess = false) {
    if (!isSuccess) {
      formRequiredItem.classList.remove(this.formClasses.formSuccess);
      parentFormField.classList.remove(this.formClasses.formSuccess);
    } else {
      formRequiredItem.classList.add(this.formClasses.formSuccess);
      parentFormField.classList.add(this.formClasses.formSuccess);
    }
  }
  formFieldsToggleErrorClass(formRequiredItem, parentFormField, isError = false) {
    if (!isError) {
      formRequiredItem.classList.remove(this.formClasses.formError);
      parentFormField.classList.remove(this.formClasses.formError);
    } else {
      formRequiredItem.classList.add(this.formClasses.formError);
      parentFormField.classList.add(this.formClasses.formError);
    }
  }
  getFormErrorHTML(error, errorMassage) {
    return `<span class="form__error">${error || errorMassage}</span>`;
  }
  getFieldParent(formRequiredItem) {
    return formRequiredItem.closest(".form__field") || formRequiredItem.parentElement || formRequiredItem;
  }
  #nameTest(formRequiredItem) {
    return !this.config.reqexp.name.test(formRequiredItem.value);
  }
  #emailTest(formRequiredItem) {
    return !this.config.reqexp.email.test(formRequiredItem.value);
  }
  #phoneTest(formRequiredItem) {
    return !this.config.reqexp.phone.test(formRequiredItem.value);
  }
  #digitsTest(formRequiredItem) {
    return /\d/.test(formRequiredItem.value);
  }
  #formLogging(message) {
    if (this.config.logging) ;
  }
}
objectModules.formsValidation = new FormsValidation({
  on: {
    formSend: (form) => {
      if (form.classList.contains("checkout-form")) {
        removeItemFromLocalStorage("cart");
        removeItemFromLocalStorage("cartTotal");
        syncCartFromStorage();
        initCheckoutTotals();
      }
    }
  }
});
class DynamicAdapt {
  constructor(type) {
    this.type = type;
    this.init();
  }
  init() {
    this.objects = [];
    this.daClassName = "dynamic-adapt";
    this.nodes = [...document.querySelectorAll("[data-dynamic-adapt]")];
    this.nodes.forEach((node) => {
      const data = node.dataset.dynamicAdapt ? node.dataset.dynamicAdapt.trim() : null;
      if (!data) return;
      const dataArray = data.split(",");
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destination = document.querySelector(`${dataArray[0].trim()}`);
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : "767.98";
      object.place = dataArray[2] ? dataArray[2].trim() : "last";
      object.index = this.indexInParent(object.parent, object.element);
      this.objects.push(object);
    });
    this.arraySort(this.objects);
    this.mediaQueries = Array.from(
      new Set(this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`))
    );
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
      matchMedia.addEventListener("change", () => this.mediaHandler(matchMedia, objectsFilter));
      this.mediaHandler(matchMedia, objectsFilter);
    });
  }
  // Основна функція
  mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        this.moveTo(object.place, object.element, object.destination);
      });
    } else {
      objects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassName)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  // Функція переміщення
  moveTo(place, element, destination) {
    element.classList.add(this.daClassName);
    if (place === "last" || place >= destination.children.length) {
      destination.append(element);
      return;
    }
    if (place === "first") {
      destination.prepend(element);
      return;
    }
    destination.children[place].before(element);
  }
  // Функція повернення
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassName);
    if (parent.children[index] !== void 0) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  // Функція отримання індексу всередині батьківського єлементу
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  // Функція сортування масиву по breakpoint та place
  arraySort(arr) {
    arr.sort((a, b) => {
      if (a.breakpoint === b.breakpoint) {
        return this.#comparePlace(a, b);
      }
      return this.type === "min" ? a.breakpoint - b.breakpoint : b.breakpoint - a.breakpoint;
    });
  }
  // Допоміжна функція для порівняння place
  #comparePlace(a, b) {
    if (a.place === b.place) {
      return 0;
    }
    if (a.place === "first" || b.place === "last") {
      return -1;
    }
    if (a.place === "last" || b.place === "first") {
      return 1;
    }
    return 0;
  }
}
window.addEventListener("DOMContentLoaded", () => new DynamicAdapt("max"));
const products = [{ "id": 1, "type": "phones", "brand": "apple", "title": "Apple iPhone 10", "image": "assets/img/products/mobile/01.png", "price": 980, "link": "#", "count": 4 }, { "id": 2, "type": "phones", "brand": "apple", "title": "Apple iPhone 11", "image": "assets/img/products/mobile/02.png", "price": 1100, "link": "#", "count": 8 }, { "id": 3, "type": "phones", "brand": "apple", "title": "Apple iPhone 8", "image": "assets/img/products/mobile/03.png", "price": 780, "link": "#", "count": 1 }, { "id": 4, "type": "phones", "brand": "apple", "title": "Apple iPhone 13 Pro", "image": "assets/img/products/mobile/04.png", "price": 1500, "link": "#", "count": 5 }, { "id": 5, "type": "phones", "brand": "apple", "title": "Apple iPhone 17 Pro Max", "image": "assets/img/products/mobile/01.png", "price": 2300, "link": "#", "count": 9 }, { "id": 6, "type": "phones", "brand": "apple", "title": "Apple iPhone 14", "image": "assets/img/products/mobile/02.png", "price": 1100, "link": "#", "count": 15 }, { "id": 7, "type": "watches", "brand": "apple", "title": "Apple Watch SE 3", "image": "assets/img/products/watches/01.png", "price": 870, "link": "#", "count": 12 }, { "id": 8, "sku": "1234", "type": "watches", "brand": "apple", "title": "Apple Watch Series 11", "image": "assets/img/products/watches/02.png", "price": 1200, "rating": 5, "category": ["Watch", "Screen touch"], "colors": ["orange", "green", "blue", "black"], "sizes": ["xl", "l", "m", "s"], "tags": ["classic", "modern"], "desc": "Justo, cum feugiat imperdiet nulla molestie ac vulputate scelerisque amet. Bibendum adipiscing platea blandit sit sed quam semper rhoncus. Diam ultrices maecenas consequat eu tortor orci, cras lectus mauris, cras egestas quam venenatis neque.", "link": "#", "count": 4, "reviews": 2 }, { "id": 9, "type": "watches", "brand": "apple", "title": "Apple Watch Ultra", "image": "assets/img/products/watches/03.png", "price": 2350, "link": "#", "count": 20 }, { "id": 10, "type": "watches", "brand": "apple", "title": "Apple Watch Ultra + eSIM", "image": "assets/img/products/watches/04.png", "price": 650, "link": "#", "count": 17 }, { "id": 11, "type": "watches", "brand": "apple", "title": "Apple Watch Series 10", "image": "assets/img/products/watches/01.png", "price": 870, "link": "#", "count": 5 }, { "id": 12, "type": "watches", "brand": "apple", "title": "Apple Watch Series 11", "image": "assets/img/products/watches/02.png", "price": 680, "link": "#", "count": 14 }, { "id": 13, "type": "tablets", "brand": "apple", "title": "Apple iPad 11 Pro", "image": "assets/img/products/tablets/01.jpg", "price": 2e3, "link": "#", "count": 7 }, { "id": 14, "type": "tablets", "brand": "samsung", "title": "Samsung Tab S10", "image": "assets/img/products/tablets/02.jpg", "price": 1800, "link": "#", "count": 14 }];
const productsData$1 = {
  products
};
const getProducts = async () => {
  return productsData$1?.products || [];
};
const spritemapPath = "./assets/img/spritemap.svg";
const addIcon = (id) => `<svg><use xlink:href="${spritemapPath}#sprite-${id}"></use></svg>`;
const createProductHTML = (product, sliderBlock = false) => {
  const { id, type, image, title, price, link } = product;
  return `
      <article class="${sliderBlock ? "slider-block__item swiper-slide" : ""} item-product" data-product-cart=${type} data-product-id=${id}>
        <div class="item-product__top">
          <a class="item-product__image" href="${link}">
            <img src="${image}" width="310" height="418" loading="lazy" alt="${title}" />
          </a>
          <button class="item-product__add-cart" data-add-to-cart aria-label="Add to cart" title="To buy" type="button">
            <span>Add to cart</span>
            ${addIcon("cart")}
          </button>
        </div>
        <div class="item-product__body">
          <h3 class="item-product__title">
            <a class="item-product__link-title" href="${link}" data-product-title="${title}" title="${title}">${title}</a>
          </h3>
          <div class="item-product__price" data-product-price="${price}">$${price}</div>
        </div>
    </article>
  `;
};
const formSearch = document.querySelector(".search-header__form");
const headerSearchSectionTaps = document.querySelector(".body-search__section--taps");
const bodySearchSectionProducts = document.querySelector(".body-search__section--products");
const bodySearchProductsContainer = bodySearchSectionProducts.querySelector(".body-search__items ");
const bodyListTaps = headerSearchSectionTaps.querySelector(".body-search__list--taps");
const productsData = await getProducts();
const maxProducts = 4;
let searchProductsArray = [];
const clearSearch = (input) => {
  input.value = "";
  bodyListTaps.innerHTML = "";
  headerSearchSectionTaps.classList.remove("is-searching");
};
const normalizeValue = (value = "") => value.toLowerCase().trim().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, "");
const tapItemHTML = (highlightedTitle, title) => {
  return `
      <li class="body-search__item" data-title="${title}">
        <button class="body-search__button" title="${title}" type="button">
          <span>${highlightedTitle}</span>
        </button>
      </li>
    `;
};
const displayDefaultProducts = (productsArray = []) => {
  if (productsArray.length) {
    productsArray.slice(0, maxProducts).forEach((product) => {
      renderProducts(product);
    });
    return;
  }
  productsData.slice(0, maxProducts).forEach((product) => {
    renderProducts(product);
  });
};
const renderProducts = async (product) => {
  bodySearchProductsContainer.insertAdjacentHTML("beforeend", createProductHTML(product));
  await syncCartFromStorage();
};
const highlightText = (text, searchValue) => {
  if (!searchValue) return text;
  const cleanSearch = normalizeValue(searchValue);
  if (!cleanSearch) return text;
  const reg = new RegExp(`(${escapeRegExp(cleanSearch)})`, "giu");
  return text.replace(reg, '<span class="body-search__hit">$1</span>');
};
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const searchProducts = (productsData2, value) => {
  const searchValue = normalizeValue(value);
  if (!searchValue) {
    bodyListTaps.innerHTML = "";
    bodySearchProductsContainer.innerHTML = "";
    headerSearchSectionTaps.classList.remove("is-searching");
    displayDefaultProducts(searchProductsArray);
    searchProductsArray = [];
    return;
  }
  const searchWords = searchValue.split(" ");
  bodyListTaps.innerHTML = "";
  bodySearchProductsContainer.innerHTML = "";
  const results = productsData2.filter((product) => {
    const normalizedTitle = normalizeValue(product.title);
    return searchWords.every((word) => normalizedTitle.includes(word));
  });
  headerSearchSectionTaps.classList.add("is-searching");
  if (!results.length) {
    bodyListTaps.innerHTML = '<p class="body-search__empty">Nothing found</p>';
    return;
  }
  results.slice(0, 4).forEach((product) => {
    const highlightedTitle = highlightText(product.title, value);
    bodyListTaps.insertAdjacentHTML("beforeend", tapItemHTML(highlightedTitle, product.title));
    renderProducts(product);
    searchProductsArray.push(product);
  });
};
const formSearchAction = (value) => {
  if (!productsData) return;
  searchProducts(productsData, value);
};
if (formSearch) {
  const searchInput = formSearch.querySelector("input");
  const searchFormButton = document.querySelector("[data-form-search-button]");
  const debouncedFilter = debounce(formSearchAction, 200);
  displayDefaultProducts();
  searchFormButton.addEventListener("click", ({ target }) => {
    if (target.closest("[data-form-search-button]")) {
      clearSearch(searchInput);
    }
  });
  searchInput.addEventListener("input", (e) => debouncedFilter(e.target.value));
}
const formQuantity = () => {
  const quantityActions = (e) => {
    const { type, target } = e;
    if (!target.closest("[data-quantity]")) return;
    if (type === "click") {
      const isIncrement = target.closest("[data-quantity-plus]");
      const isDecrement = target.closest("[data-quantity-minus]");
      if (!isIncrement && !isDecrement) return;
      if (isIncrement || isDecrement) {
        const valueElement = target.closest("[data-quantity]").querySelector("[data-quantity-value]");
        if (!valueElement) return;
        const minQuantity = parseInt(valueElement.dataset.quantityMin, 10) || 1;
        const maxQuantity = parseInt(valueElement.dataset.quantityMax, 10) || Infinity;
        let value = parseInt(valueElement.getAttribute("value"), 10) || minQuantity;
        if (isIncrement) {
          value = Math.min(value + 1, maxQuantity);
        } else if (isDecrement) {
          value = Math.max(value - 1, minQuantity);
        }
        valueElement.setAttribute("value", value);
        valueElement.value = value;
      }
    }
    if (type === "input") {
      if (!target.closest("[data-quantity-value]")) return;
      const valueElement = target.closest("[data-quantity-value]");
      if (/[^0-9]/gi.test(valueElement.value)) {
        valueElement.setAttribute("value", 1);
        valueElement.value = 1;
      }
    }
    if (type === "focusout") {
      if (!target.closest("[data-quantity-value]")) return;
      const valueElement = target.closest("[data-quantity-value]");
      const minQuantity = parseInt(valueElement.dataset.quantityMin, 10) || 1;
      const maxQuantity = parseInt(valueElement.dataset.quantityMax, 10) || Infinity;
      let value = parseInt(valueElement.getAttribute("value"), 10) || minQuantity;
      if (isNaN(value) || value < minQuantity) {
        valueElement.setAttribute("value", minQuantity);
        valueElement.value = minQuantity;
        return;
      }
      if (value < minQuantity) {
        valueElement.setAttribute("value", minQuantity);
        valueElement.value = minQuantity;
      }
      if (maxQuantity && value > maxQuantity) {
        valueElement.setAttribute("value", maxQuantity);
        valueElement.value = maxQuantity;
      }
    }
  };
  document.addEventListener("click", quantityActions);
  document.addEventListener("input", quantityActions);
  document.addEventListener("focusout", quantityActions);
};
const cart = document.querySelector("[data-page-cart]");
if (cart) {
  const listCart = cart.querySelector("[data-list-cart]");
  const subtotalElement = cart.querySelector("[data-subtotal]").querySelector(".total-page__value");
  const totalElement = cart.querySelector("[data-total]").querySelector(".total-page__value");
  const productCartHTML = (product) => {
    const { productId, title, price, image, count, addCount } = product;
    return `
        <li class="list-cart__item">
          <div class="list-cart__product" data-product-id="${productId}">
            <div class="list-cart__image">
              <img src="${image}" width="151" height="188" loading="lazy" alt="${title}" />
            </div>
            <div class="list-cart__body">
              <div class="list-cart__name title title--contact" data-title>${title}</div>
              <div class="list-cart__price" data-product-price=${price}>$${formatingValue(price, 2)}</div>
            </div>
          </div>
          <div class="list-cart__quantity-product quantity-product" data-quantity>
            <button
              class="quantity-product__button quantity-product__button--minus"
              data-quantity-minus
              aria-label="plus"
              type="button"
            ></button>
            <div class="quantity-product__input">
              <input
                autocomplete="off"
                type="text"
                name="form[quantity]"
                data-quantity-value
                data-quantity-min="1"
                data-quantity-max="${count}"
                value="${addCount}"
              />
            </div>
            <button
              class="quantity-product__button quantity-product__button--plus"
              data-quantity-plus
              aria-label="minus"
              type="button"
            ></button>
          </div>
          <div class="list-cart__subtotal" data-subtotal="${price * addCount}">$${formatingValue(price * addCount, 2)}</div>
          <button class="list-cart__remove" aria-label="Remove product" type="button">
            <svg>
              <use xlink:href="__spritemap#sprite-cross"></use>
            </svg>
          </button>
        </li>
    `;
  };
  const getCartProducts = async () => {
    const productsCart = getItemFromLocalStorage("cart") || [];
    listCart.innerHTML = "";
    if (!productsCart.length) {
      listCart.insertAdjacentHTML(
        "beforeend",
        `<li class="list-cart__item list-cart__item--empty">Your cart is empty</li>`
      );
      subtotalElement.textContent = "$0.00";
      totalElement.textContent = "$0.00";
      saveTotalToLocalStorage();
      return;
    }
    const products2 = await getProducts();
    const productsCartWithData = productsCart.map((productCart) => {
      const product = products2.find((item) => item.id === productCart.productId);
      return { ...productCart, ...product };
    });
    productsCartWithData.forEach((product) => {
      listCart.insertAdjacentHTML("beforeend", productCartHTML(product));
    });
    formQuantity();
    updateSubtotal();
  };
  const saveTotalToLocalStorage = () => {
    const subtotalValue = subtotalElement.textContent.replace("$", "");
    const totalValue = totalElement.textContent.replace("$", "");
    const totalData = {
      subtotal: +subtotalValue,
      total: +totalValue
    };
    setItemToLocalStorage("cartTotal", totalData);
  };
  const cartAction = (e) => {
    const target = e.target;
    if (target.closest("[data-quantity-minus]")) {
      const quantityInput = target.closest("[data-quantity]").querySelector("[data-quantity-value]");
      const currentValue = +quantityInput.value;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
        updateSubtotal(target.closest("[data-list-cart]"));
      }
    }
    if (target.closest("[data-quantity-plus]")) {
      const quantityInput = target.closest("[data-quantity]").querySelector("[data-quantity-value]");
      const maxCount = +quantityInput.dataset.quantityMax;
      const currentValue = +quantityInput.value;
      if (currentValue < maxCount) {
        quantityInput.value = currentValue + 1;
        updateSubtotal(target.closest("[data-list-cart]"));
      }
    }
    if (target.closest("[data-list-cart] .list-cart__remove")) {
      const item = target.closest(".list-cart__item");
      const product = item.querySelector("[data-product-id]");
      const productId = +product.dataset.productId;
      removeFromCart(productId);
      item.remove();
      updateSubtotal();
    }
  };
  const updateSubtotal = (container = document) => {
    const items = container.querySelectorAll(".list-cart__item");
    let total = 0;
    if (!items.length) {
      subtotalElement.textContent = "$0.00";
      totalElement.textContent = "$0.00";
      listCart.insertAdjacentHTML(
        "beforeend",
        `<li class="list-cart__item list-cart__item--empty">Your cart is empty</li>`
      );
      saveTotalToLocalStorage();
      return;
    }
    items.forEach((item) => {
      const priceElement = item.querySelector("[data-product-price]");
      const subtotalElement2 = item.querySelector("[data-subtotal]");
      const priceValue = +priceElement.dataset.productPrice;
      const quantityElement = item.querySelector("[data-quantity-value]");
      const quantityValue = +quantityElement.value;
      total += priceValue * quantityValue;
      subtotalElement2.dataset.subtotal = priceValue * quantityValue;
      subtotalElement2.textContent = `$${formatingValue(priceValue * quantityValue, 2)}`;
    });
    subtotalElement.textContent = `$${formatingValue(total, 2)}`;
    totalElement.textContent = `$${formatingValue(total, 2)}`;
    saveTotalToLocalStorage();
  };
  const removeFromCart = (productId) => {
    const cart2 = getItemFromLocalStorage("cart") || [];
    const index = cart2.findIndex((item) => item.productId === productId);
    if (index !== -1) {
      cart2.splice(index, 1);
    }
    setItemToLocalStorage("cart", cart2);
    syncCartFromStorage();
  };
  getCartProducts();
  cart.addEventListener("click", cartAction);
}
const createPostHTML = (post, slider = false) => {
  const { id, image, link, title, date, category, theme } = post;
  return `
    <article class="posts-latest__item item-post ${slider ? "swiper-slide" : ""}" data-post-theme=${theme} data-post-cart="${category}" data-post-id=${id}>
      <a class="item-post__image" href="${link}">
        <img src="${image}" width="310" height="418" loading="lazy" alt="${title}" />
      </a>
      <div class="item-post__body">
        <div class="item-post__meta meta-post" data-meta-post>
          <span class="meta-post__date">${formatDate(date, " ", "short")}</span>
          <span class="meta-post__category">${category}</span>
        </div>
        <h3 class="item-post__title">
          <a class="item-post__link-title" href="${link}" title="${title}">${title}</a>
        </h3>
      </div>
    </article>
  `;
};
const posts = [{ "id": 1, "type": "posts", "theme": "phones", "popular": true, "link": "#", "title": "Get some cool gadgets in 2023", "image": "assets/img/posts/01.png", "category": "gadgets", "date": "2026-01-25" }, { "id": 2, "type": "posts", "theme": "accessories", "link": "#", "title": "Technology hack yoy won’t get", "image": "assets/img/posts/02.png", "category": "technology", "date": "2026-02-09" }, { "id": 3, "type": "posts", "theme": "tablets", "link": "#", "title": "Top 10 small camera in the world", "image": "assets/img/posts/03.png", "category": "camera", "date": "2025-12-25" }, { "id": 4, "type": "posts", "theme": "phones", "link": "#", "title": "Get some cool gadgets in 2023", "image": "assets/img/posts/04.png", "category": "gadgets", "date": "2025-11-20" }, { "id": 5, "type": "posts", "theme": "tablets", "popular": true, "link": "#", "title": "Technology hack yoy won’t get", "image": "assets/img/posts/05.png", "category": "technology", "date": "2026-01-28" }, { "id": 6, "type": "posts", "theme": "phones", "link": "#", "title": "Top 10 small camera in the world", "image": "assets/img/posts/06.png", "category": "camera", "date": "2026-02-10" }, { "id": 7, "type": "posts", "theme": "tablets", "link": "#", "title": "Get some cool gadgets in 2023", "image": "assets/img/posts/07.png", "category": "gadgets", "date": "2025-12-25" }, { "id": 8, "type": "posts", "theme": "tablets", "link": "#", "title": "Technology hack yoy won’t get", "image": "assets/img/posts/08.png", "category": "technology", "date": "2026-01-12" }, { "id": 9, "type": "posts", "theme": "phones", "link": "#", "title": "Top 10 small camera in the world", "image": "assets/img/posts/09.png", "category": "camera", "date": "2025-11-20" }, { "id": 10, "type": "posts", "theme": "phones", "popular": true, "link": "#", "title": "Get some cool gadgets in 2023", "image": "assets/img/posts/01.png", "category": "gadgets", "date": "2026-01-30" }, { "id": 11, "type": "posts", "theme": "accessories", "link": "#", "title": "Technology hack yoy won’t get", "image": "assets/img/posts/02.png", "category": "technology", "date": "2026-02-01" }, { "id": 12, "type": "posts", "theme": "tablets", "popular": true, "link": "#", "title": "Top 10 small camera in the world", "image": "assets/img/posts/03.png", "category": "camera", "date": "2025-12-31" }];
const postsData = {
  posts
};
const getPosts = async () => {
  return postsData?.posts || [];
};
const gridCarts = document.querySelector("[data-render-carts]");
const latestPosts = document.querySelector("[data-latest-posts]");
const maxItems = 9;
let currentTotalItems = 0;
let currentPage = 1;
let currentSort = "default";
let currentFilter = {
  categories: ["all"],
  brands: [],
  price: []
};
const currentSortActive = () => {
  const sort = document.querySelector("[data-sort]");
  if (sort) {
    const sortButton = sort.querySelector(".sort__button");
    currentSort = sortButton.dataset.value;
  }
};
const activeCategories = () => {
  document.querySelectorAll(".filter__link--active").forEach((link) => {
    const list = link.closest("[data-filter-type]");
    if (list.dataset.filterType === "categories") {
      currentFilter.categories = [link.dataset.filterLink];
    }
    if (list.dataset.filterType === "brands") {
      currentFilter.brands = [link.dataset.filterLink];
    }
    if (list.dataset.filterType === "price") {
      currentFilter.price = [link.dataset.filterLink];
    }
  });
};
const toogleFilter = (isOpenFilter) => {
  if (isOpenFilter) {
    bodyUnlock();
    document.documentElement.classList.remove("filter-open");
  } else {
    bodyLock();
    document.documentElement.classList.add("filter-open");
  }
};
const renderPagination = (totalItems) => {
  const paginationList = document.querySelector(".pagination__list");
  if (!paginationList) return;
  paginationList.innerHTML = "";
  const totalPages = Math.ceil(totalItems / maxItems);
  for (let i = 1; i <= totalPages; i++) {
    const item = `
        <li class="pagination__item ${i === currentPage ? "is-active" : ""}">
          <a href="#" class="pagination__link">${i}</a>
        </li>
    `;
    paginationList.insertAdjacentHTML("beforeend", item);
  }
  if (objectModules.pagination) {
    objectModules.pagination.paginationInit();
  }
};
const resultHTML = (container, showPoducts, itemsLength) => {
  container.textContent = `Showing ${showPoducts} of ${itemsLength} results`;
};
const createItemSortHTML = (value, text) => `<li class="sort__item" data-value="${value}">${text}</li>`;
const updateFilteredLinkClass = (currentLink, filterList) => {
  const filterLinks = filterList.querySelectorAll(".filter__link");
  filterLinks.forEach((link) => {
    const activeLink = link.classList.contains("filter__link--active");
    if (activeLink) link.classList.remove("filter__link--active");
  });
  currentLink.classList.add("filter__link--active");
};
const getItemsByPage = (items, page = 1, maxItems2) => {
  const start = (page - 1) * maxItems2;
  const end = start + maxItems2;
  return items.slice(start, end);
};
const applyFiltersForProducts = (products2) => {
  const { categories, brands, price } = currentFilter;
  return products2.filter(({ type, brand, price: productPrice }) => {
    const matchCategory = categories.includes("all") || categories.includes(type);
    const matchBrand = !brands.length || brands.includes(brand);
    let matchPrice = true;
    if (!price.length) {
      return matchCategory && matchBrand && matchPrice;
    }
    const value = price[0];
    if (value.includes("-")) {
      const [min, max] = value.split("-").map(Number);
      matchPrice = productPrice >= min && productPrice <= max;
    } else {
      const max = Number(value);
      matchPrice = productPrice <= max;
    }
    return matchCategory && matchBrand && matchPrice;
  });
};
const applyFiltersForPosts = (posts2) => {
  const { categories } = currentFilter;
  return posts2.filter((post) => {
    const matchTheme = categories.includes("all") || categories.includes(post.theme);
    return matchTheme;
  });
};
const updateSortAttributes = (sortControl, sortList, isOpen) => {
  const ariaExpanded = isOpen ? "true" : "false";
  const ariaHidden = isOpen ? "false" : "true";
  sortControl.setAttribute("aria-expanded", ariaExpanded);
  sortList.setAttribute("aria-hidden", ariaHidden);
};
const filterAction = (e) => {
  if (!e.target.closest("[data-filter]") && !e.target.closest("[data-sort]") && !e.target.closest("[data-filter-close]") && !e.target.closest("[data-filter-open]") && !e.target.closest("[data-pagination]")) {
    const sort2 = document.querySelector("[data-sort]");
    if (sort2.classList.contains("is-open")) {
      sort2.classList.remove("is-open");
    }
    return;
  }
  const paginationContainer = e.target.closest("[data-pagination]");
  const filterOpenButton = e.target.closest("[data-filter-open]");
  const filterCloseButton = e.target.closest("[data-filter-close]");
  const filterButton = e.target.closest("[data-filter-link]");
  const sort = e.target.closest("[data-sort]");
  const isOpenFilter = document.documentElement.classList.contains("filter-open");
  if (paginationContainer) {
    const link = e.target.closest(".pagination__link");
    const arrowNext = e.target.closest(".pagination__arrow--next");
    const arrowPrev = e.target.closest(".pagination__arrow--prev");
    const totalPages = Math.ceil(currentTotalItems / maxItems);
    if (link) {
      currentPage = Number(link.textContent);
    }
    if (arrowNext && currentPage < totalPages) {
      currentPage++;
    }
    if (arrowPrev && currentPage > 1) {
      currentPage--;
    }
    renderCarts();
    e.preventDefault();
    return;
  }
  if (filterOpenButton && bodyLockStatus) {
    toogleFilter(isOpenFilter);
  }
  if (filterCloseButton && bodyLockStatus) {
    toogleFilter(isOpenFilter);
  }
  if (sort) {
    sort.classList.toggle("is-open");
    const sortButton = sort.querySelector(".sort__button");
    const sortList = sort.querySelector(".sort__list");
    const sortItem = e.target.closest(".sort__item");
    updateSortAttributes(sortButton, sortList, sort.classList.contains("is-open"));
    if (!sortItem) return;
    const prevText = sortButton.textContent;
    const prevValue = sortButton.dataset.value;
    sortButton.textContent = sortItem.textContent;
    sortButton.dataset.value = sortItem.dataset.value;
    sortItem.remove();
    sortList.insertAdjacentHTML("beforeend", createItemSortHTML(prevValue, prevText));
    currentSort = sortItem.dataset.value;
    renderCarts();
  }
  if (filterButton && !filterButton.classList.contains("filter__link--active")) {
    const filterList = filterButton.closest("[data-filter-type]");
    const { filterLink } = filterButton.dataset;
    const { filterType } = filterList.dataset;
    if (filterType === "categories") {
      updateFilteredLinkClass(filterButton, filterList);
      if (filterLink === "all") {
        currentFilter.categories = ["all"];
      } else {
        currentFilter.categories = [filterLink];
      }
    }
    if (filterType === "brands") {
      updateFilteredLinkClass(filterButton, filterList);
      currentFilter.brands = [filterLink];
    }
    if (filterType === "price") {
      updateFilteredLinkClass(filterButton, filterList);
      currentFilter.price = [filterLink];
    }
    renderCarts();
    e.preventDefault();
  }
};
const sortByPriceAsc = (products2) => [...products2].sort((a, b) => a.price - b.price);
const sortByPriceDesc = (products2) => [...products2].sort((a, b) => b.price - a.price);
const sortByDateDesc = (posts2) => [...posts2].sort((a, b) => new Date(b.date) - new Date(a.date));
const sortByDateAsc = (posts2) => [...posts2].sort((a, b) => new Date(a.date) - new Date(b.date));
const productSortMap = {
  "price-low": sortByPriceAsc,
  "price-high": sortByPriceDesc
};
const postSortMap = {
  popular: (posts2) => posts2.filter((p) => p.popular === true),
  latest: sortByDateDesc,
  oldest: sortByDateAsc
};
const renderListWithPagination = (items, container, createHTML) => {
  const paginated = getItemsByPage(items, currentPage, maxItems);
  const results = gridCarts.querySelector(".carts-grid__results");
  container.innerHTML = paginated.map(createHTML).join("");
  const start = (currentPage - 1) * maxItems + 1;
  const end = Math.min(currentPage * maxItems, items.length);
  currentTotalItems = items.length;
  renderPagination(items.length);
  resultHTML(results, `${start}–${end}`, items.length);
  gotoBlock(container, { noHeader: true, offsetTop: 70 });
};
const createLatestPostHTML = (post) => {
  return `
      <li class="filter__item" data-post-theme=${post.theme}>
        <a class="filter__link link-post" href="${post.link}">
          <div class="link-post__image">
            <img src="${post.image}" width="109" height="91" alt="${post.title}" />
          </div>
          <div class="link-post__text">
            <p>${post.title}</p>
          </div>
        </a>
      </li>
  `;
};
const renderCarts = async () => {
  const { renderCarts: renderCarts2 } = gridCarts.dataset;
  const gridCartsContainer = gridCarts.querySelector(".carts-grid__items");
  const results = gridCarts.querySelector(".carts-grid__results");
  if (!gridCartsContainer) return;
  if (renderCarts2 === "products") {
    const products2 = await getProducts();
    if (!products2.length) return;
    showLoader(gridCarts);
    await delay(0.5);
    let resultProducts = [...products2];
    resultProducts = applyFiltersForProducts(resultProducts);
    if (productSortMap[currentSort]) {
      resultProducts = productSortMap[currentSort](resultProducts);
    }
    if (!resultProducts.length) {
      gridCartsContainer.innerHTML = `<p class="carts-grid__text">Products not found</p>`;
      resultHTML(results, 0, 0);
      hideLoader(gridCarts);
      gotoBlock(gridCartsContainer, { noHeader: true, offsetTop: 70 });
      return;
    }
    renderListWithPagination(resultProducts, gridCartsContainer, createProductHTML);
    await syncCartFromStorage(gridCartsContainer);
  }
  if (renderCarts2 === "posts") {
    const posts2 = await getPosts();
    if (!posts2.length) return;
    showLoader(gridCarts);
    await delay(0.5);
    let resultPosts = [...posts2];
    if (latestPosts) {
      const latestPostsResult = postSortMap["latest"](resultPosts);
      const list = latestPosts.querySelector(".filter__list");
      list.innerHTML = latestPostsResult.slice(0, 3).map((post) => createLatestPostHTML(post)).join("");
    }
    resultPosts = applyFiltersForPosts(resultPosts);
    if (postSortMap[currentSort]) {
      resultPosts = postSortMap[currentSort](resultPosts);
    }
    if (!resultPosts.length) {
      gridCartsContainer.innerHTML = `<p class="carts-grid__text">Posts not found</p>`;
      resultHTML(results, 0, 0);
      hideLoader(gridCarts);
      gotoBlock(gridCartsContainer, { noHeader: true, offsetTop: 70 });
      return;
    }
    renderListWithPagination(resultPosts, gridCartsContainer, createPostHTML);
    gotoBlock(gridCartsContainer, { noHeader: true, offsetTop: 70 });
  }
  hideLoader(gridCarts);
};
if (gridCarts) {
  currentSortActive();
  activeCategories();
  renderCarts();
  document.addEventListener("click", filterAction);
}
class ScrollWatcher {
  constructor(options) {
    let defaultConfig = {
      logging: true,
      init: true
    };
    this.config = { ...defaultConfig, ...options };
    this.observer;
    if (this.config.init && !document.documentElement.classList.contains("watcher")) {
      this.scrollWatcherRun();
    }
  }
  scrollWatcherUpdate() {
    this.scrollWatcherRun();
  }
  scrollWatcherRun() {
    document.documentElement.classList.add("watcher");
    this.scrollWatcherConstructor(document.querySelectorAll("[data-watcher]"));
  }
  scrollWatcherConstructor(watcherItems) {
    if (!watcherItems.length) {
      this.#scrollWatcherLogging("There are no objects to observe.");
      return;
    }
    this.#scrollWatcherLogging(`I follow the objects (${watcherItems.length})...`);
    const uniqParams = uniqArray(
      Array.from(watcherItems).map((item) => {
        if (item.dataset.watcher === "navigator" && !item.dataset.watcherThreshold) {
          let thresholdValue;
          if (item.clientHeight > 2) {
            thresholdValue = window.innerHeight / 2 / (item.clientHeight - 1);
            thresholdValue = Math.min(thresholdValue, 1);
          } else {
            thresholdValue = 1;
          }
          item.setAttribute("data-watcher-threshold", thresholdValue.toFixed(2));
        }
        const { watcherRoot, watcherMargin, watcherThreshold } = item.dataset;
        return `${watcherRoot || null}|${watcherMargin || "0px"}|${watcherThreshold || 0}`;
      })
    );
    uniqParams.forEach((uniqParam) => {
      const [rootParam, marginParam, thresholdParam] = uniqParam.split("|");
      const paramsWatch = {
        root: rootParam,
        margin: marginParam,
        threshold: thresholdParam
      };
      const groupItems = Array.from(watcherItems).filter((item) => {
        let { watcherRoot, watcherMargin, watcherThreshold } = item.dataset;
        watcherRoot = watcherRoot ? watcherRoot : null;
        watcherMargin = watcherMargin ? watcherMargin : "0px";
        watcherThreshold = watcherThreshold ? watcherThreshold : 0;
        if (String(watcherRoot) === paramsWatch.root && String(watcherMargin) === paramsWatch.margin && String(watcherThreshold) === paramsWatch.threshold) {
          return item;
        }
      });
      const configWatcher = this.getScrollWatcherConfig(paramsWatch);
      this.scrollWatcherInit(groupItems, configWatcher);
    });
  }
  getScrollWatcherConfig(paramsWatch) {
    const { root, margin, threshold } = paramsWatch;
    let configWatcher = {};
    if (document.querySelector(root)) {
      configWatcher.root = document.querySelector(root);
    } else if (root !== "null") {
      this.#scrollWatcherLogging(`The parent object ${root} does not exist on the page`);
    }
    configWatcher.rootMargin = margin;
    if (margin.indexOf("px") < 0 && margin.indexOf("%") < 0) {
      this.#scrollWatcherLogging(`The data-watcher-margin setting must be set in PX or %`);
      return;
    }
    function prxArrThreshold(arr) {
      arr = [];
      for (let i = 0; i <= 1; i += 5e-3) {
        arr.push(i);
      }
      return arr;
    }
    const thresholdArray = threshold === "prx" ? prxArrThreshold(threshold) : threshold.split(",");
    configWatcher.threshold = thresholdArray;
    return configWatcher;
  }
  scrollWatcherInit(items, configWatcher) {
    this.scrollWatcherCreate(configWatcher);
    items.forEach((item) => this.observer.observe(item));
  }
  scrollWatcherCreate(configWatcher) {
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        this.scrollWatcherCallback(entry, observer);
      });
    }, configWatcher);
  }
  scrollWatcherCallback(entry, observer) {
    const { target, isIntersecting } = entry;
    this.scrollWatcherIntersecting(isIntersecting, target);
    target.hasAttribute("data-watcher-once") && isIntersecting ? this.scrollWatcherOff(target, observer) : null;
    document.dispatchEvent(
      new CustomEvent("watcherCallback", {
        detail: {
          entry
        }
      })
    );
  }
  scrollWatcherIntersecting(isIntersecting, target) {
    if (isIntersecting) {
      !target.classList.contains("watcher-view") ? target.classList.add("watcher-view") : null;
      this.#scrollWatcherLogging(`I see ${target.classList}, added watcher-view class`);
    } else {
      target.classList.contains("watcher-view") ? target.classList.remove("watcher-view") : null;
      this.#scrollWatcherLogging(`I don't see ${target.classList}, I removed the watcher-view class`);
    }
  }
  scrollWatcherOff(target, observer) {
    observer.unobserve(target);
    this.#scrollWatcherLogging(`I stopped following ${target.classList}`);
  }
  #scrollWatcherLogging(message) {
    if (this.config.logging) ;
  }
}
if (document.querySelector("[data-watcher]")) {
  objectModules.watcher = new ScrollWatcher({});
}
function isObject$1(obj) {
  return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
}
function extend$1(target = {}, src = {}) {
  const noExtend = ["__proto__", "constructor", "prototype"];
  Object.keys(src).filter((key) => noExtend.indexOf(key) < 0).forEach((key) => {
    if (typeof target[key] === "undefined") target[key] = src[key];
    else if (isObject$1(src[key]) && isObject$1(target[key]) && Object.keys(src[key]).length > 0) {
      extend$1(target[key], src[key]);
    }
  });
}
const ssrDocument = {
  body: {},
  addEventListener() {
  },
  removeEventListener() {
  },
  activeElement: {
    blur() {
    },
    nodeName: ""
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  getElementById() {
    return null;
  },
  createEvent() {
    return {
      initEvent() {
      }
    };
  },
  createElement() {
    return {
      children: [],
      childNodes: [],
      style: {},
      setAttribute() {
      },
      getElementsByTagName() {
        return [];
      }
    };
  },
  createElementNS() {
    return {};
  },
  importNode() {
    return null;
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  }
};
function getDocument() {
  const doc = typeof document !== "undefined" ? document : {};
  extend$1(doc, ssrDocument);
  return doc;
}
const ssrWindow = {
  document: ssrDocument,
  navigator: {
    userAgent: ""
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  },
  history: {
    replaceState() {
    },
    pushState() {
    },
    go() {
    },
    back() {
    }
  },
  CustomEvent: function CustomEvent2() {
    return this;
  },
  addEventListener() {
  },
  removeEventListener() {
  },
  getComputedStyle() {
    return {
      getPropertyValue() {
        return "";
      }
    };
  },
  Image() {
  },
  Date() {
  },
  screen: {},
  setTimeout() {
  },
  clearTimeout() {
  },
  matchMedia() {
    return {};
  },
  requestAnimationFrame(callback) {
    if (typeof setTimeout === "undefined") {
      callback();
      return null;
    }
    return setTimeout(callback, 0);
  },
  cancelAnimationFrame(id) {
    if (typeof setTimeout === "undefined") {
      return;
    }
    clearTimeout(id);
  }
};
function getWindow() {
  const win = typeof window !== "undefined" ? window : {};
  extend$1(win, ssrWindow);
  return win;
}
function classesToTokens(classes2 = "") {
  return classes2.trim().split(" ").filter((c) => !!c.trim());
}
function deleteProps(obj) {
  const object = obj;
  Object.keys(object).forEach((key) => {
    try {
      object[key] = null;
    } catch (e) {
    }
    try {
      delete object[key];
    } catch (e) {
    }
  });
}
function nextTick(callback, delay2 = 0) {
  return setTimeout(callback, delay2);
}
function now() {
  return Date.now();
}
function getComputedStyle$1(el) {
  const window2 = getWindow();
  let style;
  if (window2.getComputedStyle) {
    style = window2.getComputedStyle(el, null);
  }
  if (!style && el.currentStyle) {
    style = el.currentStyle;
  }
  if (!style) {
    style = el.style;
  }
  return style;
}
function getTranslate(el, axis = "x") {
  const window2 = getWindow();
  let matrix;
  let curTransform;
  let transformMatrix;
  const curStyle = getComputedStyle$1(el);
  if (window2.WebKitCSSMatrix) {
    curTransform = curStyle.transform || curStyle.webkitTransform;
    if (curTransform.split(",").length > 6) {
      curTransform = curTransform.split(", ").map((a) => a.replace(",", ".")).join(", ");
    }
    transformMatrix = new window2.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
  } else {
    transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
    matrix = transformMatrix.toString().split(",");
  }
  if (axis === "x") {
    if (window2.WebKitCSSMatrix) curTransform = transformMatrix.m41;
    else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
    else curTransform = parseFloat(matrix[4]);
  }
  if (axis === "y") {
    if (window2.WebKitCSSMatrix) curTransform = transformMatrix.m42;
    else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
    else curTransform = parseFloat(matrix[5]);
  }
  return curTransform || 0;
}
function isObject(o) {
  return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
}
function isNode(node) {
  if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") {
    return node instanceof HTMLElement;
  }
  return node && (node.nodeType === 1 || node.nodeType === 11);
}
function extend(...args) {
  const to = Object(args[0]);
  const noExtend = ["__proto__", "constructor", "prototype"];
  for (let i = 1; i < args.length; i += 1) {
    const nextSource = args[i];
    if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
      const keysArray = Object.keys(Object(nextSource)).filter((key) => noExtend.indexOf(key) < 0);
      for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
        const nextKey = keysArray[nextIndex];
        const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
        if (desc !== void 0 && desc.enumerable) {
          if (isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend(to[nextKey], nextSource[nextKey]);
            }
          } else if (!isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            to[nextKey] = {};
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend(to[nextKey], nextSource[nextKey]);
            }
          } else {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
  }
  return to;
}
function setCSSProperty(el, varName, varValue) {
  el.style.setProperty(varName, varValue);
}
function animateCSSModeScroll({
  swiper,
  targetPosition,
  side
}) {
  const window2 = getWindow();
  const startPosition = -swiper.translate;
  let startTime = null;
  let time;
  const duration = swiper.params.speed;
  swiper.wrapperEl.style.scrollSnapType = "none";
  window2.cancelAnimationFrame(swiper.cssModeFrameID);
  const dir = targetPosition > startPosition ? "next" : "prev";
  const isOutOfBound = (current, target) => {
    return dir === "next" && current >= target || dir === "prev" && current <= target;
  };
  const animate = () => {
    time = (/* @__PURE__ */ new Date()).getTime();
    if (startTime === null) {
      startTime = time;
    }
    const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
    const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
    let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
    if (isOutOfBound(currentPosition, targetPosition)) {
      currentPosition = targetPosition;
    }
    swiper.wrapperEl.scrollTo({
      [side]: currentPosition
    });
    if (isOutOfBound(currentPosition, targetPosition)) {
      swiper.wrapperEl.style.overflow = "hidden";
      swiper.wrapperEl.style.scrollSnapType = "";
      setTimeout(() => {
        swiper.wrapperEl.style.overflow = "";
        swiper.wrapperEl.scrollTo({
          [side]: currentPosition
        });
      });
      window2.cancelAnimationFrame(swiper.cssModeFrameID);
      return;
    }
    swiper.cssModeFrameID = window2.requestAnimationFrame(animate);
  };
  animate();
}
function elementChildren(element, selector = "") {
  const window2 = getWindow();
  const children = [...element.children];
  if (window2.HTMLSlotElement && element instanceof HTMLSlotElement) {
    children.push(...element.assignedElements());
  }
  if (!selector) {
    return children;
  }
  return children.filter((el) => el.matches(selector));
}
function elementIsChildOfSlot(el, slot) {
  const elementsQueue = [slot];
  while (elementsQueue.length > 0) {
    const elementToCheck = elementsQueue.shift();
    if (el === elementToCheck) {
      return true;
    }
    elementsQueue.push(...elementToCheck.children, ...elementToCheck.shadowRoot ? elementToCheck.shadowRoot.children : [], ...elementToCheck.assignedElements ? elementToCheck.assignedElements() : []);
  }
}
function elementIsChildOf(el, parent) {
  const window2 = getWindow();
  let isChild = parent.contains(el);
  if (!isChild && window2.HTMLSlotElement && parent instanceof HTMLSlotElement) {
    const children = [...parent.assignedElements()];
    isChild = children.includes(el);
    if (!isChild) {
      isChild = elementIsChildOfSlot(el, parent);
    }
  }
  return isChild;
}
function showWarning(text) {
  try {
    console.warn(text);
    return;
  } catch (err) {
  }
}
function createElement(tag, classes2 = []) {
  const el = document.createElement(tag);
  el.classList.add(...Array.isArray(classes2) ? classes2 : classesToTokens(classes2));
  return el;
}
function elementPrevAll(el, selector) {
  const prevEls = [];
  while (el.previousElementSibling) {
    const prev = el.previousElementSibling;
    if (selector) {
      if (prev.matches(selector)) prevEls.push(prev);
    } else prevEls.push(prev);
    el = prev;
  }
  return prevEls;
}
function elementNextAll(el, selector) {
  const nextEls = [];
  while (el.nextElementSibling) {
    const next = el.nextElementSibling;
    if (selector) {
      if (next.matches(selector)) nextEls.push(next);
    } else nextEls.push(next);
    el = next;
  }
  return nextEls;
}
function elementStyle(el, prop) {
  const window2 = getWindow();
  return window2.getComputedStyle(el, null).getPropertyValue(prop);
}
function elementIndex(el) {
  let child = el;
  let i;
  if (child) {
    i = 0;
    while ((child = child.previousSibling) !== null) {
      if (child.nodeType === 1) i += 1;
    }
    return i;
  }
  return void 0;
}
function elementParents(el, selector) {
  const parents = [];
  let parent = el.parentElement;
  while (parent) {
    if (selector) {
      if (parent.matches(selector)) parents.push(parent);
    } else {
      parents.push(parent);
    }
    parent = parent.parentElement;
  }
  return parents;
}
function elementOuterSize(el, size, includeMargins) {
  const window2 = getWindow();
  {
    return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
  }
}
function makeElementsArray(el) {
  return (Array.isArray(el) ? el : [el]).filter((e) => !!e);
}
function setInnerHTML(el, html = "") {
  if (typeof trustedTypes !== "undefined") {
    el.innerHTML = trustedTypes.createPolicy("html", {
      createHTML: (s) => s
    }).createHTML(html);
  } else {
    el.innerHTML = html;
  }
}
let support;
function calcSupport() {
  const window2 = getWindow();
  const document2 = getDocument();
  return {
    smoothScroll: document2.documentElement && document2.documentElement.style && "scrollBehavior" in document2.documentElement.style,
    touch: !!("ontouchstart" in window2 || window2.DocumentTouch && document2 instanceof window2.DocumentTouch)
  };
}
function getSupport() {
  if (!support) {
    support = calcSupport();
  }
  return support;
}
let deviceCached;
function calcDevice({
  userAgent
} = {}) {
  const support2 = getSupport();
  const window2 = getWindow();
  const platform = window2.navigator.platform;
  const ua = userAgent || window2.navigator.userAgent;
  const device = {
    ios: false,
    android: false
  };
  const screenWidth = window2.screen.width;
  const screenHeight = window2.screen.height;
  const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
  let ipad = ua.match(/(iPad)(?!\1).*OS\s([\d_]+)/);
  const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
  const windows = platform === "Win32";
  let macos = platform === "MacIntel";
  const iPadScreens = ["1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810"];
  if (!ipad && macos && support2.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
    ipad = ua.match(/(Version)\/([\d.]+)/);
    if (!ipad) ipad = [0, 1, "13_0_0"];
    macos = false;
  }
  if (android && !windows) {
    device.os = "android";
    device.android = true;
  }
  if (ipad || iphone || ipod) {
    device.os = "ios";
    device.ios = true;
  }
  return device;
}
function getDevice(overrides = {}) {
  if (!deviceCached) {
    deviceCached = calcDevice(overrides);
  }
  return deviceCached;
}
let browser;
function calcBrowser() {
  const window2 = getWindow();
  const device = getDevice();
  let needPerspectiveFix = false;
  function isSafari() {
    const ua = window2.navigator.userAgent.toLowerCase();
    return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
  }
  if (isSafari()) {
    const ua = String(window2.navigator.userAgent);
    if (ua.includes("Version/")) {
      const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num) => Number(num));
      needPerspectiveFix = major < 16 || major === 16 && minor < 2;
    }
  }
  const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window2.navigator.userAgent);
  const isSafariBrowser = isSafari();
  const need3dFix = isSafariBrowser || isWebView && device.ios;
  return {
    isSafari: needPerspectiveFix || isSafariBrowser,
    needPerspectiveFix,
    need3dFix,
    isWebView
  };
}
function getBrowser() {
  if (!browser) {
    browser = calcBrowser();
  }
  return browser;
}
function Resize({
  swiper,
  on,
  emit
}) {
  const window2 = getWindow();
  let observer = null;
  let animationFrame = null;
  const resizeHandler = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    emit("beforeResize");
    emit("resize");
  };
  const createObserver = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    observer = new ResizeObserver((entries) => {
      animationFrame = window2.requestAnimationFrame(() => {
        const {
          width,
          height
        } = swiper;
        let newWidth = width;
        let newHeight = height;
        entries.forEach(({
          contentBoxSize,
          contentRect,
          target
        }) => {
          if (target && target !== swiper.el) return;
          newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
          newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
        });
        if (newWidth !== width || newHeight !== height) {
          resizeHandler();
        }
      });
    });
    observer.observe(swiper.el);
  };
  const removeObserver = () => {
    if (animationFrame) {
      window2.cancelAnimationFrame(animationFrame);
    }
    if (observer && observer.unobserve && swiper.el) {
      observer.unobserve(swiper.el);
      observer = null;
    }
  };
  const orientationChangeHandler = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    emit("orientationchange");
  };
  on("init", () => {
    if (swiper.params.resizeObserver && typeof window2.ResizeObserver !== "undefined") {
      createObserver();
      return;
    }
    window2.addEventListener("resize", resizeHandler);
    window2.addEventListener("orientationchange", orientationChangeHandler);
  });
  on("destroy", () => {
    removeObserver();
    window2.removeEventListener("resize", resizeHandler);
    window2.removeEventListener("orientationchange", orientationChangeHandler);
  });
}
function Observer({
  swiper,
  extendParams,
  on,
  emit
}) {
  const observers = [];
  const window2 = getWindow();
  const attach = (target, options = {}) => {
    const ObserverFunc = window2.MutationObserver || window2.WebkitMutationObserver;
    const observer = new ObserverFunc((mutations) => {
      if (swiper.__preventObserver__) return;
      if (mutations.length === 1) {
        emit("observerUpdate", mutations[0]);
        return;
      }
      const observerUpdate = function observerUpdate2() {
        emit("observerUpdate", mutations[0]);
      };
      if (window2.requestAnimationFrame) {
        window2.requestAnimationFrame(observerUpdate);
      } else {
        window2.setTimeout(observerUpdate, 0);
      }
    });
    observer.observe(target, {
      attributes: typeof options.attributes === "undefined" ? true : options.attributes,
      childList: swiper.isElement || (typeof options.childList === "undefined" ? true : options).childList,
      characterData: typeof options.characterData === "undefined" ? true : options.characterData
    });
    observers.push(observer);
  };
  const init = () => {
    if (!swiper.params.observer) return;
    if (swiper.params.observeParents) {
      const containerParents = elementParents(swiper.hostEl);
      for (let i = 0; i < containerParents.length; i += 1) {
        attach(containerParents[i]);
      }
    }
    attach(swiper.hostEl, {
      childList: swiper.params.observeSlideChildren
    });
    attach(swiper.wrapperEl, {
      attributes: false
    });
  };
  const destroy = () => {
    observers.forEach((observer) => {
      observer.disconnect();
    });
    observers.splice(0, observers.length);
  };
  extendParams({
    observer: false,
    observeParents: false,
    observeSlideChildren: false
  });
  on("init", init);
  on("destroy", destroy);
}
var eventsEmitter = {
  on(events2, handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== "function") return self;
    const method = priority ? "unshift" : "push";
    events2.split(" ").forEach((event) => {
      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
      self.eventsListeners[event][method](handler);
    });
    return self;
  },
  once(events2, handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== "function") return self;
    function onceHandler(...args) {
      self.off(events2, onceHandler);
      if (onceHandler.__emitterProxy) {
        delete onceHandler.__emitterProxy;
      }
      handler.apply(self, args);
    }
    onceHandler.__emitterProxy = handler;
    return self.on(events2, onceHandler, priority);
  },
  onAny(handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== "function") return self;
    const method = priority ? "unshift" : "push";
    if (self.eventsAnyListeners.indexOf(handler) < 0) {
      self.eventsAnyListeners[method](handler);
    }
    return self;
  },
  offAny(handler) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsAnyListeners) return self;
    const index = self.eventsAnyListeners.indexOf(handler);
    if (index >= 0) {
      self.eventsAnyListeners.splice(index, 1);
    }
    return self;
  },
  off(events2, handler) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsListeners) return self;
    events2.split(" ").forEach((event) => {
      if (typeof handler === "undefined") {
        self.eventsListeners[event] = [];
      } else if (self.eventsListeners[event]) {
        self.eventsListeners[event].forEach((eventHandler, index) => {
          if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
            self.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self;
  },
  emit(...args) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsListeners) return self;
    let events2;
    let data;
    let context;
    if (typeof args[0] === "string" || Array.isArray(args[0])) {
      events2 = args[0];
      data = args.slice(1, args.length);
      context = self;
    } else {
      events2 = args[0].events;
      data = args[0].data;
      context = args[0].context || self;
    }
    data.unshift(context);
    const eventsArray = Array.isArray(events2) ? events2 : events2.split(" ");
    eventsArray.forEach((event) => {
      if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
        self.eventsAnyListeners.forEach((eventHandler) => {
          eventHandler.apply(context, [event, ...data]);
        });
      }
      if (self.eventsListeners && self.eventsListeners[event]) {
        self.eventsListeners[event].forEach((eventHandler) => {
          eventHandler.apply(context, data);
        });
      }
    });
    return self;
  }
};
function updateSize() {
  const swiper = this;
  let width;
  let height;
  const el = swiper.el;
  if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) {
    width = swiper.params.width;
  } else {
    width = el.clientWidth;
  }
  if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) {
    height = swiper.params.height;
  } else {
    height = el.clientHeight;
  }
  if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
    return;
  }
  width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
  height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
  if (Number.isNaN(width)) width = 0;
  if (Number.isNaN(height)) height = 0;
  Object.assign(swiper, {
    width,
    height,
    size: swiper.isHorizontal() ? width : height
  });
}
function updateSlides() {
  const swiper = this;
  function getDirectionPropertyValue(node, label) {
    return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
  }
  const params = swiper.params;
  const {
    wrapperEl,
    slidesEl,
    rtlTranslate: rtl,
    wrongRTL
  } = swiper;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
  const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
  const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
  let snapGrid = [];
  const slidesGrid = [];
  const slidesSizesGrid = [];
  let offsetBefore = params.slidesOffsetBefore;
  if (typeof offsetBefore === "function") {
    offsetBefore = params.slidesOffsetBefore.call(swiper);
  }
  let offsetAfter = params.slidesOffsetAfter;
  if (typeof offsetAfter === "function") {
    offsetAfter = params.slidesOffsetAfter.call(swiper);
  }
  const previousSnapGridLength = swiper.snapGrid.length;
  const previousSlidesGridLength = swiper.slidesGrid.length;
  const swiperSize = swiper.size - offsetBefore - offsetAfter;
  let spaceBetween = params.spaceBetween;
  let slidePosition = -offsetBefore;
  let prevSlideSize = 0;
  let index = 0;
  if (typeof swiperSize === "undefined") {
    return;
  }
  if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize;
  } else if (typeof spaceBetween === "string") {
    spaceBetween = parseFloat(spaceBetween);
  }
  swiper.virtualSize = -spaceBetween - offsetBefore - offsetAfter;
  slides.forEach((slideEl) => {
    if (rtl) {
      slideEl.style.marginLeft = "";
    } else {
      slideEl.style.marginRight = "";
    }
    slideEl.style.marginBottom = "";
    slideEl.style.marginTop = "";
  });
  if (params.centeredSlides && params.cssMode) {
    setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
    setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
  }
  if (params.cssMode) {
    setCSSProperty(wrapperEl, "--swiper-slides-offset-before", `${offsetBefore}px`);
    setCSSProperty(wrapperEl, "--swiper-slides-offset-after", `${offsetAfter}px`);
  }
  const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
  if (gridEnabled) {
    swiper.grid.initSlides(slides);
  } else if (swiper.grid) {
    swiper.grid.unsetSlides();
  }
  let slideSize;
  const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key) => {
    return typeof params.breakpoints[key].slidesPerView !== "undefined";
  }).length > 0;
  for (let i = 0; i < slidesLength; i += 1) {
    slideSize = 0;
    const slide2 = slides[i];
    if (slide2) {
      if (gridEnabled) {
        swiper.grid.updateSlide(i, slide2, slides);
      }
      if (elementStyle(slide2, "display") === "none") continue;
    }
    if (isVirtual && params.slidesPerView === "auto") {
      if (params.virtual.slidesPerViewAutoSlideSize) {
        slideSize = params.virtual.slidesPerViewAutoSlideSize;
      }
      if (slideSize && slide2) {
        if (params.roundLengths) slideSize = Math.floor(slideSize);
        slide2.style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
      }
    } else if (params.slidesPerView === "auto") {
      if (shouldResetSlideSize) {
        slide2.style[swiper.getDirectionLabel("width")] = ``;
      }
      const slideStyles = getComputedStyle(slide2);
      const currentTransform = slide2.style.transform;
      const currentWebKitTransform = slide2.style.webkitTransform;
      if (currentTransform) {
        slide2.style.transform = "none";
      }
      if (currentWebKitTransform) {
        slide2.style.webkitTransform = "none";
      }
      if (params.roundLengths) {
        slideSize = swiper.isHorizontal() ? elementOuterSize(slide2, "width") : elementOuterSize(slide2, "height");
      } else {
        const width = getDirectionPropertyValue(slideStyles, "width");
        const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
        const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
        const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
        const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
        const boxSizing = slideStyles.getPropertyValue("box-sizing");
        if (boxSizing && boxSizing === "border-box") {
          slideSize = width + marginLeft + marginRight;
        } else {
          const {
            clientWidth,
            offsetWidth
          } = slide2;
          slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
        }
      }
      if (currentTransform) {
        slide2.style.transform = currentTransform;
      }
      if (currentWebKitTransform) {
        slide2.style.webkitTransform = currentWebKitTransform;
      }
      if (params.roundLengths) slideSize = Math.floor(slideSize);
    } else {
      slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
      if (params.roundLengths) slideSize = Math.floor(slideSize);
      if (slide2) {
        slide2.style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
      }
    }
    if (slide2) {
      slide2.swiperSlideSize = slideSize;
    }
    slidesSizesGrid.push(slideSize);
    if (params.centeredSlides) {
      slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
      if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
      if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
    } else {
      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
      if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
      slidePosition = slidePosition + slideSize + spaceBetween;
    }
    swiper.virtualSize += slideSize + spaceBetween;
    prevSlideSize = slideSize;
    index += 1;
  }
  swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
  if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) {
    wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
  }
  if (params.setWrapperSize) {
    wrapperEl.style[swiper.getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
  }
  if (gridEnabled) {
    swiper.grid.updateWrapperSize(slideSize, snapGrid);
  }
  if (!params.centeredSlides) {
    const isFractionalSlidesPerView = params.slidesPerView !== "auto" && params.slidesPerView % 1 !== 0;
    const shouldSnapToSlideEdge = params.snapToSlideEdge && !params.loop && (params.slidesPerView === "auto" || isFractionalSlidesPerView);
    let lastAllowedSnapIndex = snapGrid.length;
    if (shouldSnapToSlideEdge) {
      let minVisibleSlides;
      if (params.slidesPerView === "auto") {
        minVisibleSlides = 1;
        let accumulatedSize = 0;
        for (let i = slidesSizesGrid.length - 1; i >= 0; i -= 1) {
          accumulatedSize += slidesSizesGrid[i] + (i < slidesSizesGrid.length - 1 ? spaceBetween : 0);
          if (accumulatedSize <= swiperSize) {
            minVisibleSlides = slidesSizesGrid.length - i;
          } else {
            break;
          }
        }
      } else {
        minVisibleSlides = Math.floor(params.slidesPerView);
      }
      lastAllowedSnapIndex = Math.max(slidesLength - minVisibleSlides, 0);
    }
    const newSlidesGrid = [];
    for (let i = 0; i < snapGrid.length; i += 1) {
      let slidesGridItem = snapGrid[i];
      if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
      if (shouldSnapToSlideEdge) {
        if (i <= lastAllowedSnapIndex) {
          newSlidesGrid.push(slidesGridItem);
        }
      } else if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
        newSlidesGrid.push(slidesGridItem);
      }
    }
    snapGrid = newSlidesGrid;
    if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
      if (!shouldSnapToSlideEdge) {
        snapGrid.push(swiper.virtualSize - swiperSize);
      }
    }
  }
  if (isVirtual && params.loop) {
    const size = slidesSizesGrid[0] + spaceBetween;
    if (params.slidesPerGroup > 1) {
      const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
      const groupSize = size * params.slidesPerGroup;
      for (let i = 0; i < groups; i += 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
      }
    }
    for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
      if (params.slidesPerGroup === 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + size);
      }
      slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
      swiper.virtualSize += size;
    }
  }
  if (snapGrid.length === 0) snapGrid = [0];
  if (spaceBetween !== 0) {
    const key = swiper.isHorizontal() && rtl ? "marginLeft" : swiper.getDirectionLabel("marginRight");
    slides.filter((_, slideIndex) => {
      if (!params.cssMode || params.loop) return true;
      if (slideIndex === slides.length - 1) {
        return false;
      }
      return true;
    }).forEach((slideEl) => {
      slideEl.style[key] = `${spaceBetween}px`;
    });
  }
  if (params.centeredSlides && params.centeredSlidesBounds) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach((slideSizeValue) => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
    snapGrid = snapGrid.map((snap) => {
      if (snap <= 0) return -offsetBefore;
      if (snap > maxSnap) return maxSnap + offsetAfter;
      return snap;
    });
  }
  if (params.centerInsufficientSlides) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach((slideSizeValue) => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const offsetSize = (offsetBefore || 0) + (offsetAfter || 0);
    if (allSlidesSize + offsetSize < swiperSize) {
      const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
      snapGrid.forEach((snap, snapIndex) => {
        snapGrid[snapIndex] = snap - allSlidesOffset;
      });
      slidesGrid.forEach((snap, snapIndex) => {
        slidesGrid[snapIndex] = snap + allSlidesOffset;
      });
    }
  }
  Object.assign(swiper, {
    slides,
    snapGrid,
    slidesGrid,
    slidesSizesGrid
  });
  if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
    setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
    setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
    const addToSnapGrid = -swiper.snapGrid[0];
    const addToSlidesGrid = -swiper.slidesGrid[0];
    swiper.snapGrid = swiper.snapGrid.map((v) => v + addToSnapGrid);
    swiper.slidesGrid = swiper.slidesGrid.map((v) => v + addToSlidesGrid);
  }
  if (slidesLength !== previousSlidesLength) {
    swiper.emit("slidesLengthChange");
  }
  if (snapGrid.length !== previousSnapGridLength) {
    if (swiper.params.watchOverflow) swiper.checkOverflow();
    swiper.emit("snapGridLengthChange");
  }
  if (slidesGrid.length !== previousSlidesGridLength) {
    swiper.emit("slidesGridLengthChange");
  }
  if (params.watchSlidesProgress) {
    swiper.updateSlidesOffset();
  }
  swiper.emit("slidesUpdated");
  if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
    const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
    const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
    if (slidesLength <= params.maxBackfaceHiddenSlides) {
      if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
    } else if (hasClassBackfaceClassAdded) {
      swiper.el.classList.remove(backFaceHiddenClass);
    }
  }
}
function updateAutoHeight(speed) {
  const swiper = this;
  const activeSlides = [];
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  let newHeight = 0;
  let i;
  if (typeof speed === "number") {
    swiper.setTransition(speed);
  } else if (speed === true) {
    swiper.setTransition(swiper.params.speed);
  }
  const getSlideByIndex = (index) => {
    if (isVirtual) {
      return swiper.slides[swiper.getSlideIndexByData(index)];
    }
    return swiper.slides[index];
  };
  if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) {
    if (swiper.params.centeredSlides) {
      (swiper.visibleSlides || []).forEach((slide2) => {
        activeSlides.push(slide2);
      });
    } else {
      for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
        const index = swiper.activeIndex + i;
        if (index > swiper.slides.length && !isVirtual) break;
        activeSlides.push(getSlideByIndex(index));
      }
    }
  } else {
    activeSlides.push(getSlideByIndex(swiper.activeIndex));
  }
  for (i = 0; i < activeSlides.length; i += 1) {
    if (typeof activeSlides[i] !== "undefined") {
      const height = activeSlides[i].offsetHeight;
      newHeight = height > newHeight ? height : newHeight;
    }
  }
  if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
}
function updateSlidesOffset() {
  const swiper = this;
  const slides = swiper.slides;
  const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
  for (let i = 0; i < slides.length; i += 1) {
    slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
  }
}
const toggleSlideClasses$1 = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesProgress(translate2 = this && this.translate || 0) {
  const swiper = this;
  const params = swiper.params;
  const {
    slides,
    rtlTranslate: rtl,
    snapGrid
  } = swiper;
  if (slides.length === 0) return;
  if (typeof slides[0].swiperSlideOffset === "undefined") swiper.updateSlidesOffset();
  let offsetCenter = -translate2;
  if (rtl) offsetCenter = translate2;
  swiper.visibleSlidesIndexes = [];
  swiper.visibleSlides = [];
  let spaceBetween = params.spaceBetween;
  if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size;
  } else if (typeof spaceBetween === "string") {
    spaceBetween = parseFloat(spaceBetween);
  }
  for (let i = 0; i < slides.length; i += 1) {
    const slide2 = slides[i];
    let slideOffset = slide2.swiperSlideOffset;
    if (params.cssMode && params.centeredSlides) {
      slideOffset -= slides[0].swiperSlideOffset;
    }
    const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
    const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
    const slideBefore = -(offsetCenter - slideOffset);
    const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
    const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
    const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
    if (isVisible) {
      swiper.visibleSlides.push(slide2);
      swiper.visibleSlidesIndexes.push(i);
    }
    toggleSlideClasses$1(slide2, isVisible, params.slideVisibleClass);
    toggleSlideClasses$1(slide2, isFullyVisible, params.slideFullyVisibleClass);
    slide2.progress = rtl ? -slideProgress : slideProgress;
    slide2.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
  }
}
function updateProgress(translate2) {
  const swiper = this;
  if (typeof translate2 === "undefined") {
    const multiplier = swiper.rtlTranslate ? -1 : 1;
    translate2 = swiper && swiper.translate && swiper.translate * multiplier || 0;
  }
  const params = swiper.params;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  let {
    progress,
    isBeginning,
    isEnd,
    progressLoop
  } = swiper;
  const wasBeginning = isBeginning;
  const wasEnd = isEnd;
  if (translatesDiff === 0) {
    progress = 0;
    isBeginning = true;
    isEnd = true;
  } else {
    progress = (translate2 - swiper.minTranslate()) / translatesDiff;
    const isBeginningRounded = Math.abs(translate2 - swiper.minTranslate()) < 1;
    const isEndRounded = Math.abs(translate2 - swiper.maxTranslate()) < 1;
    isBeginning = isBeginningRounded || progress <= 0;
    isEnd = isEndRounded || progress >= 1;
    if (isBeginningRounded) progress = 0;
    if (isEndRounded) progress = 1;
  }
  if (params.loop) {
    const firstSlideIndex = swiper.getSlideIndexByData(0);
    const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
    const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
    const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
    const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
    const translateAbs = Math.abs(translate2);
    if (translateAbs >= firstSlideTranslate) {
      progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
    } else {
      progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
    }
    if (progressLoop > 1) progressLoop -= 1;
  }
  Object.assign(swiper, {
    progress,
    progressLoop,
    isBeginning,
    isEnd
  });
  if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate2);
  if (isBeginning && !wasBeginning) {
    swiper.emit("reachBeginning toEdge");
  }
  if (isEnd && !wasEnd) {
    swiper.emit("reachEnd toEdge");
  }
  if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
    swiper.emit("fromEdge");
  }
  swiper.emit("progress", progress);
}
const toggleSlideClasses = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesClasses() {
  const swiper = this;
  const {
    slides,
    params,
    slidesEl,
    activeIndex
  } = swiper;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  const getFilteredSlide = (selector) => {
    return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
  };
  let activeSlide;
  let prevSlide;
  let nextSlide;
  if (isVirtual) {
    if (params.loop) {
      let slideIndex = activeIndex - swiper.virtual.slidesBefore;
      if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
      if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
    } else {
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
    }
  } else {
    if (gridEnabled) {
      activeSlide = slides.find((slideEl) => slideEl.column === activeIndex);
      nextSlide = slides.find((slideEl) => slideEl.column === activeIndex + 1);
      prevSlide = slides.find((slideEl) => slideEl.column === activeIndex - 1);
    } else {
      activeSlide = slides[activeIndex];
    }
  }
  if (activeSlide) {
    if (!gridEnabled) {
      nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !nextSlide) {
        nextSlide = slides[0];
      }
      prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !prevSlide === 0) {
        prevSlide = slides[slides.length - 1];
      }
    }
  }
  slides.forEach((slideEl) => {
    toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
    toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
    toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
  });
  swiper.emitSlidesClasses();
}
const processLazyPreloader = (swiper, imageEl) => {
  if (!swiper || swiper.destroyed || !swiper.params) return;
  const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
  const slideEl = imageEl.closest(slideSelector());
  if (slideEl) {
    let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
    if (!lazyEl && swiper.isElement) {
      if (slideEl.shadowRoot) {
        lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
      } else {
        requestAnimationFrame(() => {
          if (slideEl.shadowRoot) {
            lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (lazyEl && !lazyEl.lazyPreloaderManaged) lazyEl.remove();
          }
        });
      }
    }
    if (lazyEl && !lazyEl.lazyPreloaderManaged) lazyEl.remove();
  }
};
const unlazy = (swiper, index) => {
  if (!swiper.slides[index]) return;
  const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
  if (imageEl) imageEl.removeAttribute("loading");
};
const preload = (swiper) => {
  if (!swiper || swiper.destroyed || !swiper.params) return;
  let amount = swiper.params.lazyPreloadPrevNext;
  const len = swiper.slides.length;
  if (!len || !amount || amount < 0) return;
  amount = Math.min(amount, len);
  const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
  const activeIndex = swiper.activeIndex;
  if (swiper.params.grid && swiper.params.grid.rows > 1) {
    const activeColumn = activeIndex;
    const preloadColumns = [activeColumn - amount];
    preloadColumns.push(...Array.from({
      length: amount
    }).map((_, i) => {
      return activeColumn + slidesPerView + i;
    }));
    swiper.slides.forEach((slideEl, i) => {
      if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
    });
    return;
  }
  const slideIndexLastInView = activeIndex + slidesPerView - 1;
  if (swiper.params.rewind || swiper.params.loop) {
    for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
      const realIndex = (i % len + len) % len;
      if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
    }
  } else {
    for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
      if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
        unlazy(swiper, i);
      }
    }
  }
};
function getActiveIndexByTranslate(swiper) {
  const {
    slidesGrid,
    params
  } = swiper;
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  let activeIndex;
  for (let i = 0; i < slidesGrid.length; i += 1) {
    if (typeof slidesGrid[i + 1] !== "undefined") {
      if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
        activeIndex = i;
      } else if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1]) {
        activeIndex = i + 1;
      }
    } else if (translate2 >= slidesGrid[i]) {
      activeIndex = i;
    }
  }
  if (params.normalizeSlideIndex) {
    if (activeIndex < 0 || typeof activeIndex === "undefined") activeIndex = 0;
  }
  return activeIndex;
}
function updateActiveIndex(newActiveIndex) {
  const swiper = this;
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  const {
    snapGrid,
    params,
    activeIndex: previousIndex,
    realIndex: previousRealIndex,
    snapIndex: previousSnapIndex
  } = swiper;
  let activeIndex = newActiveIndex;
  let snapIndex;
  const getVirtualRealIndex = (aIndex) => {
    let realIndex2 = aIndex - swiper.virtual.slidesBefore;
    if (realIndex2 < 0) {
      realIndex2 = swiper.virtual.slides.length + realIndex2;
    }
    if (realIndex2 >= swiper.virtual.slides.length) {
      realIndex2 -= swiper.virtual.slides.length;
    }
    return realIndex2;
  };
  if (typeof activeIndex === "undefined") {
    activeIndex = getActiveIndexByTranslate(swiper);
  }
  if (snapGrid.indexOf(translate2) >= 0) {
    snapIndex = snapGrid.indexOf(translate2);
  } else {
    const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
    snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
  }
  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
  if (activeIndex === previousIndex && !swiper.params.loop) {
    if (snapIndex !== previousSnapIndex) {
      swiper.snapIndex = snapIndex;
      swiper.emit("snapIndexChange");
    }
    return;
  }
  if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
    swiper.realIndex = getVirtualRealIndex(activeIndex);
    return;
  }
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  let realIndex;
  if (swiper.virtual && params.virtual.enabled) {
    if (params.loop) {
      realIndex = getVirtualRealIndex(activeIndex);
    } else {
      realIndex = activeIndex;
    }
  } else if (gridEnabled) {
    const firstSlideInColumn = swiper.slides.find((slideEl) => slideEl.column === activeIndex);
    let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
    if (Number.isNaN(activeSlideIndex)) {
      activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
    }
    realIndex = Math.floor(activeSlideIndex / params.grid.rows);
  } else if (swiper.slides[activeIndex]) {
    const slideIndex = swiper.slides[activeIndex].getAttribute("data-swiper-slide-index");
    if (slideIndex) {
      realIndex = parseInt(slideIndex, 10);
    } else {
      realIndex = activeIndex;
    }
  } else {
    realIndex = activeIndex;
  }
  Object.assign(swiper, {
    previousSnapIndex,
    snapIndex,
    previousRealIndex,
    realIndex,
    previousIndex,
    activeIndex
  });
  if (swiper.initialized) {
    preload(swiper);
  }
  swiper.emit("activeIndexChange");
  swiper.emit("snapIndexChange");
  if (swiper.initialized || swiper.params.runCallbacksOnInit) {
    if (previousRealIndex !== realIndex) {
      swiper.emit("realIndexChange");
    }
    swiper.emit("slideChange");
  }
}
function updateClickedSlide(el, path) {
  const swiper = this;
  const params = swiper.params;
  let slide2 = el.closest(`.${params.slideClass}, swiper-slide`);
  if (!slide2 && swiper.isElement && path && path.length > 1 && path.includes(el)) {
    [...path.slice(path.indexOf(el) + 1, path.length)].forEach((pathEl) => {
      if (!slide2 && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
        slide2 = pathEl;
      }
    });
  }
  let slideFound = false;
  let slideIndex;
  if (slide2) {
    for (let i = 0; i < swiper.slides.length; i += 1) {
      if (swiper.slides[i] === slide2) {
        slideFound = true;
        slideIndex = i;
        break;
      }
    }
  }
  if (slide2 && slideFound) {
    swiper.clickedSlide = slide2;
    if (swiper.virtual && swiper.params.virtual.enabled) {
      swiper.clickedIndex = parseInt(slide2.getAttribute("data-swiper-slide-index"), 10);
    } else {
      swiper.clickedIndex = slideIndex;
    }
  } else {
    swiper.clickedSlide = void 0;
    swiper.clickedIndex = void 0;
    return;
  }
  if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) {
    swiper.slideToClickedSlide();
  }
}
var update = {
  updateSize,
  updateSlides,
  updateAutoHeight,
  updateSlidesOffset,
  updateSlidesProgress,
  updateProgress,
  updateSlidesClasses,
  updateActiveIndex,
  updateClickedSlide
};
function getSwiperTranslate(axis = this.isHorizontal() ? "x" : "y") {
  const swiper = this;
  const {
    params,
    rtlTranslate: rtl,
    translate: translate2,
    wrapperEl
  } = swiper;
  if (params.virtualTranslate) {
    return rtl ? -translate2 : translate2;
  }
  if (params.cssMode) {
    return translate2;
  }
  let currentTranslate = getTranslate(wrapperEl, axis);
  currentTranslate += swiper.cssOverflowAdjustment();
  if (rtl) currentTranslate = -currentTranslate;
  return currentTranslate || 0;
}
function setTranslate(translate2, byController) {
  const swiper = this;
  const {
    rtlTranslate: rtl,
    params,
    wrapperEl,
    progress
  } = swiper;
  let x = 0;
  let y = 0;
  const z = 0;
  if (swiper.isHorizontal()) {
    x = rtl ? -translate2 : translate2;
  } else {
    y = translate2;
  }
  if (params.roundLengths) {
    x = Math.floor(x);
    y = Math.floor(y);
  }
  swiper.previousTranslate = swiper.translate;
  swiper.translate = swiper.isHorizontal() ? x : y;
  if (params.cssMode) {
    wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y;
  } else if (!params.virtualTranslate) {
    if (swiper.isHorizontal()) {
      x -= swiper.cssOverflowAdjustment();
    } else {
      y -= swiper.cssOverflowAdjustment();
    }
    wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
  }
  let newProgress;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (translate2 - swiper.minTranslate()) / translatesDiff;
  }
  if (newProgress !== progress) {
    swiper.updateProgress(translate2);
  }
  swiper.emit("setTranslate", swiper.translate, byController);
}
function minTranslate() {
  return -this.snapGrid[0];
}
function maxTranslate() {
  return -this.snapGrid[this.snapGrid.length - 1];
}
function translateTo(translate2 = 0, speed = this.params.speed, runCallbacks = true, translateBounds = true, internal) {
  const swiper = this;
  const {
    params,
    wrapperEl
  } = swiper;
  if (swiper.animating && params.preventInteractionOnTransition) {
    return false;
  }
  const minTranslate2 = swiper.minTranslate();
  const maxTranslate2 = swiper.maxTranslate();
  let newTranslate;
  if (translateBounds && translate2 > minTranslate2) newTranslate = minTranslate2;
  else if (translateBounds && translate2 < maxTranslate2) newTranslate = maxTranslate2;
  else newTranslate = translate2;
  swiper.updateProgress(newTranslate);
  if (params.cssMode) {
    const isH = swiper.isHorizontal();
    if (speed === 0) {
      wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate;
    } else {
      if (!swiper.support.smoothScroll) {
        animateCSSModeScroll({
          swiper,
          targetPosition: -newTranslate,
          side: isH ? "left" : "top"
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? "left" : "top"]: -newTranslate,
        behavior: "smooth"
      });
    }
    return true;
  }
  if (speed === 0) {
    swiper.setTransition(0);
    swiper.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper.emit("beforeTransitionStart", speed, internal);
      swiper.emit("transitionEnd");
    }
  } else {
    swiper.setTransition(speed);
    swiper.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper.emit("beforeTransitionStart", speed, internal);
      swiper.emit("transitionStart");
    }
    if (!swiper.animating) {
      swiper.animating = true;
      if (!swiper.onTranslateToWrapperTransitionEnd) {
        swiper.onTranslateToWrapperTransitionEnd = function transitionEnd2(e) {
          if (!swiper || swiper.destroyed) return;
          if (e.target !== this) return;
          swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
          swiper.onTranslateToWrapperTransitionEnd = null;
          delete swiper.onTranslateToWrapperTransitionEnd;
          swiper.animating = false;
          if (runCallbacks) {
            swiper.emit("transitionEnd");
          }
        };
      }
      swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
    }
  }
  return true;
}
var translate = {
  getTranslate: getSwiperTranslate,
  setTranslate,
  minTranslate,
  maxTranslate,
  translateTo
};
function setTransition(duration, byController) {
  const swiper = this;
  if (!swiper.params.cssMode) {
    swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
    swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
  }
  swiper.emit("setTransition", duration, byController);
}
function transitionEmit({
  swiper,
  runCallbacks,
  direction,
  step
}) {
  const {
    activeIndex,
    previousIndex
  } = swiper;
  let dir = direction;
  if (!dir) {
    if (activeIndex > previousIndex) dir = "next";
    else if (activeIndex < previousIndex) dir = "prev";
    else dir = "reset";
  }
  swiper.emit(`transition${step}`);
  if (runCallbacks && dir === "reset") {
    swiper.emit(`slideResetTransition${step}`);
  } else if (runCallbacks && activeIndex !== previousIndex) {
    swiper.emit(`slideChangeTransition${step}`);
    if (dir === "next") {
      swiper.emit(`slideNextTransition${step}`);
    } else {
      swiper.emit(`slidePrevTransition${step}`);
    }
  }
}
function transitionStart(runCallbacks = true, direction) {
  const swiper = this;
  const {
    params
  } = swiper;
  if (params.cssMode) return;
  if (params.autoHeight) {
    swiper.updateAutoHeight();
  }
  transitionEmit({
    swiper,
    runCallbacks,
    direction,
    step: "Start"
  });
}
function transitionEnd(runCallbacks = true, direction) {
  const swiper = this;
  const {
    params
  } = swiper;
  swiper.animating = false;
  if (params.cssMode) return;
  swiper.setTransition(0);
  transitionEmit({
    swiper,
    runCallbacks,
    direction,
    step: "End"
  });
}
var transition = {
  setTransition,
  transitionStart,
  transitionEnd
};
function slideTo(index = 0, speed, runCallbacks = true, internal, initial) {
  if (typeof index === "string") {
    index = parseInt(index, 10);
  }
  const swiper = this;
  let slideIndex = index;
  if (slideIndex < 0) slideIndex = 0;
  const {
    params,
    snapGrid,
    slidesGrid,
    previousIndex,
    activeIndex,
    rtlTranslate: rtl,
    wrapperEl,
    enabled
  } = swiper;
  if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) {
    return false;
  }
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
  let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
  const translate2 = -snapGrid[snapIndex];
  if (params.normalizeSlideIndex) {
    for (let i = 0; i < slidesGrid.length; i += 1) {
      const normalizedTranslate = -Math.floor(translate2 * 100);
      const normalizedGrid = Math.floor(slidesGrid[i] * 100);
      const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
      if (typeof slidesGrid[i + 1] !== "undefined") {
        if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
          slideIndex = i;
        } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
          slideIndex = i + 1;
        }
      } else if (normalizedTranslate >= normalizedGrid) {
        slideIndex = i;
      }
    }
  }
  if (swiper.initialized && slideIndex !== activeIndex) {
    if (!swiper.allowSlideNext && (rtl ? translate2 > swiper.translate && translate2 > swiper.minTranslate() : translate2 < swiper.translate && translate2 < swiper.minTranslate())) {
      return false;
    }
    if (!swiper.allowSlidePrev && translate2 > swiper.translate && translate2 > swiper.maxTranslate()) {
      if ((activeIndex || 0) !== slideIndex) {
        return false;
      }
    }
  }
  if (slideIndex !== (previousIndex || 0) && runCallbacks) {
    swiper.emit("beforeSlideChangeStart");
  }
  swiper.updateProgress(translate2);
  let direction;
  if (slideIndex > activeIndex) direction = "next";
  else if (slideIndex < activeIndex) direction = "prev";
  else direction = "reset";
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  const isInitialVirtual = isVirtual && initial;
  if (!isInitialVirtual && (rtl && -translate2 === swiper.translate || !rtl && translate2 === swiper.translate)) {
    swiper.updateActiveIndex(slideIndex);
    if (params.autoHeight) {
      swiper.updateAutoHeight();
    }
    swiper.updateSlidesClasses();
    if (params.effect !== "slide") {
      swiper.setTranslate(translate2);
    }
    if (direction !== "reset") {
      swiper.transitionStart(runCallbacks, direction);
      swiper.transitionEnd(runCallbacks, direction);
    }
    return false;
  }
  if (params.cssMode) {
    const isH = swiper.isHorizontal();
    const t = rtl ? translate2 : -translate2;
    if (speed === 0) {
      if (isVirtual) {
        swiper.wrapperEl.style.scrollSnapType = "none";
        swiper._immediateVirtual = true;
      }
      if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
        swiper._cssModeVirtualInitialSet = true;
        requestAnimationFrame(() => {
          wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
        });
      } else {
        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
      }
      if (isVirtual) {
        requestAnimationFrame(() => {
          swiper.wrapperEl.style.scrollSnapType = "";
          swiper._immediateVirtual = false;
        });
      }
    } else {
      if (!swiper.support.smoothScroll) {
        animateCSSModeScroll({
          swiper,
          targetPosition: t,
          side: isH ? "left" : "top"
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? "left" : "top"]: t,
        behavior: "smooth"
      });
    }
    return true;
  }
  const browser2 = getBrowser();
  const isSafari = browser2.isSafari;
  if (isVirtual && !initial && isSafari && swiper.isElement) {
    swiper.virtual.update(false, false, slideIndex);
  }
  swiper.setTransition(speed);
  swiper.setTranslate(translate2);
  swiper.updateActiveIndex(slideIndex);
  swiper.updateSlidesClasses();
  swiper.emit("beforeTransitionStart", speed, internal);
  swiper.transitionStart(runCallbacks, direction);
  if (speed === 0) {
    swiper.transitionEnd(runCallbacks, direction);
  } else if (!swiper.animating) {
    swiper.animating = true;
    if (!swiper.onSlideToWrapperTransitionEnd) {
      swiper.onSlideToWrapperTransitionEnd = function transitionEnd2(e) {
        if (!swiper || swiper.destroyed) return;
        if (e.target !== this) return;
        swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
        swiper.onSlideToWrapperTransitionEnd = null;
        delete swiper.onSlideToWrapperTransitionEnd;
        swiper.transitionEnd(runCallbacks, direction);
      };
    }
    swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
  }
  return true;
}
function slideToLoop(index = 0, speed, runCallbacks = true, internal) {
  if (typeof index === "string") {
    const indexAsNumber = parseInt(index, 10);
    index = indexAsNumber;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
  let newIndex = index;
  if (swiper.params.loop) {
    if (swiper.virtual && swiper.params.virtual.enabled) {
      newIndex = newIndex + swiper.virtual.slidesBefore;
    } else {
      let targetSlideIndex;
      if (gridEnabled) {
        const slideIndex = newIndex * swiper.params.grid.rows;
        targetSlideIndex = swiper.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
      } else {
        targetSlideIndex = swiper.getSlideIndexByData(newIndex);
      }
      const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
      const {
        centeredSlides,
        slidesOffsetBefore,
        slidesOffsetAfter
      } = swiper.params;
      const bothDirections = centeredSlides || !!slidesOffsetBefore || !!slidesOffsetAfter;
      let slidesPerView = swiper.params.slidesPerView;
      if (slidesPerView === "auto") {
        slidesPerView = swiper.slidesPerViewDynamic();
      } else {
        slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
        if (bothDirections && slidesPerView % 2 === 0) {
          slidesPerView = slidesPerView + 1;
        }
      }
      let needLoopFix = cols - targetSlideIndex < slidesPerView;
      if (bothDirections) {
        needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
      }
      if (internal && bothDirections && swiper.params.slidesPerView !== "auto" && !gridEnabled) {
        needLoopFix = false;
      }
      if (needLoopFix) {
        const direction = bothDirections ? targetSlideIndex < swiper.activeIndex ? "prev" : "next" : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? "next" : "prev";
        swiper.loopFix({
          direction,
          slideTo: true,
          activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
          slideRealIndex: direction === "next" ? swiper.realIndex : void 0
        });
      }
      if (gridEnabled) {
        const slideIndex = newIndex * swiper.params.grid.rows;
        newIndex = swiper.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
      } else {
        newIndex = swiper.getSlideIndexByData(newIndex);
      }
    }
  }
  requestAnimationFrame(() => {
    swiper.slideTo(newIndex, speed, runCallbacks, internal);
  });
  return swiper;
}
function slideNext(speed, runCallbacks = true, internal) {
  const swiper = this;
  const {
    enabled,
    params,
    animating
  } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  let perGroup = params.slidesPerGroup;
  if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
    perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
  }
  const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;
    swiper.loopFix({
      direction: "next"
    });
    swiper._clientLeft = swiper.wrapperEl.clientLeft;
    if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
      requestAnimationFrame(() => {
        swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
      });
      return true;
    }
  }
  if (params.rewind && swiper.isEnd) {
    return swiper.slideTo(0, speed, runCallbacks, internal);
  }
  return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
}
function slidePrev(speed, runCallbacks = true, internal) {
  const swiper = this;
  const {
    params,
    snapGrid,
    slidesGrid,
    rtlTranslate,
    enabled,
    animating
  } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;
    swiper.loopFix({
      direction: "prev"
    });
    swiper._clientLeft = swiper.wrapperEl.clientLeft;
  }
  const translate2 = rtlTranslate ? swiper.translate : -swiper.translate;
  function normalize(val) {
    if (val < 0) return -Math.floor(Math.abs(val));
    return Math.floor(val);
  }
  const normalizedTranslate = normalize(translate2);
  const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
  const isFreeMode = params.freeMode && params.freeMode.enabled;
  let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
  if (typeof prevSnap === "undefined" && (params.cssMode || isFreeMode)) {
    let prevSnapIndex;
    snapGrid.forEach((snap, snapIndex) => {
      if (normalizedTranslate >= snap) {
        prevSnapIndex = snapIndex;
      }
    });
    if (typeof prevSnapIndex !== "undefined") {
      prevSnap = isFreeMode ? snapGrid[prevSnapIndex] : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
    }
  }
  let prevIndex = 0;
  if (typeof prevSnap !== "undefined") {
    prevIndex = slidesGrid.indexOf(prevSnap);
    if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
    if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
      prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
      prevIndex = Math.max(prevIndex, 0);
    }
  }
  if (params.rewind && swiper.isBeginning) {
    const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
    return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
  } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
    requestAnimationFrame(() => {
      swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    });
    return true;
  }
  return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
}
function slideReset(speed, runCallbacks = true, internal) {
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
}
function slideToClosest(speed, runCallbacks = true, internal, threshold = 0.5) {
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  let index = swiper.activeIndex;
  const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
  const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  if (translate2 >= swiper.snapGrid[snapIndex]) {
    const currentSnap = swiper.snapGrid[snapIndex];
    const nextSnap = swiper.snapGrid[snapIndex + 1];
    if (translate2 - currentSnap > (nextSnap - currentSnap) * threshold) {
      index += swiper.params.slidesPerGroup;
    }
  } else {
    const prevSnap = swiper.snapGrid[snapIndex - 1];
    const currentSnap = swiper.snapGrid[snapIndex];
    if (translate2 - prevSnap <= (currentSnap - prevSnap) * threshold) {
      index -= swiper.params.slidesPerGroup;
    }
  }
  index = Math.max(index, 0);
  index = Math.min(index, swiper.slidesGrid.length - 1);
  return swiper.slideTo(index, speed, runCallbacks, internal);
}
function slideToClickedSlide() {
  const swiper = this;
  if (swiper.destroyed) return;
  const {
    params,
    slidesEl
  } = swiper;
  const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
  let slideToIndex = swiper.getSlideIndexWhenGrid(swiper.clickedIndex);
  let realIndex;
  const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
  const isGrid = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
  if (params.loop) {
    if (swiper.animating) return;
    realIndex = parseInt(swiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
    if (params.centeredSlides) {
      swiper.slideToLoop(realIndex);
    } else if (slideToIndex > (isGrid ? (swiper.slides.length - slidesPerView) / 2 - (swiper.params.grid.rows - 1) : swiper.slides.length - slidesPerView)) {
      swiper.loopFix();
      slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
      nextTick(() => {
        swiper.slideTo(slideToIndex);
      });
    } else {
      swiper.slideTo(slideToIndex);
    }
  } else {
    swiper.slideTo(slideToIndex);
  }
}
var slide = {
  slideTo,
  slideToLoop,
  slideNext,
  slidePrev,
  slideReset,
  slideToClosest,
  slideToClickedSlide
};
function loopCreate(slideRealIndex, initial) {
  const swiper = this;
  const {
    params,
    slidesEl
  } = swiper;
  if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
  const initSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    slides.forEach((el, index) => {
      el.setAttribute("data-swiper-slide-index", index);
    });
  };
  const clearBlankSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideBlankClass}`);
    slides.forEach((el) => {
      el.remove();
    });
    if (slides.length > 0) {
      swiper.recalcSlides();
      swiper.updateSlides();
    }
  };
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  if (params.loopAddBlankSlides && (params.slidesPerGroup > 1 || gridEnabled)) {
    clearBlankSlides();
  }
  const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
  const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
  const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
  const addBlankSlides = (amountOfSlides) => {
    for (let i = 0; i < amountOfSlides; i += 1) {
      const slideEl = swiper.isElement ? createElement("swiper-slide", [params.slideBlankClass]) : createElement("div", [params.slideClass, params.slideBlankClass]);
      swiper.slidesEl.append(slideEl);
    }
  };
  if (shouldFillGroup) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
    }
    initSlides();
  } else if (shouldFillGrid) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
    }
    initSlides();
  } else {
    initSlides();
  }
  const bothDirections = params.centeredSlides || !!params.slidesOffsetBefore || !!params.slidesOffsetAfter;
  swiper.loopFix({
    slideRealIndex,
    direction: bothDirections ? void 0 : "next",
    initial
  });
}
function loopFix({
  slideRealIndex,
  slideTo: slideTo2 = true,
  direction,
  setTranslate: setTranslate2,
  activeSlideIndex,
  initial,
  byController,
  byMousewheel
} = {}) {
  const swiper = this;
  if (!swiper.params.loop) return;
  swiper.emit("beforeLoopFix");
  const {
    slides,
    allowSlidePrev,
    allowSlideNext,
    slidesEl,
    params
  } = swiper;
  const {
    centeredSlides,
    slidesOffsetBefore,
    slidesOffsetAfter,
    initialSlide
  } = params;
  const bothDirections = centeredSlides || !!slidesOffsetBefore || !!slidesOffsetAfter;
  swiper.allowSlidePrev = true;
  swiper.allowSlideNext = true;
  if (swiper.virtual && params.virtual.enabled) {
    if (slideTo2) {
      if (!bothDirections && swiper.snapIndex === 0) {
        swiper.slideTo(swiper.virtual.slides.length, 0, false, true);
      } else if (bothDirections && swiper.snapIndex < params.slidesPerView) {
        swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true);
      } else if (swiper.snapIndex === swiper.snapGrid.length - 1) {
        swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
      }
    }
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
    swiper.emit("loopFix");
    return;
  }
  let slidesPerView = params.slidesPerView;
  if (slidesPerView === "auto") {
    slidesPerView = swiper.slidesPerViewDynamic();
  } else {
    slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
    if (bothDirections && slidesPerView % 2 === 0) {
      slidesPerView = slidesPerView + 1;
    }
  }
  const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
  let loopedSlides = bothDirections ? Math.max(slidesPerGroup, Math.ceil(slidesPerView / 2)) : slidesPerGroup;
  if (loopedSlides % slidesPerGroup !== 0) {
    loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
  }
  loopedSlides += params.loopAdditionalSlides;
  swiper.loopedSlides = loopedSlides;
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  if (slides.length < slidesPerView + loopedSlides || swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
    showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters");
  } else if (gridEnabled && params.grid.fill === "row") {
    showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
  }
  const prependSlidesIndexes = [];
  const appendSlidesIndexes = [];
  const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
  const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !bothDirections;
  let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;
  if (typeof activeSlideIndex === "undefined") {
    activeSlideIndex = swiper.getSlideIndex(slides.find((el) => el.classList.contains(params.slideActiveClass)));
  } else {
    activeIndex = activeSlideIndex;
  }
  const isNext = direction === "next" || !direction;
  const isPrev = direction === "prev" || !direction;
  let slidesPrepended = 0;
  let slidesAppended = 0;
  const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
  const activeColIndexWithShift = activeColIndex + (bothDirections && typeof setTranslate2 === "undefined" ? -slidesPerView / 2 + 0.5 : 0);
  if (activeColIndexWithShift < loopedSlides) {
    slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
    for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        const colIndexToPrepend = cols - index - 1;
        for (let i2 = slides.length - 1; i2 >= 0; i2 -= 1) {
          if (slides[i2].column === colIndexToPrepend) prependSlidesIndexes.push(i2);
        }
      } else {
        prependSlidesIndexes.push(cols - index - 1);
      }
    }
  } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
    slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
    if (isInitialOverflow) {
      slidesAppended = Math.max(slidesAppended, slidesPerView - cols + initialSlide + 1);
    }
    for (let i = 0; i < slidesAppended; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        slides.forEach((slide2, slideIndex) => {
          if (slide2.column === index) appendSlidesIndexes.push(slideIndex);
        });
      } else {
        appendSlidesIndexes.push(index);
      }
    }
  }
  swiper.__preventObserver__ = true;
  requestAnimationFrame(() => {
    swiper.__preventObserver__ = false;
  });
  if (swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
    if (appendSlidesIndexes.includes(activeSlideIndex)) {
      appendSlidesIndexes.splice(appendSlidesIndexes.indexOf(activeSlideIndex), 1);
    }
    if (prependSlidesIndexes.includes(activeSlideIndex)) {
      prependSlidesIndexes.splice(prependSlidesIndexes.indexOf(activeSlideIndex), 1);
    }
  }
  if (isPrev) {
    prependSlidesIndexes.forEach((index) => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.prepend(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  if (isNext) {
    appendSlidesIndexes.forEach((index) => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.append(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  swiper.recalcSlides();
  if (params.slidesPerView === "auto") {
    swiper.updateSlides();
  } else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) {
    swiper.slides.forEach((slide2, slideIndex) => {
      swiper.grid.updateSlide(slideIndex, slide2, swiper.slides);
    });
  }
  if (params.watchSlidesProgress) {
    swiper.updateSlidesOffset();
  }
  if (slideTo2) {
    if (prependSlidesIndexes.length > 0 && isPrev) {
      if (typeof slideRealIndex === "undefined") {
        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
        const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper.setTranslate(swiper.translate - diff);
        } else {
          swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
          if (setTranslate2) {
            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        if (setTranslate2) {
          const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
          swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
          swiper.touchEventsData.currentTranslate = swiper.translate;
        }
      }
    } else if (appendSlidesIndexes.length > 0 && isNext) {
      if (typeof slideRealIndex === "undefined") {
        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
        const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper.setTranslate(swiper.translate - diff);
        } else {
          swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
          if (setTranslate2) {
            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
        swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
      }
    }
  }
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
  if (swiper.controller && swiper.controller.control && !byController) {
    const loopParams = {
      slideRealIndex,
      direction,
      setTranslate: setTranslate2,
      activeSlideIndex,
      byController: true
    };
    if (Array.isArray(swiper.controller.control)) {
      swiper.controller.control.forEach((c) => {
        if (!c.destroyed && c.params.loop) c.loopFix({
          ...loopParams,
          slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo2 : false
        });
      });
    } else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) {
      swiper.controller.control.loopFix({
        ...loopParams,
        slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo2 : false
      });
    }
  }
  swiper.emit("loopFix");
}
function loopDestroy() {
  const swiper = this;
  const {
    params,
    slidesEl
  } = swiper;
  if (!params.loop || !slidesEl || swiper.virtual && swiper.params.virtual.enabled) return;
  swiper.recalcSlides();
  const newSlidesOrder = [];
  swiper.slides.forEach((slideEl) => {
    const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
    newSlidesOrder[index] = slideEl;
  });
  swiper.slides.forEach((slideEl) => {
    slideEl.removeAttribute("data-swiper-slide-index");
  });
  newSlidesOrder.forEach((slideEl) => {
    slidesEl.append(slideEl);
  });
  swiper.recalcSlides();
  swiper.slideTo(swiper.realIndex, 0);
}
var loop = {
  loopCreate,
  loopFix,
  loopDestroy
};
function setGrabCursor(moving) {
  const swiper = this;
  if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
  const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
  if (swiper.isElement) {
    swiper.__preventObserver__ = true;
  }
  el.style.cursor = "move";
  el.style.cursor = moving ? "grabbing" : "grab";
  if (swiper.isElement) {
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
  }
}
function unsetGrabCursor() {
  const swiper = this;
  if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
    return;
  }
  if (swiper.isElement) {
    swiper.__preventObserver__ = true;
  }
  swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
  if (swiper.isElement) {
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
  }
}
var grabCursor = {
  setGrabCursor,
  unsetGrabCursor
};
function closestElement(selector, base = this) {
  function __closestFrom(el) {
    if (!el || el === getDocument() || el === getWindow()) return null;
    if (el.assignedSlot) el = el.assignedSlot;
    const found = el.closest(selector);
    if (!found && !el.getRootNode) {
      return null;
    }
    return found || __closestFrom(el.getRootNode().host);
  }
  return __closestFrom(base);
}
function preventEdgeSwipe(swiper, event, startX) {
  const window2 = getWindow();
  const {
    params
  } = swiper;
  const edgeSwipeDetection = params.edgeSwipeDetection;
  const edgeSwipeThreshold = params.edgeSwipeThreshold;
  if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window2.innerWidth - edgeSwipeThreshold)) {
    if (edgeSwipeDetection === "prevent") {
      event.preventDefault();
      return true;
    }
    return false;
  }
  return true;
}
function onTouchStart(event) {
  const swiper = this;
  const document2 = getDocument();
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  const data = swiper.touchEventsData;
  if (e.type === "pointerdown") {
    if (data.pointerId !== null && data.pointerId !== e.pointerId) {
      return;
    }
    data.pointerId = e.pointerId;
  } else if (e.type === "touchstart" && e.targetTouches.length === 1) {
    data.touchId = e.targetTouches[0].identifier;
  }
  if (e.type === "touchstart") {
    preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
    return;
  }
  const {
    params,
    touches,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && e.pointerType === "mouse") return;
  if (swiper.animating && params.preventInteractionOnTransition) {
    return;
  }
  if (!swiper.animating && params.cssMode && params.loop) {
    swiper.loopFix();
  }
  let targetEl = e.target;
  if (params.touchEventsTarget === "wrapper") {
    if (!elementIsChildOf(targetEl, swiper.wrapperEl)) return;
  }
  if ("which" in e && e.which === 3) return;
  if ("button" in e && e.button > 0) return;
  if (data.isTouched && data.isMoved) return;
  const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
  const eventPath = e.composedPath ? e.composedPath() : e.path;
  if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) {
    targetEl = eventPath[0];
  }
  const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
  const isTargetShadow = !!(e.target && e.target.shadowRoot);
  if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
    swiper.allowClick = true;
    return;
  }
  if (params.swipeHandler) {
    if (!targetEl.closest(params.swipeHandler)) return;
  }
  touches.currentX = e.pageX;
  touches.currentY = e.pageY;
  const startX = touches.currentX;
  const startY = touches.currentY;
  if (!preventEdgeSwipe(swiper, e, startX)) {
    return;
  }
  Object.assign(data, {
    isTouched: true,
    isMoved: false,
    allowTouchCallbacks: true,
    isScrolling: void 0,
    startMoving: void 0
  });
  touches.startX = startX;
  touches.startY = startY;
  data.touchStartTime = now();
  swiper.allowClick = true;
  swiper.updateSize();
  swiper.swipeDirection = void 0;
  if (params.threshold > 0) data.allowThresholdMove = false;
  let preventDefault = true;
  if (targetEl.matches(data.focusableElements)) {
    preventDefault = false;
    if (targetEl.nodeName === "SELECT") {
      data.isTouched = false;
    }
  }
  if (document2.activeElement && document2.activeElement.matches(data.focusableElements) && document2.activeElement !== targetEl && (e.pointerType === "mouse" || e.pointerType !== "mouse" && !targetEl.matches(data.focusableElements))) {
    document2.activeElement.blur();
  }
  const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
  if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) {
    e.preventDefault();
  }
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
    swiper.freeMode.onTouchStart();
  }
  swiper.emit("touchStart", e);
}
function onTouchMove(event) {
  const document2 = getDocument();
  const swiper = this;
  const data = swiper.touchEventsData;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && event.pointerType === "mouse") return;
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  if (e.type === "pointermove") {
    if (data.touchId !== null) return;
    const id = e.pointerId;
    if (id !== data.pointerId) return;
  }
  let targetTouch;
  if (e.type === "touchmove") {
    targetTouch = [...e.changedTouches].find((t) => t.identifier === data.touchId);
    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
  } else {
    targetTouch = e;
  }
  if (!data.isTouched) {
    if (data.startMoving && data.isScrolling) {
      swiper.emit("touchMoveOpposite", e);
    }
    return;
  }
  const pageX = targetTouch.pageX;
  const pageY = targetTouch.pageY;
  if (e.preventedByNestedSwiper) {
    touches.startX = pageX;
    touches.startY = pageY;
    return;
  }
  if (!swiper.allowTouchMove) {
    if (!e.target.matches(data.focusableElements)) {
      swiper.allowClick = false;
    }
    if (data.isTouched) {
      Object.assign(touches, {
        startX: pageX,
        startY: pageY,
        currentX: pageX,
        currentY: pageY
      });
      data.touchStartTime = now();
    }
    return;
  }
  if (params.touchReleaseOnEdges && !params.loop) {
    if (swiper.isVertical()) {
      if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
        data.isTouched = false;
        data.isMoved = false;
        return;
      }
    } else if (rtl && (pageX > touches.startX && -swiper.translate <= swiper.maxTranslate() || pageX < touches.startX && -swiper.translate >= swiper.minTranslate())) {
      return;
    } else if (!rtl && (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate())) {
      return;
    }
  }
  if (document2.activeElement && document2.activeElement.matches(data.focusableElements) && document2.activeElement !== e.target && e.pointerType !== "mouse") {
    document2.activeElement.blur();
  }
  if (document2.activeElement) {
    if (e.target === document2.activeElement && e.target.matches(data.focusableElements)) {
      data.isMoved = true;
      swiper.allowClick = false;
      return;
    }
  }
  if (data.allowTouchCallbacks) {
    swiper.emit("touchMove", e);
  }
  touches.previousX = touches.currentX;
  touches.previousY = touches.currentY;
  touches.currentX = pageX;
  touches.currentY = pageY;
  const diffX = touches.currentX - touches.startX;
  const diffY = touches.currentY - touches.startY;
  if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
  if (typeof data.isScrolling === "undefined") {
    let touchAngle;
    if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
      data.isScrolling = false;
    } else {
      if (diffX * diffX + diffY * diffY >= 25) {
        touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
        data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
      }
    }
  }
  if (data.isScrolling) {
    swiper.emit("touchMoveOpposite", e);
  }
  if (typeof data.startMoving === "undefined") {
    if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
      data.startMoving = true;
    }
  }
  if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
    data.isTouched = false;
    return;
  }
  if (!data.startMoving) {
    return;
  }
  swiper.allowClick = false;
  if (!params.cssMode && e.cancelable) {
    e.preventDefault();
  }
  if (params.touchMoveStopPropagation && !params.nested) {
    e.stopPropagation();
  }
  let diff = swiper.isHorizontal() ? diffX : diffY;
  let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
  if (params.oneWayMovement) {
    diff = Math.abs(diff) * (rtl ? 1 : -1);
    touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
  }
  touches.diff = diff;
  diff *= params.touchRatio;
  if (rtl) {
    diff = -diff;
    touchesDiff = -touchesDiff;
  }
  const prevTouchesDirection = swiper.touchesDirection;
  swiper.swipeDirection = diff > 0 ? "prev" : "next";
  swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
  const isLoop = swiper.params.loop && !params.cssMode;
  const allowLoopFix = swiper.touchesDirection === "next" && swiper.allowSlideNext || swiper.touchesDirection === "prev" && swiper.allowSlidePrev;
  if (!data.isMoved) {
    if (isLoop && allowLoopFix) {
      swiper.loopFix({
        direction: swiper.swipeDirection
      });
    }
    data.startTranslate = swiper.getTranslate();
    swiper.setTransition(0);
    if (swiper.animating) {
      const evt = new window.CustomEvent("transitionend", {
        bubbles: true,
        cancelable: true,
        detail: {
          bySwiperTouchMove: true
        }
      });
      swiper.wrapperEl.dispatchEvent(evt);
    }
    data.allowMomentumBounce = false;
    if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
      swiper.setGrabCursor(true);
    }
    swiper.emit("sliderFirstMove", e);
  }
  (/* @__PURE__ */ new Date()).getTime();
  if (params._loopSwapReset !== false && data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
    Object.assign(touches, {
      startX: pageX,
      startY: pageY,
      currentX: pageX,
      currentY: pageY,
      startTranslate: data.currentTranslate
    });
    data.loopSwapReset = true;
    data.startTranslate = data.currentTranslate;
    return;
  }
  swiper.emit("sliderMove", e);
  data.isMoved = true;
  data.currentTranslate = diff + data.startTranslate;
  let disableParentSwiper = true;
  let resistanceRatio = params.resistanceRatio;
  if (params.touchReleaseOnEdges) {
    resistanceRatio = 0;
  }
  if (diff > 0) {
    if (isLoop && allowLoopFix && true && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] - (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.activeIndex + 1] + swiper.params.spaceBetween : 0) - swiper.params.spaceBetween : swiper.minTranslate())) {
      swiper.loopFix({
        direction: "prev",
        setTranslate: true,
        activeSlideIndex: 0
      });
    }
    if (data.currentTranslate > swiper.minTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
      }
    }
  } else if (diff < 0) {
    if (isLoop && allowLoopFix && true && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween + (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween : 0) : swiper.maxTranslate())) {
      swiper.loopFix({
        direction: "next",
        setTranslate: true,
        activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
      });
    }
    if (data.currentTranslate < swiper.maxTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
      }
    }
  }
  if (disableParentSwiper) {
    e.preventedByNestedSwiper = true;
  }
  if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && data.currentTranslate < data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
    data.currentTranslate = data.startTranslate;
  }
  if (params.threshold > 0) {
    if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
      if (!data.allowThresholdMove) {
        data.allowThresholdMove = true;
        touches.startX = touches.currentX;
        touches.startY = touches.currentY;
        data.currentTranslate = data.startTranslate;
        touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
        return;
      }
    } else {
      data.currentTranslate = data.startTranslate;
      return;
    }
  }
  if (!params.followFinger || params.cssMode) return;
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode) {
    swiper.freeMode.onTouchMove();
  }
  swiper.updateProgress(data.currentTranslate);
  swiper.setTranslate(data.currentTranslate);
}
function onTouchEnd(event) {
  const swiper = this;
  const data = swiper.touchEventsData;
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  let targetTouch;
  const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
  if (!isTouchEvent) {
    if (data.touchId !== null) return;
    if (e.pointerId !== data.pointerId) return;
    targetTouch = e;
  } else {
    targetTouch = [...e.changedTouches].find((t) => t.identifier === data.touchId);
    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
  }
  if (["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(e.type)) {
    const proceed = ["pointercancel", "contextmenu"].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
    if (!proceed) {
      return;
    }
  }
  data.pointerId = null;
  data.touchId = null;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    slidesGrid,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && e.pointerType === "mouse") return;
  if (data.allowTouchCallbacks) {
    swiper.emit("touchEnd", e);
  }
  data.allowTouchCallbacks = false;
  if (!data.isTouched) {
    if (data.isMoved && params.grabCursor) {
      swiper.setGrabCursor(false);
    }
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
    swiper.setGrabCursor(false);
  }
  const touchEndTime = now();
  const timeDiff = touchEndTime - data.touchStartTime;
  if (swiper.allowClick) {
    const pathTree = e.path || e.composedPath && e.composedPath();
    swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
    swiper.emit("tap click", e);
    if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
      swiper.emit("doubleTap doubleClick", e);
    }
  }
  data.lastClickTime = now();
  nextTick(() => {
    if (!swiper.destroyed) swiper.allowClick = true;
  });
  if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
    data.isTouched = false;
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  data.isTouched = false;
  data.isMoved = false;
  data.startMoving = false;
  let currentPos;
  if (params.followFinger) {
    currentPos = rtl ? swiper.translate : -swiper.translate;
  } else {
    currentPos = -data.currentTranslate;
  }
  if (params.cssMode) {
    return;
  }
  if (params.freeMode && params.freeMode.enabled) {
    swiper.freeMode.onTouchEnd({
      currentPos
    });
    return;
  }
  const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
  let stopIndex = 0;
  let groupSize = swiper.slidesSizesGrid[0];
  for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
    const increment2 = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
    if (typeof slidesGrid[i + increment2] !== "undefined") {
      if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment2]) {
        stopIndex = i;
        groupSize = slidesGrid[i + increment2] - slidesGrid[i];
      }
    } else if (swipeToLast || currentPos >= slidesGrid[i]) {
      stopIndex = i;
      groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
    }
  }
  let rewindFirstIndex = null;
  let rewindLastIndex = null;
  if (params.rewind) {
    if (swiper.isBeginning) {
      rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
    } else if (swiper.isEnd) {
      rewindFirstIndex = 0;
    }
  }
  const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
  const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
  if (timeDiff > params.longSwipesMs) {
    if (!params.longSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    if (swiper.swipeDirection === "next") {
      if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);
      else swiper.slideTo(stopIndex);
    }
    if (swiper.swipeDirection === "prev") {
      if (ratio > 1 - params.longSwipesRatio) {
        swiper.slideTo(stopIndex + increment);
      } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
        swiper.slideTo(rewindLastIndex);
      } else {
        swiper.slideTo(stopIndex);
      }
    }
  } else {
    if (!params.shortSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
    if (!isNavButtonTarget) {
      if (swiper.swipeDirection === "next") {
        swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
      }
      if (swiper.swipeDirection === "prev") {
        swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
      }
    } else if (e.target === swiper.navigation.nextEl) {
      swiper.slideTo(stopIndex + increment);
    } else {
      swiper.slideTo(stopIndex);
    }
  }
}
function onResize() {
  const swiper = this;
  const {
    params,
    el
  } = swiper;
  if (el && el.offsetWidth === 0) return;
  if (params.breakpoints) {
    swiper.setBreakpoint();
  }
  const {
    allowSlideNext,
    allowSlidePrev,
    snapGrid
  } = swiper;
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  swiper.allowSlideNext = true;
  swiper.allowSlidePrev = true;
  swiper.updateSize();
  swiper.updateSlides();
  swiper.updateSlidesClasses();
  const isVirtualLoop = isVirtual && params.loop;
  if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) {
    swiper.slideTo(swiper.slides.length - 1, 0, false, true);
  } else {
    if (swiper.params.loop && !isVirtual) {
      swiper.slideToLoop(swiper.realIndex, 0, false, true);
    } else {
      swiper.slideTo(swiper.activeIndex, 0, false, true);
    }
  }
  if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
    clearTimeout(swiper.autoplay.resizeTimeout);
    swiper.autoplay.resizeTimeout = setTimeout(() => {
      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        swiper.autoplay.resume();
      }
    }, 500);
  }
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
  if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
    swiper.checkOverflow();
  }
}
function onClick(e) {
  const swiper = this;
  if (!swiper.enabled) return;
  if (!swiper.allowClick) {
    if (swiper.params.preventClicks) e.preventDefault();
    if (swiper.params.preventClicksPropagation && swiper.animating) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}
function onScroll() {
  const swiper = this;
  const {
    wrapperEl,
    rtlTranslate,
    enabled
  } = swiper;
  if (!enabled) return;
  swiper.previousTranslate = swiper.translate;
  if (swiper.isHorizontal()) {
    swiper.translate = -wrapperEl.scrollLeft;
  } else {
    swiper.translate = -wrapperEl.scrollTop;
  }
  if (swiper.translate === 0) swiper.translate = 0;
  swiper.updateActiveIndex();
  swiper.updateSlidesClasses();
  let newProgress;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
  }
  if (newProgress !== swiper.progress) {
    swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
  }
  swiper.emit("setTranslate", swiper.translate, false);
}
function onLoad(e) {
  const swiper = this;
  processLazyPreloader(swiper, e.target);
  if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) {
    return;
  }
  swiper.update();
}
function onDocumentTouchStart() {
  const swiper = this;
  if (swiper.documentTouchHandlerProceeded) return;
  swiper.documentTouchHandlerProceeded = true;
  if (swiper.params.touchReleaseOnEdges) {
    swiper.el.style.touchAction = "auto";
  }
}
const events = (swiper, method) => {
  const document2 = getDocument();
  const {
    params,
    el,
    wrapperEl,
    device
  } = swiper;
  const capture = !!params.nested;
  const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
  const swiperMethod = method;
  if (!el || typeof el === "string") return;
  document2[domMethod]("touchstart", swiper.onDocumentTouchStart, {
    passive: false,
    capture
  });
  el[domMethod]("touchstart", swiper.onTouchStart, {
    passive: false
  });
  el[domMethod]("pointerdown", swiper.onTouchStart, {
    passive: false
  });
  document2[domMethod]("touchmove", swiper.onTouchMove, {
    passive: false,
    capture
  });
  document2[domMethod]("pointermove", swiper.onTouchMove, {
    passive: false,
    capture
  });
  document2[domMethod]("touchend", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerup", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointercancel", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("touchcancel", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerout", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerleave", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("contextmenu", swiper.onTouchEnd, {
    passive: true
  });
  if (params.preventClicks || params.preventClicksPropagation) {
    el[domMethod]("click", swiper.onClick, true);
  }
  if (params.cssMode) {
    wrapperEl[domMethod]("scroll", swiper.onScroll);
  }
  if (params.updateOnWindowResize) {
    swiper[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true);
  } else {
    swiper[swiperMethod]("observerUpdate", onResize, true);
  }
  el[domMethod]("load", swiper.onLoad, {
    capture: true
  });
};
function attachEvents() {
  const swiper = this;
  const {
    params
  } = swiper;
  swiper.onTouchStart = onTouchStart.bind(swiper);
  swiper.onTouchMove = onTouchMove.bind(swiper);
  swiper.onTouchEnd = onTouchEnd.bind(swiper);
  swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
  if (params.cssMode) {
    swiper.onScroll = onScroll.bind(swiper);
  }
  swiper.onClick = onClick.bind(swiper);
  swiper.onLoad = onLoad.bind(swiper);
  events(swiper, "on");
}
function detachEvents() {
  const swiper = this;
  events(swiper, "off");
}
var events$1 = {
  attachEvents,
  detachEvents
};
const isGridEnabled = (swiper, params) => {
  return swiper.grid && params.grid && params.grid.rows > 1;
};
function setBreakpoint() {
  const swiper = this;
  const {
    realIndex,
    initialized,
    params,
    el
  } = swiper;
  const breakpoints2 = params.breakpoints;
  if (!breakpoints2 || breakpoints2 && Object.keys(breakpoints2).length === 0) return;
  const document2 = getDocument();
  const breakpointsBase = params.breakpointsBase === "window" || !params.breakpointsBase ? params.breakpointsBase : "container";
  const breakpointContainer = ["window", "container"].includes(params.breakpointsBase) || !params.breakpointsBase ? swiper.el : document2.querySelector(params.breakpointsBase);
  const breakpoint = swiper.getBreakpoint(breakpoints2, breakpointsBase, breakpointContainer);
  if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
  const breakpointOnlyParams = breakpoint in breakpoints2 ? breakpoints2[breakpoint] : void 0;
  const breakpointParams = breakpointOnlyParams || swiper.originalParams;
  const wasMultiRow = isGridEnabled(swiper, params);
  const isMultiRow = isGridEnabled(swiper, breakpointParams);
  const wasGrabCursor = swiper.params.grabCursor;
  const isGrabCursor = breakpointParams.grabCursor;
  const wasEnabled = params.enabled;
  if (wasMultiRow && !isMultiRow) {
    el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
    swiper.emitContainerClasses();
  } else if (!wasMultiRow && isMultiRow) {
    el.classList.add(`${params.containerModifierClass}grid`);
    if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") {
      el.classList.add(`${params.containerModifierClass}grid-column`);
    }
    swiper.emitContainerClasses();
  }
  if (wasGrabCursor && !isGrabCursor) {
    swiper.unsetGrabCursor();
  } else if (!wasGrabCursor && isGrabCursor) {
    swiper.setGrabCursor();
  }
  ["navigation", "pagination", "scrollbar"].forEach((prop) => {
    if (typeof breakpointParams[prop] === "undefined") return;
    const wasModuleEnabled = params[prop] && params[prop].enabled;
    const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
    if (wasModuleEnabled && !isModuleEnabled) {
      swiper[prop].disable();
    }
    if (!wasModuleEnabled && isModuleEnabled) {
      swiper[prop].enable();
    }
  });
  const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
  const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
  const wasLoop = params.loop;
  if (directionChanged && initialized) {
    swiper.changeDirection();
  }
  extend(swiper.params, breakpointParams);
  const isEnabled = swiper.params.enabled;
  const hasLoop = swiper.params.loop;
  Object.assign(swiper, {
    allowTouchMove: swiper.params.allowTouchMove,
    allowSlideNext: swiper.params.allowSlideNext,
    allowSlidePrev: swiper.params.allowSlidePrev
  });
  if (wasEnabled && !isEnabled) {
    swiper.disable();
  } else if (!wasEnabled && isEnabled) {
    swiper.enable();
  }
  swiper.currentBreakpoint = breakpoint;
  swiper.emit("_beforeBreakpoint", breakpointParams);
  if (initialized) {
    if (needsReLoop) {
      swiper.loopDestroy();
      swiper.loopCreate(realIndex);
      swiper.updateSlides();
    } else if (!wasLoop && hasLoop) {
      swiper.loopCreate(realIndex);
      swiper.updateSlides();
    } else if (wasLoop && !hasLoop) {
      swiper.loopDestroy();
    }
  }
  swiper.emit("breakpoint", breakpointParams);
}
function getBreakpoint(breakpoints2, base = "window", containerEl) {
  if (!breakpoints2 || base === "container" && !containerEl) return void 0;
  let breakpoint = false;
  const window2 = getWindow();
  const currentHeight = base === "window" ? window2.innerHeight : containerEl.clientHeight;
  const points = Object.keys(breakpoints2).map((point) => {
    if (typeof point === "string" && point.indexOf("@") === 0) {
      const minRatio = parseFloat(point.substr(1));
      const value = currentHeight * minRatio;
      return {
        value,
        point
      };
    }
    return {
      value: point,
      point
    };
  });
  points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
  for (let i = 0; i < points.length; i += 1) {
    const {
      point,
      value
    } = points[i];
    if (base === "window") {
      if (window2.matchMedia(`(min-width: ${value}px)`).matches) {
        breakpoint = point;
      }
    } else if (value <= containerEl.clientWidth) {
      breakpoint = point;
    }
  }
  return breakpoint || "max";
}
var breakpoints = {
  setBreakpoint,
  getBreakpoint
};
function prepareClasses(entries, prefix) {
  const resultClasses = [];
  entries.forEach((item) => {
    if (typeof item === "object") {
      Object.keys(item).forEach((classNames) => {
        if (item[classNames]) {
          resultClasses.push(prefix + classNames);
        }
      });
    } else if (typeof item === "string") {
      resultClasses.push(prefix + item);
    }
  });
  return resultClasses;
}
function addClasses() {
  const swiper = this;
  const {
    classNames,
    params,
    rtl,
    el,
    device
  } = swiper;
  const suffixes = prepareClasses(["initialized", params.direction, {
    "free-mode": swiper.params.freeMode && params.freeMode.enabled
  }, {
    "autoheight": params.autoHeight
  }, {
    "rtl": rtl
  }, {
    "grid": params.grid && params.grid.rows > 1
  }, {
    "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
  }, {
    "android": device.android
  }, {
    "ios": device.ios
  }, {
    "css-mode": params.cssMode
  }, {
    "centered": params.cssMode && params.centeredSlides
  }, {
    "watch-progress": params.watchSlidesProgress
  }], params.containerModifierClass);
  classNames.push(...suffixes);
  el.classList.add(...classNames);
  swiper.emitContainerClasses();
}
function removeClasses() {
  const swiper = this;
  const {
    el,
    classNames
  } = swiper;
  if (!el || typeof el === "string") return;
  el.classList.remove(...classNames);
  swiper.emitContainerClasses();
}
var classes = {
  addClasses,
  removeClasses
};
function checkOverflow() {
  const swiper = this;
  const {
    isLocked: wasLocked,
    params
  } = swiper;
  const {
    slidesOffsetBefore
  } = params;
  if (slidesOffsetBefore) {
    const lastSlideIndex = swiper.slides.length - 1;
    const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
    swiper.isLocked = swiper.size > lastSlideRightEdge;
  } else {
    swiper.isLocked = swiper.snapGrid.length === 1;
  }
  if (params.allowSlideNext === true) {
    swiper.allowSlideNext = !swiper.isLocked;
  }
  if (params.allowSlidePrev === true) {
    swiper.allowSlidePrev = !swiper.isLocked;
  }
  if (wasLocked && wasLocked !== swiper.isLocked) {
    swiper.isEnd = false;
  }
  if (wasLocked !== swiper.isLocked) {
    swiper.emit(swiper.isLocked ? "lock" : "unlock");
  }
}
var checkOverflow$1 = {
  checkOverflow
};
var defaults = {
  init: true,
  direction: "horizontal",
  oneWayMovement: false,
  swiperElementNodeName: "SWIPER-CONTAINER",
  touchEventsTarget: "wrapper",
  initialSlide: 0,
  speed: 300,
  cssMode: false,
  updateOnWindowResize: true,
  resizeObserver: true,
  nested: false,
  createElements: false,
  eventsPrefix: "swiper",
  enabled: true,
  focusableElements: "input, select, option, textarea, button, video, label",
  // Overrides
  width: null,
  height: null,
  //
  preventInteractionOnTransition: false,
  // ssr
  userAgent: null,
  url: null,
  // To support iOS's swipe-to-go-back gesture (when being used in-app).
  edgeSwipeDetection: false,
  edgeSwipeThreshold: 20,
  // Autoheight
  autoHeight: false,
  // Set wrapper width
  setWrapperSize: false,
  // Virtual Translate
  virtualTranslate: false,
  // Effects
  effect: "slide",
  // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
  // Breakpoints
  breakpoints: void 0,
  breakpointsBase: "window",
  // Slides grid
  spaceBetween: 0,
  slidesPerView: 1,
  slidesPerGroup: 1,
  slidesPerGroupSkip: 0,
  slidesPerGroupAuto: false,
  centeredSlides: false,
  centeredSlidesBounds: false,
  slidesOffsetBefore: 0,
  // in px
  slidesOffsetAfter: 0,
  // in px
  normalizeSlideIndex: true,
  centerInsufficientSlides: false,
  snapToSlideEdge: false,
  // Disable swiper and hide navigation when container not overflow
  watchOverflow: true,
  // Round length
  roundLengths: false,
  // Touches
  touchRatio: 1,
  touchAngle: 45,
  simulateTouch: true,
  shortSwipes: true,
  longSwipes: true,
  longSwipesRatio: 0.5,
  longSwipesMs: 300,
  followFinger: true,
  allowTouchMove: true,
  threshold: 5,
  touchMoveStopPropagation: false,
  touchStartPreventDefault: true,
  touchStartForcePreventDefault: false,
  touchReleaseOnEdges: false,
  // Unique Navigation Elements
  uniqueNavElements: true,
  // Resistance
  resistance: true,
  resistanceRatio: 0.85,
  // Progress
  watchSlidesProgress: false,
  // Cursor
  grabCursor: false,
  // Clicks
  preventClicks: true,
  preventClicksPropagation: true,
  slideToClickedSlide: false,
  // loop
  loop: false,
  loopAddBlankSlides: true,
  loopAdditionalSlides: 0,
  loopPreventsSliding: true,
  // rewind
  rewind: false,
  // Swiping/no swiping
  allowSlidePrev: true,
  allowSlideNext: true,
  swipeHandler: null,
  // '.swipe-handler',
  noSwiping: true,
  noSwipingClass: "swiper-no-swiping",
  noSwipingSelector: null,
  // Passive Listeners
  passiveListeners: true,
  maxBackfaceHiddenSlides: 10,
  // NS
  containerModifierClass: "swiper-",
  // NEW
  slideClass: "swiper-slide",
  slideBlankClass: "swiper-slide-blank",
  slideActiveClass: "swiper-slide-active",
  slideVisibleClass: "swiper-slide-visible",
  slideFullyVisibleClass: "swiper-slide-fully-visible",
  slideNextClass: "swiper-slide-next",
  slidePrevClass: "swiper-slide-prev",
  wrapperClass: "swiper-wrapper",
  lazyPreloaderClass: "swiper-lazy-preloader",
  lazyPreloadPrevNext: 0,
  // Callbacks
  runCallbacksOnInit: true,
  // Internals
  _emitClasses: false
};
function moduleExtendParams(params, allModulesParams) {
  return function extendParams(obj = {}) {
    const moduleParamName = Object.keys(obj)[0];
    const moduleParams = obj[moduleParamName];
    if (typeof moduleParams !== "object" || moduleParams === null) {
      extend(allModulesParams, obj);
      return;
    }
    if (params[moduleParamName] === true) {
      params[moduleParamName] = {
        enabled: true
      };
    }
    if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) {
      params[moduleParamName].auto = true;
    }
    if (["pagination", "scrollbar"].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) {
      params[moduleParamName].auto = true;
    }
    if (!(moduleParamName in params && "enabled" in moduleParams)) {
      extend(allModulesParams, obj);
      return;
    }
    if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) {
      params[moduleParamName].enabled = true;
    }
    if (!params[moduleParamName]) params[moduleParamName] = {
      enabled: false
    };
    extend(allModulesParams, obj);
  };
}
const prototypes = {
  eventsEmitter,
  update,
  translate,
  transition,
  slide,
  loop,
  grabCursor,
  events: events$1,
  breakpoints,
  checkOverflow: checkOverflow$1,
  classes
};
const extendedDefaults = {};
class Swiper {
  constructor(...args) {
    let el;
    let params;
    if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") {
      params = args[0];
    } else {
      [el, params] = args;
    }
    if (!params) params = {};
    params = extend({}, params);
    if (el && !params.el) params.el = el;
    const document2 = getDocument();
    if (params.el && typeof params.el === "string" && document2.querySelectorAll(params.el).length > 1) {
      const swipers = [];
      document2.querySelectorAll(params.el).forEach((containerEl) => {
        const newParams = extend({}, params, {
          el: containerEl
        });
        swipers.push(new Swiper(newParams));
      });
      return swipers;
    }
    const swiper = this;
    swiper.__swiper__ = true;
    swiper.support = getSupport();
    swiper.device = getDevice({
      userAgent: params.userAgent
    });
    swiper.browser = getBrowser();
    swiper.eventsListeners = {};
    swiper.eventsAnyListeners = [];
    swiper.modules = [...swiper.__modules__];
    if (params.modules && Array.isArray(params.modules)) {
      swiper.modules.push(...params.modules);
    }
    const allModulesParams = {};
    swiper.modules.forEach((mod) => {
      mod({
        params,
        swiper,
        extendParams: moduleExtendParams(params, allModulesParams),
        on: swiper.on.bind(swiper),
        once: swiper.once.bind(swiper),
        off: swiper.off.bind(swiper),
        emit: swiper.emit.bind(swiper)
      });
    });
    const swiperParams = extend({}, defaults, allModulesParams);
    swiper.params = extend({}, swiperParams, extendedDefaults, params);
    swiper.originalParams = extend({}, swiper.params);
    swiper.passedParams = extend({}, params);
    if (swiper.params && swiper.params.on) {
      Object.keys(swiper.params.on).forEach((eventName) => {
        swiper.on(eventName, swiper.params.on[eventName]);
      });
    }
    if (swiper.params && swiper.params.onAny) {
      swiper.onAny(swiper.params.onAny);
    }
    Object.assign(swiper, {
      enabled: swiper.params.enabled,
      el,
      // Classes
      classNames: [],
      // Slides
      slides: [],
      slidesGrid: [],
      snapGrid: [],
      slidesSizesGrid: [],
      // isDirection
      isHorizontal() {
        return swiper.params.direction === "horizontal";
      },
      isVertical() {
        return swiper.params.direction === "vertical";
      },
      // Indexes
      activeIndex: 0,
      realIndex: 0,
      //
      isBeginning: true,
      isEnd: false,
      // Props
      translate: 0,
      previousTranslate: 0,
      progress: 0,
      velocity: 0,
      animating: false,
      cssOverflowAdjustment() {
        return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
      },
      // Locks
      allowSlideNext: swiper.params.allowSlideNext,
      allowSlidePrev: swiper.params.allowSlidePrev,
      // Touch Events
      touchEventsData: {
        isTouched: void 0,
        isMoved: void 0,
        allowTouchCallbacks: void 0,
        touchStartTime: void 0,
        isScrolling: void 0,
        currentTranslate: void 0,
        startTranslate: void 0,
        allowThresholdMove: void 0,
        // Form elements to match
        focusableElements: swiper.params.focusableElements,
        // Last click time
        lastClickTime: 0,
        clickTimeout: void 0,
        // Velocities
        velocities: [],
        allowMomentumBounce: void 0,
        startMoving: void 0,
        pointerId: null,
        touchId: null
      },
      // Clicks
      allowClick: true,
      // Touches
      allowTouchMove: swiper.params.allowTouchMove,
      touches: {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        diff: 0
      },
      // Images
      imagesToLoad: [],
      imagesLoaded: 0
    });
    swiper.emit("_swiper");
    if (swiper.params.init) {
      swiper.init();
    }
    return swiper;
  }
  getDirectionLabel(property) {
    if (this.isHorizontal()) {
      return property;
    }
    return {
      "width": "height",
      "margin-top": "margin-left",
      "margin-bottom ": "margin-right",
      "margin-left": "margin-top",
      "margin-right": "margin-bottom",
      "padding-left": "padding-top",
      "padding-right": "padding-bottom",
      "marginRight": "marginBottom"
    }[property];
  }
  getSlideIndex(slideEl) {
    const {
      slidesEl,
      params
    } = this;
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    const firstSlideIndex = elementIndex(slides[0]);
    return elementIndex(slideEl) - firstSlideIndex;
  }
  getSlideIndexByData(index) {
    return this.getSlideIndex(this.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === index));
  }
  getSlideIndexWhenGrid(index) {
    if (this.grid && this.params.grid && this.params.grid.rows > 1) {
      if (this.params.grid.fill === "column") {
        index = Math.floor(index / this.params.grid.rows);
      } else if (this.params.grid.fill === "row") {
        index = index % Math.ceil(this.slides.length / this.params.grid.rows);
      }
    }
    return index;
  }
  recalcSlides() {
    const swiper = this;
    const {
      slidesEl,
      params
    } = swiper;
    swiper.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
  }
  enable() {
    const swiper = this;
    if (swiper.enabled) return;
    swiper.enabled = true;
    if (swiper.params.grabCursor) {
      swiper.setGrabCursor();
    }
    swiper.emit("enable");
  }
  disable() {
    const swiper = this;
    if (!swiper.enabled) return;
    swiper.enabled = false;
    if (swiper.params.grabCursor) {
      swiper.unsetGrabCursor();
    }
    swiper.emit("disable");
  }
  setProgress(progress, speed) {
    const swiper = this;
    progress = Math.min(Math.max(progress, 0), 1);
    const min = swiper.minTranslate();
    const max = swiper.maxTranslate();
    const current = (max - min) * progress + min;
    swiper.translateTo(current, typeof speed === "undefined" ? 0 : speed);
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  emitContainerClasses() {
    const swiper = this;
    if (!swiper.params._emitClasses || !swiper.el) return;
    const cls = swiper.el.className.split(" ").filter((className) => {
      return className.indexOf("swiper") === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
    });
    swiper.emit("_containerClasses", cls.join(" "));
  }
  getSlideClasses(slideEl) {
    const swiper = this;
    if (swiper.destroyed) return "";
    return slideEl.className.split(" ").filter((className) => {
      return className.indexOf("swiper-slide") === 0 || className.indexOf(swiper.params.slideClass) === 0;
    }).join(" ");
  }
  emitSlidesClasses() {
    const swiper = this;
    if (!swiper.params._emitClasses || !swiper.el) return;
    const updates = [];
    swiper.slides.forEach((slideEl) => {
      const classNames = swiper.getSlideClasses(slideEl);
      updates.push({
        slideEl,
        classNames
      });
      swiper.emit("_slideClass", slideEl, classNames);
    });
    swiper.emit("_slideClasses", updates);
  }
  slidesPerViewDynamic(view = "current", exact = false) {
    const swiper = this;
    const {
      params,
      slides,
      slidesGrid,
      slidesSizesGrid,
      size: swiperSize,
      activeIndex
    } = swiper;
    let spv = 1;
    if (typeof params.slidesPerView === "number") return params.slidesPerView;
    if (params.centeredSlides) {
      let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
      let breakLoop;
      for (let i = activeIndex + 1; i < slides.length; i += 1) {
        if (slides[i] && !breakLoop) {
          slideSize += Math.ceil(slides[i].swiperSlideSize);
          spv += 1;
          if (slideSize > swiperSize) breakLoop = true;
        }
      }
      for (let i = activeIndex - 1; i >= 0; i -= 1) {
        if (slides[i] && !breakLoop) {
          slideSize += slides[i].swiperSlideSize;
          spv += 1;
          if (slideSize > swiperSize) breakLoop = true;
        }
      }
    } else {
      if (view === "current") {
        for (let i = activeIndex + 1; i < slides.length; i += 1) {
          const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      } else {
        for (let i = activeIndex - 1; i >= 0; i -= 1) {
          const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      }
    }
    return spv;
  }
  update() {
    const swiper = this;
    if (!swiper || swiper.destroyed) return;
    const {
      snapGrid,
      params
    } = swiper;
    if (params.breakpoints) {
      swiper.setBreakpoint();
    }
    [...swiper.el.querySelectorAll('[loading="lazy"]')].forEach((imageEl) => {
      if (imageEl.complete) {
        processLazyPreloader(swiper, imageEl);
      }
    });
    swiper.updateSize();
    swiper.updateSlides();
    swiper.updateProgress();
    swiper.updateSlidesClasses();
    function setTranslate2() {
      const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
      const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
      swiper.setTranslate(newTranslate);
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
    let translated;
    if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
      setTranslate2();
      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }
    } else {
      if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
        const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
        translated = swiper.slideTo(slides.length - 1, 0, false, true);
      } else {
        translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
      }
      if (!translated) {
        setTranslate2();
      }
    }
    if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
      swiper.checkOverflow();
    }
    swiper.emit("update");
  }
  changeDirection(newDirection, needUpdate = true) {
    const swiper = this;
    const currentDirection = swiper.params.direction;
    if (!newDirection) {
      newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
    }
    if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") {
      return swiper;
    }
    swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
    swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
    swiper.emitContainerClasses();
    swiper.params.direction = newDirection;
    swiper.slides.forEach((slideEl) => {
      if (newDirection === "vertical") {
        slideEl.style.width = "";
      } else {
        slideEl.style.height = "";
      }
    });
    swiper.emit("changeDirection");
    if (needUpdate) swiper.update();
    return swiper;
  }
  changeLanguageDirection(direction) {
    const swiper = this;
    if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr") return;
    swiper.rtl = direction === "rtl";
    swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
    if (swiper.rtl) {
      swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
      swiper.el.dir = "rtl";
    } else {
      swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
      swiper.el.dir = "ltr";
    }
    swiper.update();
  }
  mount(element) {
    const swiper = this;
    if (swiper.mounted) return true;
    let el = element || swiper.params.el;
    if (typeof el === "string") {
      el = document.querySelector(el);
    }
    if (!el) {
      return false;
    }
    el.swiper = swiper;
    if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) {
      swiper.isElement = true;
    }
    const getWrapperSelector = () => {
      return `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
    };
    const getWrapper = () => {
      if (el && el.shadowRoot && el.shadowRoot.querySelector) {
        const res = el.shadowRoot.querySelector(getWrapperSelector());
        return res;
      }
      return elementChildren(el, getWrapperSelector())[0];
    };
    let wrapperEl = getWrapper();
    if (!wrapperEl && swiper.params.createElements) {
      wrapperEl = createElement("div", swiper.params.wrapperClass);
      el.append(wrapperEl);
      elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl) => {
        wrapperEl.append(slideEl);
      });
    }
    Object.assign(swiper, {
      el,
      wrapperEl,
      slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
      hostEl: swiper.isElement ? el.parentNode.host : el,
      mounted: true,
      // RTL
      rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
      rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
      wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
    });
    return true;
  }
  init(el) {
    const swiper = this;
    if (swiper.initialized) return swiper;
    const mounted = swiper.mount(el);
    if (mounted === false) return swiper;
    swiper.emit("beforeInit");
    if (swiper.params.breakpoints) {
      swiper.setBreakpoint();
    }
    swiper.addClasses();
    swiper.updateSize();
    swiper.updateSlides();
    if (swiper.params.watchOverflow) {
      swiper.checkOverflow();
    }
    if (swiper.params.grabCursor && swiper.enabled) {
      swiper.setGrabCursor();
    }
    if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
      swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true);
    } else {
      swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
    }
    if (swiper.params.loop) {
      swiper.loopCreate(void 0, true);
    }
    swiper.attachEvents();
    const lazyElements = [...swiper.el.querySelectorAll('[loading="lazy"]')];
    if (swiper.isElement) {
      lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
    }
    lazyElements.forEach((imageEl) => {
      if (imageEl.complete) {
        processLazyPreloader(swiper, imageEl);
      } else {
        imageEl.addEventListener("load", (e) => {
          processLazyPreloader(swiper, e.target);
        });
      }
    });
    preload(swiper);
    swiper.initialized = true;
    preload(swiper);
    swiper.emit("init");
    swiper.emit("afterInit");
    return swiper;
  }
  destroy(deleteInstance = true, cleanStyles = true) {
    const swiper = this;
    const {
      params,
      el,
      wrapperEl,
      slides
    } = swiper;
    if (typeof swiper.params === "undefined" || swiper.destroyed) {
      return null;
    }
    swiper.emit("beforeDestroy");
    swiper.initialized = false;
    swiper.detachEvents();
    if (params.loop) {
      swiper.loopDestroy();
    }
    if (cleanStyles) {
      swiper.removeClasses();
      if (el && typeof el !== "string") {
        el.removeAttribute("style");
      }
      if (wrapperEl) {
        wrapperEl.removeAttribute("style");
      }
      if (slides && slides.length) {
        slides.forEach((slideEl) => {
          slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
          slideEl.removeAttribute("style");
          slideEl.removeAttribute("data-swiper-slide-index");
        });
      }
    }
    swiper.emit("destroy");
    Object.keys(swiper.eventsListeners).forEach((eventName) => {
      swiper.off(eventName);
    });
    if (deleteInstance !== false) {
      if (swiper.el && typeof swiper.el !== "string") {
        swiper.el.swiper = null;
      }
      deleteProps(swiper);
    }
    swiper.destroyed = true;
    return null;
  }
  static extendDefaults(newDefaults) {
    extend(extendedDefaults, newDefaults);
  }
  static get extendedDefaults() {
    return extendedDefaults;
  }
  static get defaults() {
    return defaults;
  }
  static installModule(mod) {
    if (!Swiper.prototype.__modules__) Swiper.prototype.__modules__ = [];
    const modules = Swiper.prototype.__modules__;
    if (typeof mod === "function" && modules.indexOf(mod) < 0) {
      modules.push(mod);
    }
  }
  static use(module) {
    if (Array.isArray(module)) {
      module.forEach((m) => Swiper.installModule(m));
      return Swiper;
    }
    Swiper.installModule(module);
    return Swiper;
  }
}
Object.keys(prototypes).forEach((prototypeGroup) => {
  Object.keys(prototypes[prototypeGroup]).forEach((protoMethod) => {
    Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
  });
});
Swiper.use([Resize, Observer]);
function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
  if (swiper.params.createElements) {
    Object.keys(checkProps).forEach((key) => {
      if (!params[key] && params.auto === true) {
        let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
        if (!element) {
          element = createElement("div", checkProps[key]);
          element.className = checkProps[key];
          swiper.el.append(element);
        }
        params[key] = element;
        originalParams[key] = element;
      }
    });
  }
  return params;
}
const arrowSvg = `<svg class="swiper-navigation-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"/></svg>`;
function Navigation({
  swiper,
  extendParams,
  on,
  emit
}) {
  extendParams({
    navigation: {
      nextEl: null,
      prevEl: null,
      addIcons: true,
      hideOnClick: false,
      disabledClass: "swiper-button-disabled",
      hiddenClass: "swiper-button-hidden",
      lockClass: "swiper-button-lock",
      navigationDisabledClass: "swiper-navigation-disabled"
    }
  });
  swiper.navigation = {
    nextEl: null,
    prevEl: null,
    arrowSvg
  };
  function getEl(el) {
    let res;
    if (el && typeof el === "string" && swiper.isElement) {
      res = swiper.el.querySelector(el) || swiper.hostEl.querySelector(el);
      if (res) return res;
    }
    if (el) {
      if (typeof el === "string") res = [...document.querySelectorAll(el)];
      if (swiper.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) {
        res = swiper.el.querySelector(el);
      } else if (res && res.length === 1) {
        res = res[0];
      }
    }
    if (el && !res) return el;
    return res;
  }
  function toggleEl(el, disabled) {
    const params = swiper.params.navigation;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      if (subEl) {
        subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
        if (subEl.tagName === "BUTTON") subEl.disabled = disabled;
        if (swiper.params.watchOverflow && swiper.enabled) {
          subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
        }
      }
    });
  }
  function update2() {
    const {
      nextEl,
      prevEl
    } = swiper.navigation;
    if (swiper.params.loop) {
      toggleEl(prevEl, false);
      toggleEl(nextEl, false);
      return;
    }
    toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
    toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
  }
  function onPrevClick(e) {
    e.preventDefault();
    if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
    swiper.slidePrev();
    emit("navigationPrev");
  }
  function onNextClick(e) {
    e.preventDefault();
    if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
    swiper.slideNext();
    emit("navigationNext");
  }
  function init() {
    const params = swiper.params.navigation;
    swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
      nextEl: "swiper-button-next",
      prevEl: "swiper-button-prev"
    });
    if (!(params.nextEl || params.prevEl)) return;
    let nextEl = getEl(params.nextEl);
    let prevEl = getEl(params.prevEl);
    Object.assign(swiper.navigation, {
      nextEl,
      prevEl
    });
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const initButton = (el, dir) => {
      if (el) {
        if (params.addIcons && el.matches(".swiper-button-next,.swiper-button-prev") && !el.querySelector("svg")) {
          const tempEl = document.createElement("div");
          setInnerHTML(tempEl, arrowSvg);
          el.appendChild(tempEl.querySelector("svg"));
          tempEl.remove();
        }
        el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      }
      if (!swiper.enabled && el) {
        el.classList.add(...params.lockClass.split(" "));
      }
    };
    nextEl.forEach((el) => initButton(el, "next"));
    prevEl.forEach((el) => initButton(el, "prev"));
  }
  function destroy() {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const destroyButton = (el, dir) => {
      el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      el.classList.remove(...swiper.params.navigation.disabledClass.split(" "));
    };
    nextEl.forEach((el) => destroyButton(el, "next"));
    prevEl.forEach((el) => destroyButton(el, "prev"));
  }
  on("init", () => {
    if (swiper.params.navigation.enabled === false) {
      disable();
    } else {
      init();
      update2();
    }
  });
  on("toEdge fromEdge lock unlock", () => {
    update2();
  });
  on("destroy", () => {
    destroy();
  });
  on("enable disable", () => {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    if (swiper.enabled) {
      update2();
      return;
    }
    [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.add(swiper.params.navigation.lockClass));
  });
  on("click", (_s, e) => {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const targetEl = e.target;
    let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
    if (swiper.isElement && !targetIsButton) {
      const path = e.path || e.composedPath && e.composedPath();
      if (path) {
        targetIsButton = path.find((pathEl) => nextEl.includes(pathEl) || prevEl.includes(pathEl));
      }
    }
    if (swiper.params.navigation.hideOnClick && !targetIsButton) {
      if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
      let isHidden;
      if (nextEl.length) {
        isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass);
      } else if (prevEl.length) {
        isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
      }
      if (isHidden === true) {
        emit("navigationShow");
      } else {
        emit("navigationHide");
      }
      [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.toggle(swiper.params.navigation.hiddenClass));
    }
  });
  const enable = () => {
    swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(" "));
    init();
    update2();
  };
  const disable = () => {
    swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(" "));
    destroy();
  };
  Object.assign(swiper.navigation, {
    enable,
    disable,
    update: update2,
    init,
    destroy
  });
}
function classesToSelector(classes2 = "") {
  return `.${classes2.trim().replace(/([\.:!+\/()[\]#>~*^$|=,'"@{}\\])/g, "\\$1").replace(/ /g, ".")}`;
}
function Pagination({
  swiper,
  extendParams,
  on,
  emit
}) {
  const pfx = "swiper-pagination";
  extendParams({
    pagination: {
      el: null,
      bulletElement: "span",
      clickable: false,
      hideOnClick: false,
      renderBullet: null,
      renderProgressbar: null,
      renderFraction: null,
      renderCustom: null,
      progressbarOpposite: false,
      type: "bullets",
      // 'bullets' or 'progressbar' or 'fraction' or 'custom'
      dynamicBullets: false,
      dynamicMainBullets: 1,
      formatFractionCurrent: (number) => number,
      formatFractionTotal: (number) => number,
      bulletClass: `${pfx}-bullet`,
      bulletActiveClass: `${pfx}-bullet-active`,
      modifierClass: `${pfx}-`,
      currentClass: `${pfx}-current`,
      totalClass: `${pfx}-total`,
      hiddenClass: `${pfx}-hidden`,
      progressbarFillClass: `${pfx}-progressbar-fill`,
      progressbarOppositeClass: `${pfx}-progressbar-opposite`,
      clickableClass: `${pfx}-clickable`,
      lockClass: `${pfx}-lock`,
      horizontalClass: `${pfx}-horizontal`,
      verticalClass: `${pfx}-vertical`,
      paginationDisabledClass: `${pfx}-disabled`
    }
  });
  swiper.pagination = {
    el: null,
    bullets: []
  };
  let bulletSize;
  let dynamicBulletIndex = 0;
  function isPaginationDisabled() {
    return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
  }
  function setSideBullets(bulletEl, position) {
    const {
      bulletActiveClass
    } = swiper.params.pagination;
    if (!bulletEl) return;
    bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
    if (bulletEl) {
      bulletEl.classList.add(`${bulletActiveClass}-${position}`);
      bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
      if (bulletEl) {
        bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
      }
    }
  }
  function getMoveDirection(prevIndex, nextIndex, length) {
    prevIndex = prevIndex % length;
    nextIndex = nextIndex % length;
    if (nextIndex === prevIndex + 1) {
      return "next";
    } else if (nextIndex === prevIndex - 1) {
      return "previous";
    }
    return;
  }
  function onBulletClick(e) {
    const bulletEl = e.target.closest(classesToSelector(swiper.params.pagination.bulletClass));
    if (!bulletEl) {
      return;
    }
    e.preventDefault();
    const index = elementIndex(bulletEl) * swiper.params.slidesPerGroup;
    if (swiper.params.loop) {
      if (swiper.realIndex === index) return;
      const moveDirection = getMoveDirection(swiper.realIndex, index, swiper.slides.length);
      if (moveDirection === "next") {
        swiper.slideNext();
      } else if (moveDirection === "previous") {
        swiper.slidePrev();
      } else {
        swiper.slideToLoop(index);
      }
    } else {
      swiper.slideTo(index);
    }
  }
  function update2() {
    const rtl = swiper.rtl;
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    let el = swiper.pagination.el;
    el = makeElementsArray(el);
    let current;
    let previousIndex;
    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
    const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
    if (swiper.params.loop) {
      previousIndex = swiper.previousRealIndex || 0;
      current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
    } else if (typeof swiper.snapIndex !== "undefined") {
      current = swiper.snapIndex;
      previousIndex = swiper.previousSnapIndex;
    } else {
      previousIndex = swiper.previousIndex || 0;
      current = swiper.activeIndex || 0;
    }
    if (params.type === "bullets" && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
      const bullets = swiper.pagination.bullets;
      let firstIndex;
      let lastIndex;
      let midIndex;
      if (params.dynamicBullets) {
        bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? "width" : "height");
        el.forEach((subEl) => {
          subEl.style[swiper.isHorizontal() ? "width" : "height"] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
        });
        if (params.dynamicMainBullets > 1 && previousIndex !== void 0) {
          dynamicBulletIndex += current - (previousIndex || 0);
          if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
            dynamicBulletIndex = params.dynamicMainBullets - 1;
          } else if (dynamicBulletIndex < 0) {
            dynamicBulletIndex = 0;
          }
        }
        firstIndex = Math.max(current - dynamicBulletIndex, 0);
        lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
        midIndex = (lastIndex + firstIndex) / 2;
      }
      bullets.forEach((bulletEl) => {
        const classesToRemove = [...["", "-next", "-next-next", "-prev", "-prev-prev", "-main"].map((suffix) => `${params.bulletActiveClass}${suffix}`)].map((s) => typeof s === "string" && s.includes(" ") ? s.split(" ") : s).flat();
        bulletEl.classList.remove(...classesToRemove);
      });
      if (el.length > 1) {
        bullets.forEach((bullet) => {
          const bulletIndex = elementIndex(bullet);
          if (bulletIndex === current) {
            bullet.classList.add(...params.bulletActiveClass.split(" "));
          } else if (swiper.isElement) {
            bullet.setAttribute("part", "bullet");
          }
          if (params.dynamicBullets) {
            if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
              bullet.classList.add(...`${params.bulletActiveClass}-main`.split(" "));
            }
            if (bulletIndex === firstIndex) {
              setSideBullets(bullet, "prev");
            }
            if (bulletIndex === lastIndex) {
              setSideBullets(bullet, "next");
            }
          }
        });
      } else {
        const bullet = bullets[current];
        if (bullet) {
          bullet.classList.add(...params.bulletActiveClass.split(" "));
        }
        if (swiper.isElement) {
          bullets.forEach((bulletEl, bulletIndex) => {
            bulletEl.setAttribute("part", bulletIndex === current ? "bullet-active" : "bullet");
          });
        }
        if (params.dynamicBullets) {
          const firstDisplayedBullet = bullets[firstIndex];
          const lastDisplayedBullet = bullets[lastIndex];
          for (let i = firstIndex; i <= lastIndex; i += 1) {
            if (bullets[i]) {
              bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(" "));
            }
          }
          setSideBullets(firstDisplayedBullet, "prev");
          setSideBullets(lastDisplayedBullet, "next");
        }
      }
      if (params.dynamicBullets) {
        const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
        const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
        const offsetProp = rtl ? "right" : "left";
        bullets.forEach((bullet) => {
          bullet.style[swiper.isHorizontal() ? offsetProp : "top"] = `${bulletsOffset}px`;
        });
      }
    }
    el.forEach((subEl, subElIndex) => {
      if (params.type === "fraction") {
        subEl.querySelectorAll(classesToSelector(params.currentClass)).forEach((fractionEl) => {
          fractionEl.textContent = params.formatFractionCurrent(current + 1);
        });
        subEl.querySelectorAll(classesToSelector(params.totalClass)).forEach((totalEl) => {
          totalEl.textContent = params.formatFractionTotal(total);
        });
      }
      if (params.type === "progressbar") {
        let progressbarDirection;
        if (params.progressbarOpposite) {
          progressbarDirection = swiper.isHorizontal() ? "vertical" : "horizontal";
        } else {
          progressbarDirection = swiper.isHorizontal() ? "horizontal" : "vertical";
        }
        const scale = (current + 1) / total;
        let scaleX = 1;
        let scaleY = 1;
        if (progressbarDirection === "horizontal") {
          scaleX = scale;
        } else {
          scaleY = scale;
        }
        subEl.querySelectorAll(classesToSelector(params.progressbarFillClass)).forEach((progressEl) => {
          progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
          progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
        });
      }
      if (params.type === "custom" && params.renderCustom) {
        setInnerHTML(subEl, params.renderCustom(swiper, current + 1, total));
        if (subElIndex === 0) emit("paginationRender", subEl);
      } else {
        if (subElIndex === 0) emit("paginationRender", subEl);
        emit("paginationUpdate", subEl);
      }
      if (swiper.params.watchOverflow && swiper.enabled) {
        subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
      }
    });
  }
  function render() {
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.grid && swiper.params.grid.rows > 1 ? swiper.slides.length / Math.ceil(swiper.params.grid.rows) : swiper.slides.length;
    let el = swiper.pagination.el;
    el = makeElementsArray(el);
    let paginationHTML = "";
    if (params.type === "bullets") {
      let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
      if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) {
        numberOfBullets = slidesLength;
      }
      for (let i = 0; i < numberOfBullets; i += 1) {
        if (params.renderBullet) {
          paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
        } else {
          paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ""} class="${params.bulletClass}"></${params.bulletElement}>`;
        }
      }
    }
    if (params.type === "fraction") {
      if (params.renderFraction) {
        paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
      } else {
        paginationHTML = `<span class="${params.currentClass}"></span> / <span class="${params.totalClass}"></span>`;
      }
    }
    if (params.type === "progressbar") {
      if (params.renderProgressbar) {
        paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
      } else {
        paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
      }
    }
    swiper.pagination.bullets = [];
    el.forEach((subEl) => {
      if (params.type !== "custom") {
        setInnerHTML(subEl, paginationHTML || "");
      }
      if (params.type === "bullets") {
        swiper.pagination.bullets.push(...subEl.querySelectorAll(classesToSelector(params.bulletClass)));
      }
    });
    if (params.type !== "custom") {
      emit("paginationRender", el[0]);
    }
  }
  function init() {
    swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
      el: "swiper-pagination"
    });
    const params = swiper.params.pagination;
    if (!params.el) return;
    let el;
    if (typeof params.el === "string" && swiper.isElement) {
      el = swiper.el.querySelector(params.el);
    }
    if (!el && typeof params.el === "string") {
      el = [...document.querySelectorAll(params.el)];
    }
    if (!el) {
      el = params.el;
    }
    if (!el || el.length === 0) return;
    if (swiper.params.uniqueNavElements && typeof params.el === "string" && Array.isArray(el) && el.length > 1) {
      el = [...swiper.el.querySelectorAll(params.el)];
      if (el.length > 1) {
        el = el.find((subEl) => {
          if (elementParents(subEl, ".swiper")[0] !== swiper.el) return false;
          return true;
        });
      }
    }
    if (Array.isArray(el) && el.length === 1) el = el[0];
    Object.assign(swiper.pagination, {
      el
    });
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      if (params.type === "bullets" && params.clickable) {
        subEl.classList.add(...(params.clickableClass || "").split(" "));
      }
      subEl.classList.add(params.modifierClass + params.type);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
      if (params.type === "bullets" && params.dynamicBullets) {
        subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
        dynamicBulletIndex = 0;
        if (params.dynamicMainBullets < 1) {
          params.dynamicMainBullets = 1;
        }
      }
      if (params.type === "progressbar" && params.progressbarOpposite) {
        subEl.classList.add(params.progressbarOppositeClass);
      }
      if (params.clickable) {
        subEl.addEventListener("click", onBulletClick);
      }
      if (!swiper.enabled) {
        subEl.classList.add(params.lockClass);
      }
    });
  }
  function destroy() {
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    let el = swiper.pagination.el;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => {
        subEl.classList.remove(params.hiddenClass);
        subEl.classList.remove(params.modifierClass + params.type);
        subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        if (params.clickable) {
          subEl.classList.remove(...(params.clickableClass || "").split(" "));
          subEl.removeEventListener("click", onBulletClick);
        }
      });
    }
    if (swiper.pagination.bullets) swiper.pagination.bullets.forEach((subEl) => subEl.classList.remove(...params.bulletActiveClass.split(" ")));
  }
  on("changeDirection", () => {
    if (!swiper.pagination || !swiper.pagination.el) return;
    const params = swiper.params.pagination;
    let {
      el
    } = swiper.pagination;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      subEl.classList.remove(params.horizontalClass, params.verticalClass);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
    });
  });
  on("init", () => {
    if (swiper.params.pagination.enabled === false) {
      disable();
    } else {
      init();
      render();
      update2();
    }
  });
  on("activeIndexChange", () => {
    if (typeof swiper.snapIndex === "undefined") {
      update2();
    }
  });
  on("snapIndexChange", () => {
    update2();
  });
  on("snapGridLengthChange", () => {
    render();
    update2();
  });
  on("destroy", () => {
    destroy();
  });
  on("enable disable", () => {
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList[swiper.enabled ? "remove" : "add"](swiper.params.pagination.lockClass));
    }
  });
  on("lock unlock", () => {
    update2();
  });
  on("click", (_s, e) => {
    const targetEl = e.target;
    const el = makeElementsArray(swiper.pagination.el);
    if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
      if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
      const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
      if (isHidden === true) {
        emit("paginationShow");
      } else {
        emit("paginationHide");
      }
      el.forEach((subEl) => subEl.classList.toggle(swiper.params.pagination.hiddenClass));
    }
  });
  const enable = () => {
    swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass));
    }
    init();
    render();
    update2();
  };
  const disable = () => {
    swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList.add(swiper.params.pagination.paginationDisabledClass));
    }
    destroy();
  };
  Object.assign(swiper.pagination, {
    enable,
    disable,
    render,
    update: update2,
    init,
    destroy
  });
}
function Autoplay({
  swiper,
  extendParams,
  on,
  emit,
  params
}) {
  swiper.autoplay = {
    running: false,
    paused: false,
    timeLeft: 0
  };
  extendParams({
    autoplay: {
      enabled: false,
      delay: 3e3,
      waitForTransition: true,
      disableOnInteraction: false,
      stopOnLastSlide: false,
      reverseDirection: false,
      pauseOnMouseEnter: false
    }
  });
  let timeout;
  let raf;
  let autoplayDelayTotal = params && params.autoplay ? params.autoplay.delay : 3e3;
  let autoplayDelayCurrent = params && params.autoplay ? params.autoplay.delay : 3e3;
  let autoplayTimeLeft;
  let autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
  let wasPaused;
  let isTouched;
  let pausedByTouch;
  let touchStartTimeout;
  let pausedByInteraction;
  let pausedByPointerEnter;
  function onTransitionEnd(e) {
    if (!swiper || swiper.destroyed || !swiper.wrapperEl) return;
    if (e.target !== swiper.wrapperEl) return;
    swiper.wrapperEl.removeEventListener("transitionend", onTransitionEnd);
    if (pausedByPointerEnter || e.detail && e.detail.bySwiperTouchMove) {
      return;
    }
    resume();
  }
  const calcTimeLeft = () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    if (swiper.autoplay.paused) {
      wasPaused = true;
    } else if (wasPaused) {
      autoplayDelayCurrent = autoplayTimeLeft;
      wasPaused = false;
    }
    const timeLeft = swiper.autoplay.paused ? autoplayTimeLeft : autoplayStartTime + autoplayDelayCurrent - (/* @__PURE__ */ new Date()).getTime();
    swiper.autoplay.timeLeft = timeLeft;
    emit("autoplayTimeLeft", timeLeft, timeLeft / autoplayDelayTotal);
    raf = requestAnimationFrame(() => {
      calcTimeLeft();
    });
  };
  const getSlideDelay = () => {
    let activeSlideEl;
    if (swiper.virtual && swiper.params.virtual.enabled) {
      activeSlideEl = swiper.slides.find((slideEl) => slideEl.classList.contains("swiper-slide-active"));
    } else {
      activeSlideEl = swiper.slides[swiper.activeIndex];
    }
    if (!activeSlideEl) return void 0;
    const currentSlideDelay = parseInt(activeSlideEl.getAttribute("data-swiper-autoplay"), 10);
    return currentSlideDelay;
  };
  const getTotalDelay = () => {
    let totalDelay = swiper.params.autoplay.delay;
    const currentSlideDelay = getSlideDelay();
    if (!Number.isNaN(currentSlideDelay) && currentSlideDelay > 0) {
      totalDelay = currentSlideDelay;
    }
    return totalDelay;
  };
  const run = (delayForce) => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    cancelAnimationFrame(raf);
    calcTimeLeft();
    let delay2 = delayForce;
    if (typeof delay2 === "undefined") {
      delay2 = getTotalDelay();
      autoplayDelayTotal = delay2;
      autoplayDelayCurrent = delay2;
    }
    autoplayTimeLeft = delay2;
    const speed = swiper.params.speed;
    const proceed = () => {
      if (!swiper || swiper.destroyed) return;
      if (swiper.params.autoplay.reverseDirection) {
        if (!swiper.isBeginning || swiper.params.loop || swiper.params.rewind) {
          swiper.slidePrev(speed, true, true);
          emit("autoplay");
        } else if (!swiper.params.autoplay.stopOnLastSlide) {
          swiper.slideTo(swiper.slides.length - 1, speed, true, true);
          emit("autoplay");
        }
      } else {
        if (!swiper.isEnd || swiper.params.loop || swiper.params.rewind) {
          swiper.slideNext(speed, true, true);
          emit("autoplay");
        } else if (!swiper.params.autoplay.stopOnLastSlide) {
          swiper.slideTo(0, speed, true, true);
          emit("autoplay");
        }
      }
      if (swiper.params.cssMode) {
        autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
        requestAnimationFrame(() => {
          run();
        });
      }
    };
    if (delay2 > 0) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        proceed();
      }, delay2);
    } else {
      requestAnimationFrame(() => {
        proceed();
      });
    }
    return delay2;
  };
  const start = () => {
    autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
    swiper.autoplay.running = true;
    run();
    emit("autoplayStart");
  };
  const stop = () => {
    swiper.autoplay.running = false;
    clearTimeout(timeout);
    cancelAnimationFrame(raf);
    emit("autoplayStop");
  };
  const pause = (internal, reset) => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    clearTimeout(timeout);
    if (!internal) {
      pausedByInteraction = true;
    }
    const proceed = () => {
      emit("autoplayPause");
      if (swiper.params.autoplay.waitForTransition) {
        swiper.wrapperEl.addEventListener("transitionend", onTransitionEnd);
      } else {
        resume();
      }
    };
    swiper.autoplay.paused = true;
    if (reset) {
      proceed();
      return;
    }
    const delay2 = autoplayTimeLeft || swiper.params.autoplay.delay;
    autoplayTimeLeft = delay2 - ((/* @__PURE__ */ new Date()).getTime() - autoplayStartTime);
    if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop) return;
    if (autoplayTimeLeft < 0) autoplayTimeLeft = 0;
    proceed();
  };
  const resume = () => {
    if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop || swiper.destroyed || !swiper.autoplay.running) return;
    autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
    if (pausedByInteraction) {
      pausedByInteraction = false;
      run(autoplayTimeLeft);
    } else {
      run();
    }
    swiper.autoplay.paused = false;
    emit("autoplayResume");
  };
  const onVisibilityChange = () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    const document2 = getDocument();
    if (document2.visibilityState === "hidden") {
      pausedByInteraction = true;
      pause(true);
    }
    if (document2.visibilityState === "visible") {
      resume();
    }
  };
  const onPointerEnter = (e) => {
    if (e.pointerType !== "mouse") return;
    pausedByInteraction = true;
    pausedByPointerEnter = true;
    if (swiper.animating || swiper.autoplay.paused) return;
    pause(true);
  };
  const onPointerLeave = (e) => {
    if (e.pointerType !== "mouse") return;
    pausedByPointerEnter = false;
    if (swiper.autoplay.paused) {
      resume();
    }
  };
  const attachMouseEvents = () => {
    if (swiper.params.autoplay.pauseOnMouseEnter) {
      swiper.el.addEventListener("pointerenter", onPointerEnter);
      swiper.el.addEventListener("pointerleave", onPointerLeave);
    }
  };
  const detachMouseEvents = () => {
    if (swiper.el && typeof swiper.el !== "string") {
      swiper.el.removeEventListener("pointerenter", onPointerEnter);
      swiper.el.removeEventListener("pointerleave", onPointerLeave);
    }
  };
  const attachDocumentEvents = () => {
    const document2 = getDocument();
    document2.addEventListener("visibilitychange", onVisibilityChange);
  };
  const detachDocumentEvents = () => {
    const document2 = getDocument();
    document2.removeEventListener("visibilitychange", onVisibilityChange);
  };
  on("init", () => {
    if (swiper.params.autoplay.enabled) {
      attachMouseEvents();
      attachDocumentEvents();
      start();
    }
  });
  on("destroy", () => {
    detachMouseEvents();
    detachDocumentEvents();
    if (swiper.autoplay.running) {
      stop();
    }
  });
  on("_freeModeStaticRelease", () => {
    if (pausedByTouch || pausedByInteraction) {
      resume();
    }
  });
  on("_freeModeNoMomentumRelease", () => {
    if (!swiper.params.autoplay.disableOnInteraction) {
      pause(true, true);
    } else {
      stop();
    }
  });
  on("beforeTransitionStart", (_s, speed, internal) => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    if (internal || !swiper.params.autoplay.disableOnInteraction) {
      pause(true, true);
    } else {
      stop();
    }
  });
  on("sliderFirstMove", () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    if (swiper.params.autoplay.disableOnInteraction) {
      stop();
      return;
    }
    isTouched = true;
    pausedByTouch = false;
    pausedByInteraction = false;
    touchStartTimeout = setTimeout(() => {
      pausedByInteraction = true;
      pausedByTouch = true;
      pause(true);
    }, 200);
  });
  on("touchEnd", () => {
    if (swiper.destroyed || !swiper.autoplay.running || !isTouched) return;
    clearTimeout(touchStartTimeout);
    clearTimeout(timeout);
    if (swiper.params.autoplay.disableOnInteraction) {
      pausedByTouch = false;
      isTouched = false;
      return;
    }
    if (pausedByTouch && swiper.params.cssMode) resume();
    pausedByTouch = false;
    isTouched = false;
  });
  on("slideChange", () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    if (swiper.autoplay.paused) {
      autoplayTimeLeft = getTotalDelay();
      autoplayDelayTotal = getTotalDelay();
    }
  });
  Object.assign(swiper.autoplay, {
    start,
    stop,
    pause,
    resume
  });
}
let slidersBlocksArray = [];
const sliderBlockOptions = (mediaSlider = false) => {
  const breakpointsOptions = {};
  if (mediaSlider) {
    breakpointsOptions.breakpoints = {
      768: {
        slidesPerView: 3
      },
      580: {
        slidesPerView: 2
      },
      480: {
        slidesPerView: 1.5
      }
    };
  } else {
    breakpointsOptions.breakpoints = {
      992: {
        slidesPerView: 4
      },
      580: {
        slidesPerView: 3
      },
      380: {
        slidesPerView: 2
      }
    };
  }
  return {
    modules: [Pagination],
    observer: true,
    observeParents: true,
    slidesPerView: 1.2,
    spaceBetween: 20,
    autoHeight: false,
    speed: 800,
    loop: false,
    init: false,
    // Пагінація
    pagination: {
      el: ".slider-block__pagination",
      dynamicBullets: true,
      clickable: true
    },
    ...breakpointsOptions,
    // Події
    on: {
      init: async (swiper) => {
        if (swiper.slides.length <= swiper.params.slidesPerView) {
          swiper.pagination.el.style.display = "none";
        }
        await syncCartFromStorage(swiper.el);
      },
      update: async (swiper) => {
        await syncCartFromStorage(swiper.el);
      },
      resize: (swiper) => {
        if (swiper.slides.length <= swiper.params.slidesPerView) {
          swiper.pagination.el.style.display = "none";
        } else {
          swiper.pagination.el.style.display = "";
        }
      },
      slideChange: (swiper) => {
      },
      slideChangeTransitionStart: (swiper) => {
        swiper.pagination?.el?.classList.add("is-animating");
      },
      slideNextTransitionEnd: (swiper) => {
        swiper.pagination?.el?.classList.remove("is-animating");
      }
    }
  };
};
const mediaSliderInit = (slidersArray, matchMedia = false) => {
  slidersArray.forEach((slider) => {
    const sliderItem = slider.item;
    if (matchMedia.matches || !matchMedia) {
      if (!sliderItem.swiper) {
        slidersBlocksArray.push(new Swiper(sliderItem, { ...sliderBlockOptions(true), init: true, el: sliderItem }));
      }
    } else {
      if (sliderItem.swiper) {
        sliderItem.swiper.destroy(true, true);
        sliderItem.swiper = null;
      }
    }
  });
};
const initSliders$1 = () => {
  const heroSlider = document.querySelector(".slider-hero");
  const reviewSlider = document.querySelector(".slider-reviews");
  const blockSliders = document.querySelectorAll("[data-slider-block]");
  if (heroSlider) {
    new Swiper(".slider-hero", {
      modules: [Navigation, Autoplay],
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      spaceBetween: 0,
      autoHeight: false,
      speed: 800,
      loop: false,
      autoplay: {
        delay: 3e3,
        disableOnInteraction: true
      },
      // Кнопки "вліво/вправо"
      navigation: {
        prevEl: ".hero__button--prev",
        nextEl: ".hero__button--next"
      },
      // Події
      on: {
        slideChange: (swiper) => {
        }
      }
    });
  }
  if (reviewSlider) {
    new Swiper(".slider-reviews", {
      modules: [Navigation, Pagination],
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      spaceBetween: 20,
      autoHeight: false,
      speed: 800,
      loop: false,
      // Кнопки "вліво/вправо"
      navigation: {
        prevEl: ".reviews__button--prev",
        nextEl: ".reviews__button--next"
      },
      // Пагінація
      pagination: {
        el: ".reviews__pagination",
        dynamicBullets: true,
        clickable: true
      },
      // Події
      on: {
        slideChange: (swiper) => {
        }
      }
    });
  }
  if (blockSliders.length) {
    const notMediaSliderBlocks = [];
    const mediaSliderBlocks = [];
    blockSliders.forEach((block) => {
      block.hasAttribute("data-slider-media") ? mediaSliderBlocks.push(block) : notMediaSliderBlocks.push(block);
    });
    if (notMediaSliderBlocks.length) {
      notMediaSliderBlocks.forEach((slider) => {
        slidersBlocksArray.push(new Swiper(slider, { ...sliderBlockOptions(), el: slider }));
      });
    }
    if (mediaSliderBlocks.length) {
      let mdQueriesArray = dataMediaQueries(mediaSliderBlocks, "slider-media");
      if (mdQueriesArray && mdQueriesArray.length) {
        mdQueriesArray.forEach((mdQueriesItem) => {
          mdQueriesItem.matchMedia.addEventListener("change", () => {
            mediaSliderInit(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
          });
          mediaSliderInit(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
      }
    }
  }
};
window.addEventListener("load", () => {
  initSliders$1();
});
const sliderBlocks = document.querySelectorAll("[data-slider-block]");
const addSlides = async (carts, target, createFunc) => {
  if (!target) return;
  showLoader(target);
  await delay(0.5);
  const containerByType = [...sliderBlocks].find((block) => block.dataset.sliderBlock === target.dataset.sliderBlock);
  const sliderWrapper = containerByType.querySelector(".swiper-wrapper");
  if (target.dataset.sliderBlock === "products-related") {
    const productPage = document.querySelector(".product-item[data-product-cart]");
    if (productPage) {
      const cartsByType2 = carts.filter(({ type }) => type === productPage.dataset.productCart);
      cartsByType2.forEach((cart2) => {
        sliderWrapper.insertAdjacentHTML("beforeend", createFunc(cart2, true));
      });
      return;
    }
  }
  if (target.dataset.sliderBlock === "posts-related") {
    const postSinglePage = document.querySelector(".item-post-single[data-post-theme]");
    if (postSinglePage) {
      const cartsByType2 = carts.filter(({ theme }) => theme === postSinglePage.dataset.postTheme);
      cartsByType2.forEach((cart2) => {
        sliderWrapper.insertAdjacentHTML("beforeend", createFunc(cart2, true));
      });
      return;
    }
  }
  const cartsByType = carts.filter(({ type }) => type === target.dataset.sliderBlock);
  cartsByType.forEach((cart2) => {
    sliderWrapper.insertAdjacentHTML("beforeend", createFunc(cart2, true));
  });
};
const initSliders = async () => {
  slidersBlocksArray.forEach((slider) => {
    if (!slider) return;
    const slidesCount = slider.el?.querySelectorAll(".swiper-slide").length || 0;
    if (!slidesCount) return;
    slider.init();
  });
};
const renderSlides = async (e) => {
  const {
    entry: { target, isIntersecting }
  } = e.detail;
  if (!isIntersecting) return;
  const products2 = await getProducts();
  const posts2 = await getPosts();
  if (products2.length) {
    await addSlides(products2, target, createProductHTML);
  }
  if (posts2.length) {
    if (target.dataset.sliderBlock === "posts-related") {
      await addSlides(posts2, target, createPostHTML);
      await initSliders();
      hideLoader(target);
      return;
    }
    const latestPosts2 = sortByDateDesc(posts2);
    const firstThreePost = latestPosts2.slice(0, 3);
    await addSlides(firstThreePost, target, createPostHTML);
  }
  await initSliders();
  hideLoader(target);
};
if (sliderBlocks.length) {
  document.addEventListener("watcherCallback", renderSlides);
}
window["FLS"] = true;
detectTouchDevice();
headerHeight();
console.log("app.js executed");
export {
  _slideDown as _,
  _slideUp as a,
  getProducts as b,
  syncCartFromStorage as c,
  dataMediaQueries as d,
  formatingValue as e,
  formQuantity as f,
  getHash as g,
  bodyLockStatus as h,
  bodyLock as i,
  bodyUnlock as j,
  objectModules as o,
  setHash as s
};
