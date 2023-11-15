import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { cleandir } from 'rollup-plugin-cleandir';

export default defineConfig([
    {
        input: 'src/OnePageNav.ts',
        output: {
            file: 'dist/OnePageNav.umd.js',
            format: 'umd',
            name: 'OnePageNav',
        },
        plugins: [
            cleandir('dist'),
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
            file: 'dist/OnePageNav.js',
            format: 'es',
            name: 'OnePageNav',
        },
        plugins: [
            cleandir('dist'),
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
        output: [
            {
                format: 'es',
                file: 'dist/OnePageNav.min.js',
                name: 'OnePageNav',
            },
            {
                format: 'umd',
                file: 'dist/OnePageNav.umd.js',
                name: 'OnePageNav',
                exports: 'named',
            },
        ],
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

// export default (commandLineArgs) => (commandLineArgs.dev === true ? dev : prod);
