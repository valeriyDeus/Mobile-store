const autoHeight = () => {
  const textareas = document.querySelectorAll(`textarea[data-input-auto-height]`);
  if (!textareas.length) {
    return;
  }
  const setTextareaHeight = (textarea, height) => {
    textarea.style.height = `${height}px`;
  };
  textareas.forEach((textarea) => {
    const textAreaAttributes = {
      autoHeightMin: "data-input-auto-height-min",
      autoHeightMax: "data-input-auto-height-max"
    };
    const startHeight = textarea.hasAttribute(textAreaAttributes.autoHeightMin) ? +textarea.dataset.inputAutoHeightMin : +textarea.offsetHeight;
    const maxHeight = textarea.hasAttribute(textAreaAttributes.autoHeightMax) ? +textarea.dataset.inputAutoHeightMax : Infinity;
    setTextareaHeight(textarea, Math.min(startHeight, maxHeight));
    textarea.addEventListener("input", () => {
      if (textarea.scrollHeight > startHeight) {
        textarea.style.height = `auto`;
        setTextareaHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
      }
    });
  });
};
autoHeight();
