const starRating = () => {
  const starItems = document.querySelectorAll("[data-star-rating]");
  if (!starItems.length) return;
  starItems.forEach((starItem) => {
    const rating = Number(starItem.dataset.starRating) || 0;
    const max = Number(starItem.dataset.maxRating) || 5;
    const safeRating = Math.max(0, Math.min(rating, max));
    starItem.setAttribute("role", "img");
    starItem.setAttribute("aria-label", `Rating: ${safeRating} out of ${max}`);
    const starActiveSrc = "assets/img/icons/star-active.svg";
    const starInactiveSrc = "assets/img/icons/star.svg";
    for (let i = 0; i < max; i++) {
      const star = document.createElement("img");
      star.src = i < safeRating ? starActiveSrc : starInactiveSrc;
      star.width = 16;
      star.height = 16;
      star.alt = "";
      starItem.appendChild(star);
    }
  });
};
starRating();
