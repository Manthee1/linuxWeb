const gulp = require('gulp');
const sass = require('gulp-sass')(require('node-sass'));
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');
const inline_image = require('gulp-inline-image');
const uglify = require('gulp-uglify-es').default;
const webserver = require('gulp-webserver');
const del = require('del');

const dist = "./dist"
const src = "./src";
const tmp = "./tmp";
const dir = {
    sass: src + "/assets/styles/**/*.sass",
    views: src + "/views/**/*.pug",
    screens: src + "/screens/**/*.pug",
    js: src + "/assets/js/**/*.js",
}

function compileSass(destDir = "./dist") {
    return gulp.src(dir.sass).pipe(sass()).pipe(inline_image()).pipe(gulp.dest(destDir + '/assets/styles'))
}

function compileViews(destDir = "./dist") {
    return gulp.src(dir.views).pipe(plumber()).pipe(pug()).pipe(gulp.dest(destDir + '/views'));
}

function compileScreens(destDir = "./dist") {
    return gulp.src(dir.screens).pipe(plumber()).pipe(pug()).pipe(gulp.dest(destDir + '/screens'));
}

function compileJs(destDir = "./dist") {
    return gulp.src(dir.js).pipe(uglify()).pipe(gulp.dest(destDir + '/assets/js'))
}

async function moveOtherAssets(destDir = "./dist") { //img fonts
    await gulp.src(src + "/assets/img/**/*").pipe(gulp.dest(destDir + '/assets/img'));
    await gulp.src(src + "/assets/fonts/**/*").pipe(gulp.dest(destDir + '/assets/fonts'));
    await gulp.src(src + "/*.pug").pipe(plumber()).pipe(pug()).pipe(gulp.dest(destDir + "/"));
    return;
}

async function watch() {
    await build_dev();
    gulp.watch(src, build_dev);
    return;
}

async function build(destDir = dist) {
    //clear dest dir
    await del(destDir + "/**");
    await compileSass(destDir);
    await compileViews(destDir);
    await compileScreens(destDir);
    await compileJs(destDir);
    await moveOtherAssets(destDir);
}

async function build_dev() {
    return build(tmp);
}

async function build_prod() {
    return build(dist);
}

function serve() {
    return gulp.src(dist).pipe(webserver({
        port: 5000,
        livereload: true,
        open: true
    }));
}

exports.watch = watch
exports.build = build_prod
exports.serve = serve