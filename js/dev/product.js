import { g as getHash, d as dataMediaQueries, s as setHash, _ as _slideDown, a as _slideUp, b as getProducts, f as formQuantity, c as syncCartFromStorage, e as formatingValue } from "./app.min.js";
import "./sliderBlock.min.js";
import "./slider.min.js";
/* empty css             */
function tabs() {
  const tabs2 = document.querySelectorAll("[data-tabs]");
  if (!tabs2.length) return;
  const hash = getHash();
  let tabsActiveHash = hash && hash.startsWith("tab-") ? hash.replace("tab-", "").split("-") : [];
  tabs2.forEach((tabsBlock, index) => {
    initTabs(tabsBlock, index);
    tabsBlock.addEventListener("click", tabsAction);
    tabsBlock.addEventListener("keydown", keyDownAction);
  });
  let mdQueriesArray = dataMediaQueries(tabs2, "tabs");
  if (mdQueriesArray && mdQueriesArray.length) {
    mdQueriesArray.forEach((mdQueriesItem) => {
      mdQueriesItem.matchMedia.addEventListener("change", () => {
        updateControlPosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
      updateControlPosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
    });
  }
  function updateControlPosition(tabsMediaArray, matchMedia) {
    tabsMediaArray.forEach((tabsMediaItem) => {
      const tabsMediaElement = tabsMediaItem.item;
      if (!tabsMediaElement) return;
      const tabsControl = tabsMediaElement.querySelector("[data-tabs-controls]");
      const tabsControls = tabsMediaElement.querySelectorAll("[data-tabs-control]");
      const tabsContent = tabsMediaElement.querySelector("[data-tabs-content]");
      const tabsContentItems = tabsMediaElement.querySelectorAll("[data-tabs-item]");
      const tabsControlArray = Array.from(tabsControls).filter(
        (tabControl) => tabControl.closest("[data-tabs]") === tabsMediaElement
      );
      const tabsContentArray = Array.from(tabsContentItems).filter(
        (tabContentItem) => tabContentItem.closest("[data-tabs]") === tabsMediaElement
      );
      tabsContentArray.forEach((tabsContentItem, index) => {
        if (matchMedia.matches) {
          tabsContent.append(tabsControlArray[index]);
          tabsContent.append(tabsContentItem);
          tabsMediaElement.classList.add("tab-accordion");
        } else {
          tabsControl.append(tabsControlArray[index]);
          tabsMediaElement.classList.remove("tab-accordion");
        }
      });
    });
  }
  function initTabs(tabsBlock, index) {
    tabsBlock.classList.add("tab-init");
    tabsBlock.setAttribute("data-tabs-index", index);
    const tabsControlNavigation = tabsBlock.querySelector("[data-tabs-controls]");
    const tabsControlButtons = tabsBlock.querySelectorAll("[data-tabs-controls]>*");
    const tabsContentItems = tabsBlock.querySelectorAll("[data-tabs-content]>*");
    const tabsBlockIndex = tabsBlock.dataset.tabsIndex;
    const tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;
    if (tabsActiveHashBlock) {
      const tabControlActive = tabsBlock.querySelector("[data-tabs-controls]>.is-active");
      if (tabControlActive) {
        tabControlActive.classList.remove("is-active");
      }
    }
    tabsControlNavigation.setAttribute("role", "tablist");
    tabsContentItems.forEach((tabsContentItem, index2) => {
      tabsControlButtons[index2].setAttribute("data-tabs-control", "");
      tabsControlButtons[index2].setAttribute("role", "tab");
      tabsControlButtons[index2].setAttribute("id", `${tabsBlock.classList[0]}${index2 + 1}`);
      tabsControlButtons[index2].setAttribute("aria-selected", true);
      tabsContentItem.setAttribute("role", "tabpanel");
      tabsContentItem.setAttribute("data-tabs-item", "");
      tabsContentItem.setAttribute("aria-labelledby", tabsControlButtons[index2].id);
      if (tabsActiveHashBlock && index2 == tabsActiveHash[1]) {
        tabsControlButtons[index2].classList.add("is-active");
      }
      if (!tabsControlButtons[index2].classList.contains("is-active")) {
        tabsContentItem.hidden = true;
        tabsContentItem.setAttribute("tabindex", "-1");
        tabsControlButtons[index2].setAttribute("tabindex", "-1");
        tabsControlButtons[index2].setAttribute("aria-selected", false);
      }
    });
  }
  function updateTabsStatus(tabsBlock) {
    const tabsControls = tabsBlock.querySelectorAll("[data-tabs-control]");
    const tabsContentItems = tabsBlock.querySelectorAll("[data-tabs-item]");
    const tabsBlockAnimateDuration = getTabsAnimateDuration(tabsBlock);
    const tabsBlockIndex = tabsBlock.dataset.tabsIndex;
    if (tabsContentItems.length > 0) {
      const tabsContentArray = Array.from(tabsContentItems).filter((item) => item.closest("[data-tabs]") === tabsBlock);
      const tabsControlsArray = Array.from(tabsControls).filter((item) => item.closest("[data-tabs]") === tabsBlock);
      const isHash = tabsBlock.hasAttribute("data-tabs-hash");
      tabsContentArray.forEach((tabsContentItem, index) => {
        if (tabsControlsArray[index].classList.contains("is-active")) {
          tabsContentItem.removeAttribute("tabindex");
          contentTabsToggle(tabsContentItem, tabsBlockAnimateDuration);
          if (isHash && !tabsContentItem.closest(".modal")) {
            setHash(`tab-${tabsBlockIndex}-${index}`);
          }
        } else {
          tabsContentItem.setAttribute("tabindex", "-1");
          contentTabsToggle(tabsContentItem, tabsBlockAnimateDuration, false);
        }
      });
    }
  }
  function contentTabsToggle(tabsContentItem, animateDuration, isActive = true) {
    if (isActive) {
      animateDuration ? _slideDown(tabsContentItem, animateDuration) : tabsContentItem.hidden = false;
    } else {
      animateDuration ? _slideUp(tabsContentItem, animateDuration) : tabsContentItem.hidden = true;
    }
  }
  function tabsAction(e) {
    const { target } = e;
    if (!target.closest("[data-tabs-control]")) return;
    const tabControl = target.closest("[data-tabs-control]");
    const tabsBlock = tabControl.closest("[data-tabs]");
    const tabsControlItems = tabsBlock.querySelectorAll("[data-tabs-control]");
    if (!tabControl.classList.contains("is-active") && !tabsBlock.querySelector(".slide")) {
      const [tabActiveControl] = Array.from(tabsControlItems).filter(
        (item) => item.classList.contains("is-active") && item.closest("[data-tabs]") === tabsBlock
      );
      if (tabActiveControl) toggleTabSelected(tabActiveControl);
      toggleTabSelected(tabControl, true);
      updateTabsStatus(tabsBlock);
    }
    e.preventDefault();
  }
  function keyDownAction(e) {
    const { target, key } = e;
    if (!target.closest("[data-tabs-control]")) return;
    const tabControl = target.closest("[data-tabs-control]");
    const tabsBlock = tabControl.closest("[data-tabs]");
    const tabsControls = Array.from(tabsBlock.querySelectorAll("[data-tabs-control]"));
    if (tabControl.classList.contains("is-active") && !tabsBlock.querySelector(".slide")) {
      const currentIndex = tabsControls.findIndex((itemIndex) => itemIndex === tabControl);
      const [tabActiveControl] = tabsControls.filter(
        (item) => item.classList.contains("is-active") && item.closest("[data-tabs]") === tabsBlock
      );
      let nextIndex;
      if (key === "ArrowRight" || key === "ArrowDown") {
        nextIndex = currentIndex === tabsControls.length - 1 ? 0 : currentIndex + 1;
      } else if (key === "ArrowLeft" || key === "ArrowUp") {
        nextIndex = currentIndex === 0 ? tabsControls.length - 1 : currentIndex - 1;
      } else {
        return;
      }
      if (tabActiveControl) toggleTabSelected(tabActiveControl);
      toggleTabSelected(tabsControls[nextIndex], true);
      tabsControls[nextIndex].focus();
      updateTabsStatus(tabsBlock);
    }
  }
  function getTabsAnimateDuration(tabsBlock) {
    if (tabsBlock.hasAttribute("data-tabs-animate")) {
      return +tabsBlock.dataset.tabsAnimate || 500;
    }
  }
  function toggleTabSelected(tabControl, isActive = false) {
    !isActive ? tabControl.setAttribute("tabindex", "-1") : tabControl.removeAttribute("tabindex");
    tabControl.setAttribute("aria-selected", `${!isActive ? false : true}`);
    tabControl.classList.toggle("is-active");
  }
}
if (document.querySelector("[data-tabs]")) {
  tabs();
}
const productContainer = document.querySelector("[data-page-product]");
const curentColorProduct = "orange";
const getPageProductHTML = (product) => {
  const { id, image, title, price, type, rating, colors, sizes, category, count, desc, tags, sku } = product;
  const colorsItems = (colors2) => {
    if (!colors2.length) return "";
    let colorsTemplate = ``;
    for (const color of colors2) {
      colorsTemplate += `
        <a class="product-item__link ${color === curentColorProduct ? "product-item__link--active" : ""}" href="#">${color}</a>
      `;
    }
    return colorsTemplate;
  };
  const sizesItems = (sizes2) => {
    if (!colors.length) return "";
    let sizesTemplate = ``;
    for (const size of sizes2) {
      sizesTemplate += `<a class="product-item__link" href="#">${size}</a>`;
    }
    return sizesTemplate;
  };
  return `
    <article class="page-product__item product-item" data-product-cart=${type} data-product-id=${id}>
          <div class="product-item__image">
            <img src="${image}" width="640" height="719" loading="lazy" alt="${title}" />
          </div>
          <div class="product-item__body">
            <div class="product-item__block">
              <h2 class="product-item__title title title--small" data-product-title=${title} data-title>${title}</h2>
              <div class="product-item__rating rating-product">
                <div class="rating-product__icon" aria-hidden="true">
                  <svg>
                    <use xlink:href="__spritemap#sprite-star"></use>
                  </svg>
                </div>
                <span class="rating-product__value">${formatingValue(rating)}</span>
              </div>
            </div>
            <div class="product-item__price" data-product-price="${price}">$${formatingValue(price, 2)}</div>
            <div class="product-item__text"><p>${desc}</p></div>
            <div class="product-item__block">
              <h3 class="product-item__title title title--contact" data-title>Color</h3>
              <div class="product-item__color">${colorsItems(colors)}</div>
            </div>
            <div class="product-item__block">
              <h3 class="product-item__title title title--contact" data-title>Size</h3>
              <div class="product-item__size">${sizesItems(sizes)}</div>
            </div>
            <div class="product-item__block">
              <span class="product-item__stok">${count} in stock</span>
              <div class="product-item__quantity-product quantity-product" data-quantity>
                <button
                  class="quantity-product__button quantity-product__button--minus"
                  data-quantity-minus
                  aria-label="plus"
                  type="button"
                ></button>
                <div class="quantity-product__input">
                  <input autocomplete="off" type="text" name="form[quantity]" data-quantity-value data-quantity-min="1" data-quantity-max=${count} value="1" />
                </div>
                <button
                  class="quantity-product__button quantity-product__button--plus"
                  data-quantity-plus
                  aria-label="minus"
                  type="button"
                ></button>
              </div>
            </div>
            <div class="product-item__block">
              <div class="product-item__actions">
                <a class="product-item__button button" href="#" data-button>Buy now</a>
                <button class="product-item__button button" data-add-to-cart data-button type="button">
                  <span>Add to cart</span>
                </button>
              </div>
            </div>
            <div class="product-item__block product-item__meta meta-product">
              <div class="meta-product__item">
                <span class="meta-product__label">SKU:</span>
                <span class="meta-product__value">${sku}</span>
              </div>
              <div class="meta-product__item">
                <span class="meta-product__label">Category:</span>
                <span class="meta-product__value">${category.join(", ")}</span>
              </div>
              <div class="meta-product__item">
                <span class="meta-product__label">Tags:</span>
                <span class="meta-product__value">${tags.join(", ")}</span>
              </div>
            </div>
          </div>
        </article>
  `;
};
const getProduct = async () => {
  const products = await getProducts();
  if (!products.length) return;
  productContainer.innerHTML = "";
  const [currentProduct] = products.filter((product) => product.id === 8);
  productContainer.insertAdjacentHTML("beforeend", getPageProductHTML(currentProduct));
  formQuantity();
  await syncCartFromStorage();
};
if (productContainer) {
  getProduct();
}
