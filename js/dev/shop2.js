import { d as dataMediaQueries, o as objectModules } from "./app.min.js";
class Pagination {
  constructor(paginationItem, matchMedia = false, options = {}) {
    let defaultConfig = {
      init: true,
      dotsSepp: "...",
      adaptiveSepp: "/",
      range: 1
    };
    this.paginationClasses = {
      paginationInit: "pagination-init",
      paginationList: "pagination__list",
      paginationArrow: "pagination__arrow",
      paginationArrowNext: "pagination__arrow--next",
      paginationArrowPrev: "pagination__arrow--prev",
      paginationItem: "pagination__item",
      paginationItemInfo: "pagination__item--info",
      paginationItemSepp: "pagination__item--sepp",
      paginationActive: "is-active",
      paginationDisabled: "is-disabled"
    };
    this.options = { ...defaultConfig, ...options };
    this.paginationItem = paginationItem;
    this.paginationList = paginationItem.querySelector(`.${this.paginationClasses.paginationList}`);
    this.arrowPrev = paginationItem.querySelector(`.${this.paginationClasses.paginationArrowPrev}`);
    this.arrowNext = paginationItem.querySelector(`.${this.paginationClasses.paginationArrowNext}`);
    this.range = paginationItem.dataset.paginationRange ? parseInt(paginationItem.dataset.paginationRange) : this.options.range;
    this.matchMedia = matchMedia;
    if (this.options.init) {
      this.paginationInit();
    }
  }
  paginationInit() {
    if (!this.paginationItem) {
      this.#paginationLogging("Pagination element not found");
      return;
    }
    this.paginationItem.classList.add(`${this.paginationClasses.paginationInit}`);
    this.#paginationLogging(`Init pagination`);
    if (this.matchMedia.matches || !this.matchMedia) {
      this.updatePagination();
    } else {
      this.updatePagination(false);
    }
  }
  updatePagination(showExtended = true) {
    this.paginationItems = Array.from(
      this.paginationList.querySelectorAll(`.${this.paginationClasses.paginationItem}`)
    );
    if (!this.paginationItems.length) {
      return;
    }
    this.removeDotsAndInfo(this.paginationItems);
    this.updatePaginationItems = Array.from(
      this.paginationList.querySelectorAll(`.${this.paginationClasses.paginationItem}`)
    );
    this.hideAllItems(this.updatePaginationItems);
    const totalItems = this.updatePaginationItems.length;
    const activeIndex = Array.from(this.updatePaginationItems).findIndex(
      (paginationItem) => paginationItem.classList.contains(`${this.paginationClasses.paginationActive}`)
    );
    this.updateArrows(activeIndex, totalItems);
    !showExtended ? this.updatePaginationItems[0].style.display = "" : this.updatePaginationItems[activeIndex].style.display = "";
    this.updatePaginationItems[totalItems - 1].style.display = "";
    const start = Math.max(1, !showExtended ? activeIndex - this.range : activeIndex);
    const end = Math.min(totalItems - 2, !showExtended ? activeIndex + this.range : activeIndex);
    const beforeLast = !showExtended ? 2 : 1;
    this.showItems(this.updatePaginationItems, start, end);
    if (start > 1 && !showExtended) {
      this.paginationList.insertBefore(this.createItem("dots"), this.updatePaginationItems[start]);
    }
    if (end < totalItems - beforeLast) {
      if (activeIndex === totalItems - 1 && showExtended) {
        this.paginationList.insertBefore(
          this.createItem("info", showExtended, totalItems),
          this.updatePaginationItems[totalItems - 1]
        );
        this.paginationList.insertBefore(
          this.createItem("sepp", showExtended),
          this.updatePaginationItems[totalItems - 1]
        );
      } else {
        this.paginationList.insertBefore(
          this.createItem("sepp", showExtended),
          this.updatePaginationItems[totalItems - 1]
        );
      }
    }
  }
  showItems(paginationItems, start, end) {
    for (let i = start; i <= end; i++) {
      paginationItems[i].style.display = "";
    }
  }
  createItem(type, showExtended, totalItems = 0) {
    const li = document.createElement("li");
    li.className = `${this.paginationClasses.paginationItem} ${this.paginationClasses.paginationItem}--${type}`;
    if (type === "sepp") li.textContent = showExtended ? this.options.adaptiveSepp : this.options.dotsSepp;
    if (type === "info") li.textContent = `${totalItems}`;
    return li;
  }
  removeDotsAndInfo(paginationItems) {
    paginationItems.forEach((paginationItem) => {
      if (paginationItem.classList.contains(`${this.paginationClasses.paginationItemSepp}`) || paginationItem.classList.contains(`${this.paginationClasses.paginationItemInfo}`)) {
        paginationItem.remove();
      }
    });
  }
  hideAllItems(paginationItems) {
    paginationItems.forEach((paginationItem) => paginationItem.style.display = "none");
  }
  updateArrows(activeIndex, totalItems) {
    if (this.arrowPrev) {
      this.arrowPrev.classList.toggle(`${this.paginationClasses.paginationDisabled}`, activeIndex === 0);
    }
    if (this.arrowNext) {
      this.arrowNext.classList.toggle(`${this.paginationClasses.paginationDisabled}`, activeIndex === totalItems - 1);
    }
  }
  #paginationLogging(message) {
    if (this.options.logging) ;
  }
}
const initPaginatons = () => {
  const paginationItems = document.querySelectorAll("[data-pagination]");
  if (!paginationItems.length) return;
  const paginationArray = Array.from(paginationItems).filter((item) => !item.dataset.pagination.split(",")[0]);
  if (paginationArray.length > 0) {
    paginationArray.forEach((paginationItem) => objectModules.pagination = new Pagination(paginationItem));
  }
  let mdQueriesArray = dataMediaQueries(paginationItems, "pagination");
  if (mdQueriesArray && mdQueriesArray.length) {
    mdQueriesArray.forEach((mdQueriesItem) => {
      mdQueriesItem.matchMedia.addEventListener("change", () => {
        mdQueriesItem.itemsArray.forEach(
          (paginationItem) => objectModules.pagination = new Pagination(paginationItem.item, mdQueriesItem.matchMedia)
        );
      });
      mdQueriesItem.itemsArray.forEach(
        (paginationItem) => objectModules.pagination = new Pagination(paginationItem.item, mdQueriesItem.matchMedia)
      );
    });
  }
};
if (document.querySelector("[data-pagination]")) {
  initPaginatons();
}
