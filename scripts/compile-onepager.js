const fs = require('fs');
const pug = require('pug');
const uglifyJs = require('uglify-js');

const minified = uglifyJs.minify(
  fs.readFileSync('src/roll20-onepager.js', { encoding: 'utf8' }),
  {
    // We need to preserve our IIFE for the bookmarklet to work!
    compress: { negate_iife: false },
    // Prefer single-quotes to double-quotes. Just means less escaping given it's being written to a HREF attribute.
    output: { quote_style: 1 }
  });

const html = pug.renderFile('src/onepager.pug', { bookmarklet: minified.code });

fs.writeFileSync('dist/onepager.html', html);
