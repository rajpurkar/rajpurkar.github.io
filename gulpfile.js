const gulp = require('gulp')
const gutil = require('gulp-util')
const markdownToJSON = require('gulp-markdown-to-json')
const data = require('gulp-data')
const pug = require('gulp-pug')
const bower = require('gulp-bower')
const stylus = require('gulp-stylus')
const connect = require('gulp-connect')
const ghPages = require('gulp-gh-pages')
const rename = require('gulp-rename')
const marked = require('marked')
const moment = require('moment')
const _ = require('lodash')
const fs = require('fs')
var del = require('del')

const build_dir = './build/'
marked.setOptions({
  breaks: true
});

gulp.task('bower', () => {
  return bower()
    .pipe(gulp.dest(build_dir + 'bower_components/'))
})

gulp.task('copy_public', () => {
  return gulp
    .src('public/**/*')
    .pipe(gulp.dest(build_dir))
})

gulp.task('index', () => {
  return gulp.src('./views/index.pug')
    .pipe(pug())
    .pipe(gulp.dest(build_dir))
})

gulp.task('markdown-writing', (cb) => {
  return gulp.src('./writings/**/*.md')
    .pipe(gutil.buffer())
    .pipe(markdownToJSON(marked, 'writings.json'))
    .pipe(gulp.dest(build_dir + 'data/'))
})

gulp.task('bio', () => {
  return gulp.src('./views/bio.pug')
    .pipe(pug())
	.pipe(rename("index.html"))
    .pipe(gulp.dest(build_dir + 'bio/'))
})

gulp.task('writing', ['markdown-writing'], () => {
  return gulp.src('./views/writing.pug')
    .pipe(data(() => {
      const json_file = require(build_dir + 'data/writings.json')
      return {
        writings: _.sortBy(_.values(json_file), function (elem) {
          return -Date.parse(elem.start)
        }),
        moment: moment
      }
    }))
    .pipe(pug())
	.pipe(rename("index.html"))
    .pipe(gulp.dest(build_dir + 'writings/'))
})

gulp.task('clean:data', ['writing'], function () {
  return del(build_dir + 'data/')
})

gulp.task('connect', () => {
  connect.server({
    root: build_dir
  })
})

gulp.task('css', () => {
  return gulp.src('./views/styles/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest(build_dir + 'stylesheets'))
})

gulp.task('deploy', () => {
  return gulp.src(build_dir + '**/*')
    .pipe(ghPages({branch: 'master'}))
})

gulp.task('content', ['writing'])
gulp.task('default', ['bower', 'content', 'css', 'copy_public', 'clean:data', 'index', 'bio'])
