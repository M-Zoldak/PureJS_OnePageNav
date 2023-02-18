let sliderOptions = document.querySelectorAll('input[type="checkbox"]');

sliderOptions.forEach((el) =>
    el.addEventListener("change", () => {
        onePage.set(el.id, el.checked ? true : false);
    })
);

let offset = document.querySelector("input#changeOffset");

offset.addEventListener("change", () => {
    onePage.set(offset.id, offset.value);
});
offset.addEventListener("input", () => {
    if (offset.value < 0) offset.value = 0;
    if (offset.value > 100) offset.value = 100;
    onePage.set(offset.id, offset.value);
});
