# Size Limit [![Cult Of Martians][cult-img]][cult]

<img src="https://ai.github.io/size-limit/logo.svg" align="right"
     title="Size Limit logo by Anton Lovchikov" width="120" height="178">

Size Limit is a performance budget tool for JS. It checks every commit on CI,
calculates the real cost of your JS for end-users and throws an error
if the cost exceeds the limit.

* Size Limit calculates **the time** it would take a browser
  to download and **execute** your JS. Time is a much more accurate
  and understandable metric compared to the size in bytes.
* Size Limit calculations include **all dependencies and polyfills**
  used in your JS.
* Add Size Limit to **Travis CI**, **Circle CI**, or another CI system
  to know if a pull request adds a massive dependency.
* Size Limit is **modular** to fits different use cases like big JS application
  with own bundler or small npm libraries with many files.

<p align="center">
  <img src="./img/example.png" alt="Size Limit CLI" width="738">
</p>

With `--why`, Size Limit can tell you *why* your library has this size
and show the real cost of all your internal dependencies.

<p align="center">
  <img src="./img/why.png" alt="Bundle Analyzer example" width="650">
</p>

<p align="center">
  <a href="https://evilmartians.com/?utm_source=size-limit">
    <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
         alt="Sponsored by Evil Martians" width="236" height="54">
  </a>
</p>

[cult-img]: http://cultofmartians.com/assets/badges/badge.svg
[cult]:     http://cultofmartians.com/tasks/size-limit-config.html

## Who Uses Size Limit

