const gulp = require("gulp"),
    sass = require("gulp-sass"),
    concat = require("gulp-concat"),
    cssnano = require("cssnano"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer")

gulp.task('scss-compile', function() {

    const distFolder = './css'
    const scssFolder = './stylesheets';

    const plugins = [
        autoprefixer({
            browsers: [
                "> 1%",
                "safari 8",
                "last 2 versions"
            ],
            flexbox: true,
            grid: false
        }),
        cssnano()
    ];

    return gulp.src([scssFolder + "/main.scss"])
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss(plugins))
        .pipe(gulp.dest(distFolder))

});
