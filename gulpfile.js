const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');
const inline_image = require('gulp-inline-image');
const uglify = require('gulp-uglify-es').default;

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
    return gulp.src(dir.sass).pipe(sass()).pipe(inline_image()).pipe(gulp.dest(dist + '/css'))
}

function compileViews(cb) {
    return gulp.src(dir.views).pipe(plumber()).pipe(pug()).pipe(gulp.dest(dist + '/views'));
}

function compileScreens(cb) {
    return gulp.src(dir.screens).pipe(plumber()).pipe(pug()).pipe(gulp.dest(dist + '/screens'));
}


function compileComponents(cb) {
    return gulp.src(dir.components).pipe(plumber()).pipe(pug()).pipe(gulp.dest(dist + '/components'));
}

function compileJs(cb) {
    return gulp.src(dir.js).pipe(uglify()).pipe(gulp.dest(dist + '/js'))
}

function watch() {
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
