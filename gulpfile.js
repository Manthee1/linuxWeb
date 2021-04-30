const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');
const inline_image = require('gulp-inline-image');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();

const dist = "./dist"
const src = "./src";
const dir = {
    sass: src + "/sass/**/*.sass",
    views: src + "/views/**/*.pug",
    screens: src + "/screens/**/*.pug",
    components: src + "/components/**/*.pug",
    js: src + "/js/**/*.js",
}

function compileSass(cb) {
    return gulp.src(dir.sass).pipe(sass()).pipe(inline_image()).pipe(gulp.dest(dist + '/css')).pipe(browserSync.stream())
}

function compileViews(cb) {
    return gulp.src(dir.views).pipe(plumber()).pipe(pug()).pipe(gulp.dest(dist + '/views')).pipe(browserSync.stream());
}

function compileScreens(cb) {
    return gulp.src(dir.screens).pipe(plumber()).pipe(pug()).pipe(gulp.dest(dist + '/screens')).pipe(browserSync.stream());
}


function compileComponents(cb) {
    return gulp.src(dir.components).pipe(plumber()).pipe(pug()).pipe(gulp.dest(dist + '/components')).pipe(browserSync.stream());
}

function compileJs(cb) {
    return gulp.src(dir.js).pipe(uglify()).pipe(gulp.dest(dist + '/js')).pipe(browserSync.stream())
}

function watch() {
    browserSync.init({
        server: {
            baseDir: dist
        }
    })
    gulp.watch(dir.sass, compileSass)
    gulp.watch(dir.views, compileViews)
    gulp.watch(dir.screens, compileScreens)
    gulp.watch(dir.components, compileComponents)
    gulp.watch(dir.js, compileJs)
}

exports.sass = compileSass
exports.views = compileViews
exports.screens = compileScreens
exports.components = compileComponents
exports.js = compileJs
exports.watch = watch
