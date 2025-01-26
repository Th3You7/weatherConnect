import gulp from "gulp";
import sass from "gulp-sass";
import * as dartSass from "sass";
import browserSync from "browser-sync";
import uglify from "gulp-uglify";
import imagemin from "gulp-imagemin";
import htmlmin from "gulp-htmlmin";
import cleanCSS from "gulp-clean-css";
import { deleteAsync } from "del";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import rename from "gulp-rename";

const sassCompiler = sass(dartSass);
const bs = browserSync.create();

//define paths
const paths = {
  html: {
    src: "html/*.html",
    dest: "dist",
  },
  style: {
    src: "style/style.scss",
    dest: "dist/style/",
  },
  script: {
    src: "js/index.js",
    dest: "dist/script/",
  },
  icons: {
    src: "icons/*.{jpg,jpeg,png,svg}",
    dest: "dist/icons/",
  },
};

// Clean dist folder
// Clean dist folder
export const clean = async () => {
  await deleteAsync(["dist/**/*"]);
};

// Process HTML files
export const html = async () => {
  return gulp
    .src(paths.html.src)
    .pipe(sourcemaps.init())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(bs.stream());
};

// Process JavaScript files
export const script = async () => {
  return gulp
    .src(paths.script.src)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.script.dest))
    .pipe(bs.stream());
};

// Process SASS files
export const style = async () => {
  return gulp
    .src(paths.style.src)
    .pipe(sourcemaps.init())
    .pipe(sassCompiler().on("error", sassCompiler.logError))
    .pipe(
      autoprefixer({
        cascade: false,
        grid: "autoplace",
      })
    )
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.style.dest))
    .pipe(bs.stream());
};

// Optimize icons
export const images = async () => {
  return gulp
    .src(paths.icons.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.icons.dest))
    .pipe(bs.stream());
};

// Watch files
export const watch = async () => {
  bs.init({
    server: {
      baseDir: "./dist",
    },
  });

  gulp.watch("html/*.html", gulp.series("html"));
  gulp.watch("js/*.js", gulp.series("script"));
  gulp.watch("style/**/*.scss", gulp.series("style"));
  gulp.watch("icons/*", gulp.series("images"));
};

// Build task

export const build = gulp.series(
  clean,
  gulp.parallel(html, script, style, images)
);

// Default task
export default gulp.series(
  clean,
  gulp.parallel(html, script, style, images),
  watch
);
