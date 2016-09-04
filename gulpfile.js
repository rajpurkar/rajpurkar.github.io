const gulp = require('gulp')
const gutil = require('gulp-util')
const markdownToJSON = require('gulp-markdown-to-json')
const data = require('gulp-data')
const pug = require('gulp-pug')
const bower = require('gulp-bower')
const stylus = require('gulp-stylus')
const connect = require('gulp-connect')
const ghPages = require('gulp-gh-pages')
const marked = require('marked')
const moment = require('moment')
const _ = require('lodash')


const build_dir = './build/'

gulp.task('bower', () => {
  return bower()
    .pipe(gulp.dest(build_dir + 'bower_components/'))
})

gulp.task('markdown', () => {
  return gulp.src('./projects/**/*.md')
    .pipe(gutil.buffer())
    .pipe(markdownToJSON(marked, 'posts.json'))
    .pipe(gulp.dest(build_dir))
})

gulp.task('copy_public', () => {
  return gulp
    .src('public/**/*')
    .pipe(gulp.dest(build_dir))
})

gulp.task('pug', ['markdown'], () => {
  return gulp.src('./views/index.pug')
    .pipe(data(() => {
        const json_file = require(build_dir + 'posts.json')
        return { 
          projects: _.reverse(_.sortBy(_.values(json_file), 'importance')),
          moment: moment
        }
      }))
    .pipe(pug())
    .pipe(gulp.dest(build_dir))
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
    .pipe(ghPages())
})

gulp.task('default', ['bower', 'markdown', 'pug', 'css', 'copy_public'])
