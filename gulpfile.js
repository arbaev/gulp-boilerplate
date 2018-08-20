'use strict'

const gulp         = require("gulp"),
      include      = require("gulp-include"),     // include & require любых файлов
      browserSync  = require("browser-sync").create(),
      sourcemaps   = require("gulp-sourcemaps"),
      sass         = require("gulp-sass"),
      autoprefixer = require("gulp-autoprefixer"),
      stylelint    = require('gulp-stylelint'),
      // uglify      = require("gulp-uglify"),
      // cssnano     = require("gulp-cssnano"), 
      // rename      = require("gulp-rename"),
      // prettify    = require("gulp-jsbeautifier"),
      // htmlmin     = require("gulp-htmlmin"),
      // del         = require("del"),
      pump         = require("pump"),
      babel        = require('gulp-babel'),
      pug          = require("gulp-pug");

const devpath = 'dev/',       // файлы разработки
      srcpath = 'src/',       // скомпилированные файлы
      buildpath = 'public/',  // минифицированные файлы
      viewspath = devpath + 'pug/',
      stylespath = devpath + 'sass/';

const reload = browserSync.reload;

// ====================================================
// ============== Локальная разработка src ============
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

// Компилируем SCSS в CSS, перед этим прогоняем scss через линтер
// обрабатывается только main.scss, все файлы подстилей должны инклюдится в нём: //= include file.scss
gulp.task('styles', ['lintstyles'], function () {
  return gulp.src(stylespath + 'main.scss')
    .pipe(include()).on('error', log)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', log))
    .pipe(autoprefixer({
      // список поддерживаемых браузеров: https://github.com/browserslist/browserslist#queries
      browsers: ['cover 99.5%'],
      cascade: true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(srcpath + 'css'))
    .pipe(browserSync.stream());
});

gulp.task('lintstyles', () => {
  return gulp.src(stylespath + '**/*.scss')
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

    gulp.watch(stylespath + "**/*.*", ['styles']);
    gulp.watch(viewspath + "**/*.pug", ['views']);
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
