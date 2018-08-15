'use strict'

const gulp        = require("gulp"),
      del         = require("del"),                // удалятор
      postcss     = require("gulp-postcss"),
      include     = require("gulp-include"),       // include & require любых файлов
      precss      = require("precss"),
      postcssEnv  = require("postcss-preset-env"), // расширение синтаксиса css (ex-nextcss)
      cssnano     = require("gulp-cssnano"), 
      browserSync = require("browser-sync").create(),
      sourcemaps  = require("gulp-sourcemaps"),
      rename      = require("gulp-rename"),
      prettify    = require("gulp-jsbeautifier"),
      normalize   = require("postcss-normalize"),
      htmlmin     = require("gulp-htmlmin"),
      uglify      = require("gulp-uglify"),
      pump        = require("pump"),
      babel       = require('gulp-babel'),
      pug         = require("gulp-pug");

const devpath = 'dev/',       // файлы разработки
      srcpath = 'src/',       // скомпилированные файлы
      buildpath = 'public/';  // минифицированные файлы

const reload = browserSync.reload;

// ====================================================
// ============== Локальная разработка src ============
// ====================================================

// Компилируем pug в html
// в задачу закидываются пуги в корне /pugs, остальные темплейты должны инклюдится в них
gulp.task('views', function buildHTML() {
  return gulp.src(devpath + 'pug/*.pug')
    .pipe(pug({
        pretty: true
      })).on('error', log)
    .pipe(prettify({
        indent_char: ' ',
        indent_size: 2
      }))
    .pipe(gulp.dest(srcpath))
    .pipe(browserSync.stream());
});


// Компилируем PostCSS + плагины в CSS & auto-inject into browsers
// обрабатывается только main.pcss, все файлы подстилей должны инклюдится в нём: //= include file.pcss
gulp.task('styles', function () {

  const processors = [ precss,
                       normalize,
                       postcssEnv ];

  return gulp.src(devpath + 'pcss/main.pcss')
    .pipe(include()).on('error', log)
    .pipe(rename(function (path) {
      path.extname = ".css";
    }))
    .pipe(sourcemaps.init())
    .pipe(postcss(processors).on('error', log))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(srcpath + 'css'))
    .pipe(browserSync.stream());
});

// Собрать скрипты в один файл и отбаблить
gulp.task('scripts', function() {
  return gulp.src(devpath + 'js/main.js')
    .pipe(include()).on('error', log)
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(gulp.dest(srcpath + 'js'))
    .pipe(browserSync.stream());
});

// Static Server + watching styles and views files
gulp.task('serve', ['views', 'styles', 'scripts'], function() {

    browserSync.init({
        server: srcpath
    });

    gulp.watch(devpath + "pcss/**/*.*", ['styles']);
    gulp.watch(devpath + "pug/**/*.pug", ['views']);
    gulp.watch(devpath + "js/**/*.js", ['scripts']); //.on('change', reload);
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
    "----------ERROR MESSAGE START----------",
    ("[" + error.name + " in " + error.plugin + "]"),
    error.message,
    "----------ERROR MESSAGE END----------",
    ''
  ].join('\n'));
  this.end();
}