* [MobX](https://github.com/mobxjs/mobx)
* [Material-UI](https://github.com/callemall/material-ui)
* [Autoprefixer](https://github.com/postcss/autoprefixer)
* [PostCSS](https://github.com/postcss/postcss) reduced
  [25% of the size](https://github.com/postcss/postcss/commit/150edaa42f6d7ede73d8c72be9909f0a0f87a70f).
* [Browserslist](https://github.com/ai/browserslist) reduced
  [25% of the size](https://github.com/ai/browserslist/commit/640b62fa83a20897cae75298a9f2715642531623).
* [EmojiMart](https://github.com/missive/emoji-mart) reduced [20% of the size](https://github.com/missive/emoji-mart/pull/111)
* [nanoid](https://github.com/ai/nanoid) reduced
  [33% of the size](https://github.com/ai/nanoid/commit/036612e7d6cc5760313a8850a2751a5e95184eab).
* [React Focus Lock](https://github.com/theKashey/react-focus-lock) reduced [32% of the size](https://github.com/theKashey/react-focus-lock/pull/48).
* [Logux](https://github.com/logux) reduced
  [90% of the size](https://github.com/logux/logux-client/commit/62b258e20e1818b23ae39b9c4cd49e2495781e91).


## How It Works

1. Size Limit contains CLI tool, 3 plugins (`file`, `webpack`, `time`)
   and 3 plugin presets for popular cases (`app`, `big-lib`, `small-lib`).
   CLI tool finds plugins in `package.json` and load the config.
2. If you use `webpack` plugin, Size Limit bundles JS files into
   the single file. It is important to track dependencies and webpack polyfills.
   It is also useful for small libraries with many small files and without
   bundler.
3. `webpack` plugin creates an empty webpack project, adds your library
   and looks for the bundle size difference.
4. `time` plugin compares current machine performance with low-priced Android
   devices to calculate CPU throttling rate.
5. Then `time` plugin runs headless Chrome (or desktop Chrome if it available)
   to tracks the time using by browser to compile and execute JS.


## Usage

### JS Applications

Application has its  own bundler and sends JS bundle directly to a client
(without publish it to npm).

<details><summary><b>Show instructions</b></summary>

1. Install preset:

    ```sh
    $ npm install --save-dev @size-limit/preset-app
    ```

2. Add `size-limit` section to `package.json` and `size` script:

    ```diff
    + "size-limit": [
    +   {
    +     "path": "dist/app-*.js"
    +   }
    + ],
      "scripts": {
        "build": "webpack ./webpack.config.js",
    +   "size": "npm run build && size-limit",
        "test": "jest && eslint ."
      }
    ```

3. Here’s how you can get the size for your current project:

    ```sh
    $ npm run size

      Package size: 30.08 KB with all dependencies, minified and gzipped
      Loading time: 602 ms   on slow 3G
      Running time: 214 ms   on Snapdragon 410
      Total time:   815 ms
    ```

4. Now, let’s set the limit. Add 25% for current total time and use that as
   a limit in your `package.json`:

    ```diff
      "size-limit": [
        {
    +     "limit": "1 s",
          "path": "dist/app-*.js"
        }
      ],
    ```

5. Add the `size` script to your test suite:

    ```diff
      "scripts": {
        "build": "webpack ./webpack.config.js",
        "size": "npm run build && size-limit",
    -   "test": "jest && eslint ."
    +   "test": "jest && eslint . && npm run size"
      }
    ```

6. If you don’t have a continuous integration service running, don’t forget
   to add one — start with [Travis CI].

</details>


### Big Libraries

JS libraries > 10 KB. [React] is a good example.

<details><summary><b>Show instructions</b></summary>

1. Install preset:

    ```sh
    $ npm install --save-dev @size-limit/preset-big-lib
    ```

2. Add `size-limit` section to `package.json` and `size` script:

    ```diff
    + "size-limit": [
    +   {
    +     "path": "dist/react.production-*.js"
    +   }
    + ],
      "scripts": {
        "build": "webpack ./scripts/rollup/build.js",
    +   "size": "npm run build && size-limit",
        "test": "jest && eslint ."
      }
    ```

3. Here’s how you can get the size for your current project:

    ```sh
    $ npm run size

      Package size: 30.08 KB with all dependencies, minified and gzipped
      Loading time: 602 ms   on slow 3G
      Running time: 214 ms   on Snapdragon 410
      Total time:   815 ms
    ```

4. Now, let’s set the limit. Add 25% for current total time and use that as
   a limit in your `package.json`:

    ```diff
      "size-limit": [
        {
    +     "limit": "1 s",
          "path": "dist/react.production-*.js"
        }
      ],
    ```

5. Add the `size` script to your test suite:

    ```diff
      "scripts": {
        "build": "rollup ./scripts/rollup/build.js",
        "size": "npm run build && size-limit",
    -   "test": "jest && eslint ."
    +   "test": "jest && eslint . && npm run size"
      }
    ```

6. If you don’t have a continuous integration service running, don’t forget
   to add one — start with [Travis CI].

</details>


### Small Libraries

JS libraries < 10 KB. [Nano ID] or [Storeon] could be a good example.

<details><summary><b>Show instructions</b></summary>

1. First, install `size-limit`:

    ```sh
    $ npm install --save-dev @size-limit/preset-small-lib
    ```

2. Add `size-limit` section to `package.json` and `size` script:

    ```diff
    + "size-limit": [
    +   {
    +     "path": "index.js"
    +   }
    + ],
      "scripts": {
    +   "size": "size-limit",
        "test": "jest && eslint ."
      }
    ```

3. Here’s how you can get the size for your current project:

    ```sh
    $ npm run size

      Package size: 177 B with all dependencies, minified and gzipped
    ```

4. If your project size starts to look bloated, run `--why` for analysis:

    ```sh
    $ npm run size -- --why
    ```

5. Now, let’s set the limit. Determine the current size of your library,
   add just a little bit (a kilobyte, maybe) and use that as a limit
   in your `package.json`:

    ```diff
     "size-limit": [
        {
    +     "limit": "9 KB",
          "path": "index.js"
        }
     ],
    ```

6. Add the `size` script to your test suite:

    ```diff
      "scripts": {
        "size": "size-limit",
    -   "test": "jest && eslint ."
    +   "test": "jest && eslint . && npm run size"
      }
    ```

7. If you don’t have a continuous integration service running, don’t forget
   to add one — start with [Travis CI].

</details>

[Travis CI]: https://github.com/dwyl/learn-travis
[Storeon]: https://github.com/ai/storeon/
[Nano ID]: https://github.com/ai/nanoid/
[React]: https://github.com/facebook/react/


## Config

Size Limits supports three ways to define config.

1. `size-limit` section to `package.json`:

   ```json
     "size-limit": [
       {
         "path": "index.js",
         "limit": "500 ms"
       }
     ]
   ```

2. or separated `.size-limit.json` config file:

   ```js
   [
     {
       "path": "index.js",
       "limit": "500 ms"
     }
   ]
   ```

3. or more flexible `.size-limit.js` config file:

   ```js
   module.exports = [
     {
       path: "index.js",
       limit: "500 ms"
     }
   ]
   ```

Each section in the config could have options:

* **path**: relative paths to files. The only mandatory option.
  It could be a path `"index.js"`, a [pattern] `"dist/app-*.js"`
  or an array `["index.js", "dist/app-*.js", "!dist/app-exclude.js"]`.
* **entry**: when using a custom webpack config, a webpack entry could be given.
  It could be a string or an array of strings.
  By default, the total size of all entry points will be checked.
* **limit**: size or time limit for files from `path` option. It should be
  a string with a number and unit. Format: `100 B`, `10 KB`, `500 ms`, `1 s`.
* **name**: the name of this section. It will be useful only
  if you have multiple sections.
* **webpack**: with `false` will disable webpack.
* **running**: with `false` will disable calculating running time.
* **gzip**: with `false` will disable gzip compression.
* **config**: a path to custom webpack config.
* **ignore**: an array of files and dependencies to ignore from project size.

If you use Size Limit to track the size of CSS files, only set `webpack: false`.
Otherwise, you will get wrong numbers, because of webpack inserts `style-loader`
runtime (≈2 KB) into the bundle.

[pattern]: https://github.com/sindresorhus/globby#globbing-patterns
