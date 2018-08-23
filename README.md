# gulp-boilerplate
> Pug + Sass + BrowserSync = Gulp start kit

![alt text](https://img.shields.io/badge/status-in--development-orange.svg?longCache=true&style=for-the-badge "in development")

The main idea of this boilerplate:
you work in `/dev`, compiles in `/src`, and minify/uglify in `/public`

---

## Dev Stack
This project uses…
1. [Gulp](https://gulpjs.com/) as project builder
1. [Pug](https://pugjs.org/) as html template engine
1. [Sass (SCSS)](https://sass-lang.com/) as css enhancer
1. [Autoprefixer](https://github.com/sindresorhus/gulp-autoprefixer) to add vendor prefixes to css files
1. [StyleLint](https://stylelint.io/) for linting scss files
1. [source maps](https://github.com/gulp-sourcemaps/gulp-sourcemaps) for easy css debuging
1. [Babel](https://babeljs.io/) as a JavaScript compiler
1. [Imagemin](https://github.com/imagemin/imagemin) as an image minifier
1. [Browser-sync](https://github.com/browsersync/browser-sync) to launch a local server and do live reloads as sass and pug files changes

For including any files you can use [gulp-include](https://github.com/wiledal/gulp-include) syntax

Boilerplate uses [Sass Guidelines](https://sass-guidelin.es/) principles and Pattern7.1

## How to use
1. `git clone` %repository%
2. `npm i` to install dev dependencies
3. `gulp` or other commands


## File Structure
```
/dev - файлы разработки, а также картинки
/src - скомпилированные файлы
/public - минифицированные файлы
```

## Gulp Commands 
- `gulp` aka `gulp serve` to compile pug, sass, js, launch the browser sync local server and watch for changes.

### All Gulp tasks
- `views` compiling pugs
- `styles` linting stylesheets, compile scss, add vendor prefixes
- `lintstyles` linting stylesheets
- `scripts` babeling js
- `images` optimizing images and copy
