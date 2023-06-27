import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { cleandir } from 'rollup-plugin-cleandir';

let dev = defineConfig([
    {
        input: 'src/OnePageNav.ts',
        output: {
            dir: 'dist',
            format: 'iife',
            name: 'OnePageNav',
        },
        plugins: [
            cleandir(),
            typescript(),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env', '@babel/preset-typescript'],
                targets: ['es2015'],
            }),
        ],
    },
]);

let prod = defineConfig([
    {
        input: 'src/OnePageNav.ts',
        output: {
            dir: 'dist',
            format: 'iife',
            name: 'OnePageNav',
        },
        plugins: [
            cleandir(),
            typescript(),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env', '@babel/preset-typescript'],
                targets: ['es2015'],
            }),
        ],
    },
    {
        input: 'src/OnePageNav.ts',
        output: {
            format: 'iife',
            file: 'dist/OnePageNav.min.js',
            name: 'OnePageNav',
        },
        plugins: [
            typescript(),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env', '@babel/preset-typescript'],
                targets: ['es2015'],
            }),
            terser(),
        ],
    },
    {
        input: 'src/OnePageNav.ts',
        output: {
            format: 'umd',
            file: 'dist/OnePageNav.umd.js',
            name: 'OnePageNav',
        },
        plugins: [
            typescript(),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env', '@babel/preset-typescript'],
                targets: ['es2015'],
            }),
            terser(),
        ],
    },
]);

export default (commandLineArgs) => (commandLineArgs.dev === true ? dev : prod);
