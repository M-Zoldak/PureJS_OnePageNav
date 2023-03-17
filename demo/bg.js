function setContrast(el) {
    let rgb = [];
    // Randomly update colours
    rgb[0] = Math.round(Math.random() * 195 + 60);
    rgb[1] = Math.round(Math.random() * 125 + 130);
    rgb[2] = Math.round(Math.random() * 125 + 130);

    const backgroundColour = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.5)";
    el.style.backgroundColor = backgroundColour;
}
