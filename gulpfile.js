'use strict';

// Читаем содержимое package.json в константу
const pjson = require('./package.json');
// Получим из константы другую константу с адресами папок сборки и исходников
const dirs = pjson.config.directories;


const gulp = require('gulp');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const fileinclude = require('gulp-file-include');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');



// ЗАДАЧА: Сборка HTML
gulp.task('html', function() {
  return gulp.src(dirs.source + '/*.html')                  // какие файлы обрабатывать (путь из константы, маска имени)
    //.pipe(plumber({ errorHandler: onError }))
    .pipe(fileinclude({                                     // обрабатываем gulp-file-include
      prefix: '@@',
      basepath: '@file',
      indent: true
    }))
    //.pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))         // убираем комментарии <!--DEV ... -->
    .pipe(gulp.dest(dirs.build))
    .pipe(browserSync.reload({stream: true}))                           // записываем файлы (путь из константы)
});

// ЗАДАЧА: Локальный сервер
gulp.task('brSync', () => {
    browserSync.init({
        server: {
            baseDir: 'build' // здесь указываем корневую папку для локального сервера
        },
        port: 3000,                                             // порт, на котором будет работать сервер
        startPath: '/index.html',
    });
});




// ЗАДАЧА: Сборка css

gulp.task('sass', function(){

  return gulp.src('src/scss/*.scss')
  .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass()) // используем gulp-sass
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.reload({stream: true}))
});


// ЗАДАЧА: оптимизация изображений

gulp.task('imgmm', function() {
  gulp.src('src/images/*')
  .pipe(imagemin({
    progressive: true
  }))
  .pipe(gulp.dest('build/images'))
  .pipe(browserSync.reload({stream: true}))
});



// ЗАДАЧА: слежение

 gulp.task('watch', function() {
      gulp.watch('src/scss/*.scss', gulp.parallel('sass'));
      gulp.watch('src/images/*', gulp.parallel('imgmm'));
      gulp.watch('src/blocks/**/*.html', gulp.parallel('html'));
      gulp.watch('src/js/*.js', gulp.parallel('js'));
  // другие ресурсы
});

// ЗАДАЧА: Конкатенация и углификация Javascript
gulp.task('js', function () {
  return gulp.src([
      // список обрабатываемых файлов
      // dirs.source + '/js/bootstrap.bundle.js',
      // dirs.source + '/js/bootstrap.js',
      dirs.source + '/js/*.js',

    ])
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.reload({stream: true}))

});

// ЗАДАЧА: Очистка папки сборки
gulp.task('clean', function () {
  return del([                                              // стираем
    dirs.build + '/**/*',                                   // все файлы из папки сборки (путь иконстанты)
    '!' + dirs.build + '/readme.md'                         // кроме readme.md (путь из константы)
  ]);
});


// ЗАДАЧА: Сборка всего
gulp.task('build', gulp.series('clean',
  gulp.series('html','sass', 'js')
));


// ЗАДАЧА: Задача по умолчанию

gulp.task('default', gulp.parallel('build','brSync','watch'))


