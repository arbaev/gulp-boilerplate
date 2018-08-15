# gulp-boilerplate
> Pug + PostCSS + BrowserSync + Gulp start kit
---

## File Structure
/dev - файлы разработки, а также картинки
/src - скомпилированные файл
/public - минифицированные файлы

## Обработчики
Используются PostCSS обработчики:
  [precss](https://github.com/jonathantneal/precss)
  [normalize](https://github.com/csstools/postcss-normalize)
  [postcssEnv](https://github.com/csstools/postcss-preset-env)

Файлы js проходят через babel

Для инклюда pcss и js файлов используется [gulp-include](https://github.com/wiledal/gulp-include)
