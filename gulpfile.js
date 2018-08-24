'use strict'

const gulp         = require('gulp'),
      include      = require('gulp-include'),       // include & require любых файлов
      browserSync  = require('browser-sync').create(),
      sourcemaps   = require('gulp-sourcemaps'),
      sass         = require('gulp-sass'),          // sass support
      autoprefixer = require('gulp-autoprefixer'),  // css autoprefixer
      stylelint    = require('gulp-stylelint'),     // styles linter
      newer        = require('gulp-newer'),         // filtering new files
      imagemin     = require('gulp-imagemin'),      // optimizing images (jpg)
      pngquant     = require('imagemin-pngquant'),  // optimizing images (png)
      postcss      = require('gulp-postcss'),
      normalize    = require('postcss-normalize'),  // at-import normalize.css
      precss       = require('precss'),             // precss syntax support
      postcssenv   = require('postcss-preset-env'), // cssnext syntax support
      perfectcss   = require('perfectionist'),      // prettify css files
      rename       = require('gulp-rename'),        // rename files
      // uglify      = require('gulp-uglify'),
      // cssnano     = require('gulp-cssnano'),
      // prettify    = require('gulp-jsbeautifier'),
      // htmlmin     = require('gulp-htmlmin'),
      // del         = require('del'),
      pump         = require('pump'),
      babel        = require('gulp-babel'),         // js babel converter
      pug          = require('gulp-pug');           // pug support

const devpath = 'dev/',       // файлы разработки
      srcpath = 'src/',       // скомпилированные файлы
      buildpath = 'public/',  // минифицированные файлы
      viewspath = devpath + 'pug/',
      imagespath = 'images/',
      stylespath = devpath + 'styles/';

const reload = browserSync.reload;

// ====================================================
// ============== Локальная разработка dev ============
// ====================================================

// Компилируем pug в html
// в задачу закидываются пуги в корне /pugs, остальные темплейты должны инклюдится в них
gulp.task('views', function buildHTML() {
  return gulp.src(viewspath + '*.pug')
    .pipe(pug({
        pretty: true
      })).on('error', log)
    .pipe(gulp.dest(srcpath))
    .pipe(browserSync.stream());
});

// Компилируем PostCSS + плагины в CSS & auto-inject into browsers
// обрабатывается только main.pcss, все файлы подстилей должны инклюдится в нём: //= include file.pcss
gulp.task('styles', function () {

  const processors = [ precss, normalize, postcssenv, perfectcss ];

  return gulp.src(stylespath + 'main.postcss')
    .pipe(sourcemaps.init())
    .pipe(include()).on('error', log)   // а нужен ли этот функционал при наличии @import от модуля sass? для css вроде нет, а для js нужен
    .pipe(sass().on('error', log))
    .pipe(postcss(processors).on('error', log))
    .pipe(rename(function (path) {
      path.extname = ".css";
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(srcpath + 'css'))
    .pipe(browserSync.stream());
});

// DEPRECATED! using 'styles' for now
// Компилируем SCSS в CSS, перед этим прогоняем scss через линтер
// обрабатывается только main.scss, все файлы подстилей должны инклюдится в нём: //= include file.scss
gulp.task('sass', ['lintstyles'], function () {
  return gulp.src(stylespath + 'main.scss')
    .pipe(include()).on('error', log)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', log))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(srcpath + 'css'))
    .pipe(browserSync.stream());
});

// Проверка SCSS файлов линтером, попка vendors исключается, так как код чужой
gulp.task('lintstyles', () => {
  return gulp.src( ['!' + stylespath + 'vendors/*.scss', stylespath + '**/*.scss'] )
    .pipe(stylelint({
      reporters: [
        {formatter: 'verbose', console: true}
      ],
      failAfterError: false
    }))
});

// Собрать скрипты в один файл и отбаблить
gulp.task('scripts', function() {
  return gulp.src(devpath + 'js/main.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(include({
      extensions: "js",
      hardFail: true,
      includePaths: [
        // пути, в которых будет искать файлы для инклюда
        __dirname + '/node_modules',
        __dirname + '/' + devpath + 'js'
      ]
    })).on('error', log)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(srcpath + 'js'))
    .pipe(browserSync.stream());
});

// Копирование изображений в папку src и сжатие их
gulp.task('images', () => {
  return gulp.src(devpath + imagespath + '**/*')
  .pipe(newer(srcpath + imagespath))
  .pipe(imagemin([
    pngquant(),
    ],{ verbose: true }))
  .pipe(gulp.dest(srcpath + imagespath))
})

// Static Server + watching styles and views files
gulp.task('serve', ['views', 'styles', 'scripts', 'images'], function() {

    browserSync.init({
        server: srcpath
    });

    gulp.watch(stylespath + '**/*.{scss, sass}', ['styles']);
    gulp.watch(viewspath + '**/*.pug', ['views']);
    gulp.watch(devpath + 'js/**/*.js', ['scripts']); //.on('change', reload);
});

// Задача по-умолчанию
gulp.task('default', ['serve']);


// ====================================================
// ================= Сборка DIST ======================
// ====================================================

// Удаляет buildpath
gulp.task('clean', function () {
  return del(buildpath);
});


// Компилирует PCSS, минифицирует, копирует в buildpath
gulp.task('styles-prod', ['styles'], function () {

  return gulp.src(srcpath + 'css/main.css')
    .pipe(cssnano({
                  discardComments: {removeAll: true},
                  autoprefixer: false
                }))
    .pipe(gulp.dest(buildpath + 'css'));
});

// Минифицирует html, копирует в buildpath
gulp.task('html-prod', ['views'], function () {

  return gulp.src(srcpath + 'index.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(buildpath));
});

// Минифицирует main.js, копирует в buildpath
gulp.task('js-prod', ['scripts'], function (cb) {
  pump([
        gulp.src(srcpath + 'js/main.js'),
        uglify(),
        gulp.dest(buildpath + 'js')
    ],
    cb
  );
});

// Сборка в продакшен
gulp.task('build', ['styles-prod', 'html-prod', 'js-prod']);


// ====================================================
// ===================== Функции ======================
// ====================================================

// Более наглядный вывод ошибок
var log = function (error) {
  console.log([
    '',
    '----------ERROR MESSAGE START----------',
    ('[' + error.name + ' in ' + error.plugin + ']'),
    error.message,
    '----------ERROR MESSAGE END----------',
    ''
  ].join('\n'));
  this.end();
}
