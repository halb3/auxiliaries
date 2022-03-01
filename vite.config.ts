
import { existsSync } from 'fs';
import { resolve } from 'path';
import git from 'git-rev-sync';

import { defineConfig, UserConfigExport } from 'vite';
// import { visualizer } from 'rollup-plugin-visualizer';

const root = resolve(__dirname, 'source');
const outDir = resolve(__dirname, 'dist');

const gitExists = existsSync(resolve(__dirname, '.git'))

export default defineConfig(({ mode }) => {

    const config: UserConfigExport = {
        root,
        build: {
            outDir,
            lib: {
                entry: resolve(root, 'index.ts'),
                name: 'haeley.auxiliaries',
                formats: ['cjs', 'umd', 'es'],
            },
            sourcemap: 'hidden',
            // rollupOptions: {
            //     external: ['rxjs'],
            //     output: {
            //         globals: {
            //             rxjs: 'rxjs'
            //         }
            //     }
            // }
        },
        define: {
            __GIT_COMMIT__: JSON.stringify(gitExists ? git.short(__dirname) : undefined),
            __GIT_BRANCH__: JSON.stringify(gitExists ? git.branch(__dirname) : undefined),
            __LIB_NAME__: JSON.stringify(process.env.npm_package_name),
            __LIB_VERSION__: JSON.stringify(process.env.npm_package_version),
            __DISABLE_ASSERTIONS__: JSON.stringify(false),
            __LOG_VERBOSITY_THRESHOLD__: JSON.stringify(4)
        },
        // plugins: [visualizer()]
    };

    switch (mode) {

        case 'development':
            config.build.outDir = outDir;
            break;

        case 'production':
        default:
            config.build.emptyOutDir = true;
            // config.define.__DISABLE_ASSERTIONS__ = JSON.stringify(true);
            // config.define.__LOG_VERBOSITY_THRESHOLD__ = JSON.stringify(2);
            break;
    }

    // console.log(config);
    return config;
});
