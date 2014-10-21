var path = require('path');

var gutil = require('gulp-util'),
    merge = require('merge'),
    through = require('through2'),
    YAML = require('yamljs'),
    File = gutil.File;

const NAME = 'gulp-localize';
const REG = /\{{2}\s?([\w\.]+)\s?\}{2}/g;
const LOC = /\{{2}\s?\}{2}/g;

function err(msg) {
  return new gutil.PluginError(NAME, msg);
}

module.exports = function(opt){
  var options = merge({
    locales: ['en', 'it'],
    path: 'locale'
  }, opt);

  var locales = {};

  options.locales.forEach(function(locale){
    locales[locale] = YAML.load(options.path + '/' + locale + '.yml');
  });

  function get(key, locale) {
    return key.split('.').reduce(function(obj, key) {
      return (obj && key in obj) ? obj[key] : null;
    }, locales[locale]);
  }

  function transform(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', err('Streaming not supported'));
      return cb();
    }

    var text = file.contents.toString(enc),
        key,
        locale,
        match,
        result,
        string;

    for (locale in locales) {
      result = text.replace(LOC, locale);

      while ((match = REG.exec(result)) !== null) {
        key = match[1].trim();
        string = get(key, locale);

        if (string === null) {
          this.emit('error', err('Cannot find key "' + key + '" in locale ' + locale));
          return cb();
        }

        result = result.replace(match[0], string);
      }

      this.push(new File({
        cwd: file.cwd,
        base: file.base,
        path: path.join(file.base, locale, file.relative),
        contents: new Buffer(result)
      }));
    }

    cb();
  }

  return through.obj(transform);
};
