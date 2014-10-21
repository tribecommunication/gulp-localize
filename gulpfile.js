var gulp = require('gulp');
var gulpLocalize = require('./');

gulp.task('default', function(){
  return gulp.src('test/index.html')
    .pipe(gulpLocalize({ path: 'test/locale' }))
    .pipe(gulp.dest('test/out'));
});
