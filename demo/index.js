import "./style.scss";

function setContrast(el) {
    let rgb = [];
    // Randomly update colours
    rgb[0] = Math.round(Math.random() * 195 + 60);
    rgb[1] = Math.round(Math.random() * 125 + 130);
    rgb[2] = Math.round(Math.random() * 125 + 130);

    const backgroundColour = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.5)";
    el.style.backgroundColor = backgroundColour;
}

document.querySelectorAll("section:not(#section-2)").forEach((el) => setContrast(el));
document.querySelectorAll("#section-2 div").forEach((el) => setContrast(el));
document.querySelector(".mobile-button").addEventListener("click", function () {
    document.querySelector(".mainOptions").classList.toggle("active");
    document.querySelector(".mobile-button").classList.toggle("active");
});

// Example of changing values at runtime

let body = document.querySelector("body");

let sliderOptions = document.querySelectorAll('input[type="checkbox"]');

sliderOptions.forEach((el) =>
    el.addEventListener("change", () => {
        onePage.set(el.name, el.checked ? true : false);
        if (el.name == "setClassesOnSections") el.checked ? body.classList.add("sections-on") : body.classList.remove("sections-on");
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

let defaultActiveAnchor = document.querySelector("input[name=defaultActiveElement]");

defaultActiveAnchor.addEventListener("input", () => {
    onePage.set(defaultActiveAnchor.name, defaultActiveAnchor.value);
});
