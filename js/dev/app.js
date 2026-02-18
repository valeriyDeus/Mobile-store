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
window["FLS"] = true;
detectTouchDevice();
headerHeight();
export {
  _slideDown as _,
  _slideUp as a,
  getProducts as b,
  syncCartFromStorage as c,
  dataMediaQueries as d,
  formatingValue as e,
  formQuantity as f,
  getHash as g,
  getPosts as h,
  hideLoader as i,
  sortByDateDesc as j,
  showLoader as k,
  delay as l,
  createProductHTML as m,
  createPostHTML as n,
  objectModules as o,
  bodyLockStatus as p,
  bodyLock as q,
  bodyUnlock as r,
  setHash as s
};
