let sliderOptions = document.querySelectorAll('input[type="checkbox"]');

sliderOptions.forEach((el) =>
    el.addEventListener("change", () => {
        onePage.set(el.name, el.checked ? true : false);
    })
);

let offset = document.querySelector("input[name=changeOffset]");

offset.addEventListener("change", () => {
    onePage.set(offset.name, offset.value);
});
offset.addEventListener("input", () => {
    if (offset.value < 0) offset.value = 0;
    if (offset.value > 100) offset.value = 100;
    onePage.set(offset.name, offset.value);
});

let defaultActiveAnchor = document.querySelector("input[name=differentActiveAnchor]");

defaultActiveAnchor.addEventListener("input", () => {
    console.log(defaultActiveAnchor.name);
    console.log(defaultActiveAnchor.value);
    onePage.set(defaultActiveAnchor.name, defaultActiveAnchor.value);
});
