const gulp = require("gulp");
const filter = require("gulp-filter");
const purify = require("gulp-purify-css");
const gzip = require("gulp-gzip");
const brotli = require("gulp-brotli");
const clean = require("gulp-clean");
const rename = require("gulp-rename");
const { series, parallel } = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");

// COMPRESSION HERE UNUSED - CUSTOM CONFIG IS COMPRESSING

// Corrects a metronic related css issue
// autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated
gulp.task('autoprefixer', () => {
  const autoprefixer = require('autoprefixer')
  const sourcemaps = require('gulp-sourcemaps')
  const postcss = require('gulp-postcss')

  return gulp.src('./src/*.css')
    .pipe(sourcemaps.init())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/angular-optimized'))
})

// Purify unused code.
gulp.task('purifyCSS', () => {
  return gulp.src('./dist/angular-optimized/*')
    .pipe(
      filter(["**/*.css", "!**/*.br.*", "!**/*.gzip.*"])
    )
    .pipe(
      purify(
        ['./src/app/**/*.ts', './src/app/**/*.html'],
        {
          info: true, // Outputs reduction information (like in the screenshot above)
          minify: true, // Minifies the files after reduction
          rejected: true, // Logs the CSS rules that were removed
          whitelist: ['*transition*', '*dimmer*'] // Ignored css classes
        }
      ),
    )
    .pipe(gulp.dest('./dist/angular-optimized'));
});

// # 2 | Genereate GZIP files
/*
Steps:
Read the optimized CSS in the Step #1
Apply gzip compression
*/
gulp.task("css-gzip", () => {
  return gulp
    .src("./dist/angular-optimized/*")
    .pipe(filter(["**/*.css", "!**/*.br.*", "!**/*.gzip.*"]))
    .pipe(gzip({ append: false }))
    .pipe(
      rename(path => {
        path.extname = path.extname + ".gz";
      })
    )
    .pipe(gulp.dest("./dist/angular-optimized"));
});

// # 3 | Genereate BROTLI files
/*
Steps:
Read the optimized CSS in the Step #1
Apply brotli compression
*/
/*gulp.task("css-br", () => {
  return gulp
    .src("./dist/angular-optimized/!*")
    .pipe(filter(["**!/!*.css", "!**!/!*.br.*", "!**!/!*.gzip.*"]))
    .pipe(brotli.compress())
    .pipe(
      rename(path => {
        path.extname =
          path.basename.substring(
            path.basename.lastIndexOf("."),
            path.basename.length
          ) + ".br";
        path.basename = path.basename.substring(
          0,
          path.basename.lastIndexOf(".")
        );
      })
    )
    .pipe(gulp.dest("./dist/angular-optimized"));
});*/

// # 4 | Clear ng-build CSS
/*
Delete style output of Angular prod build
*/
/*gulp.task("clear-ng-css", () => {
  return gulp
    .src("./dist/angular-optimized/!*")
    .pipe(filter(["**!/styles*.css"]))
    .pipe(clean({ force: true }));
});*/

/*
 ### Order of Tasks ###
 * Optimize the styles generated from ng build
 * Create compressed files for optimized css
 * Clear the angular build output css
 * Copy the optimized css to ng-bundle folder
 * Clear the temp folder
 */
exports.default = series(
  "autoprefixer",
  "purifyCSS"
  //parallel("css-gzip", "css-br")
  //"clear-ng-css"
);
