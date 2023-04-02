import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";
import scss from "rollup-plugin-scss";
import postcss from "postcss";
import postcssPresetEnv from "postcss-preset-env";

export default defineConfig([
    {
        input: "script/onePageNav.js",
        output: {
            file: "script/onePageNav.min.js",
            format: "es",
        },
        plugins: [babel({ babelHelpers: "bundled", presets: ["@babel/preset-env"] }), terser()],
    },
    {
        input: "demo/index.js",
        output: {
            file: "demo/index.min.js",
            format: "es",
        },
        plugins: [
            babel({ babelHelpers: "bundled", presets: ["@babel/preset-env"] }),
            terser(),
            scss({
                output: "./demo/style.min.css",
                runtime: require("sass"),
                watch: "./demo/style.scss",
                processor: () => postcss([postcssPresetEnv]),
                outputStyle: "compressed",
                sourceMap: true,
            }),
        ],
    },
]);
