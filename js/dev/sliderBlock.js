import { b as getProducts, h as getPosts, i as hideLoader, j as sortByDateDesc, k as showLoader, l as delay, m as createProductHTML, n as createPostHTML } from "./app.min.js";
import { s as slidersBlocksArray } from "./slider.min.js";
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
      cartsByType2.forEach((cart) => {
        sliderWrapper.insertAdjacentHTML("beforeend", createFunc(cart, true));
      });
      return;
    }
  }
  if (target.dataset.sliderBlock === "posts-related") {
    const postSinglePage = document.querySelector(".item-post-single[data-post-theme]");
    if (postSinglePage) {
      const cartsByType2 = carts.filter(({ theme }) => theme === postSinglePage.dataset.postTheme);
      cartsByType2.forEach((cart) => {
        sliderWrapper.insertAdjacentHTML("beforeend", createFunc(cart, true));
      });
      return;
    }
  }
  const cartsByType = carts.filter(({ type }) => type === target.dataset.sliderBlock);
  cartsByType.forEach((cart) => {
    sliderWrapper.insertAdjacentHTML("beforeend", createFunc(cart, true));
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
  const products = await getProducts();
  const posts = await getPosts();
  if (products.length) {
    await addSlides(products, target, createProductHTML);
  }
  if (posts.length) {
    if (target.dataset.sliderBlock === "posts-related") {
      await addSlides(posts, target, createPostHTML);
      await initSliders();
      hideLoader(target);
      return;
    }
    const latestPosts = sortByDateDesc(posts);
    const firstThreePost = latestPosts.slice(0, 3);
    await addSlides(firstThreePost, target, createPostHTML);
  }
  await initSliders();
  hideLoader(target);
};
if (sliderBlocks.length) {
  document.addEventListener("watcherCallback", renderSlides);
}
