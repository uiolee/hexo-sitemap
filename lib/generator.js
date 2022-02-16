'use strict';

const micromatch = require('micromatch');
const { join } = require('path');
const { readFileSync } = require('fs');
const { encodeURL } = require('hexo-util');

module.exports = function(locals) {
  const { config } = this;
  const { sitemap, skip_render } = config;
  const { path, tags: tagsCfg, categories: catsCfg } = sitemap;
  const include = config.sitemap.include;
  const skipRenderList = [
    '**/*.js',
    '**/*.css'
  ];
  const includeList = [];
  if (Array.isArray(include)) {
    includeList.push(...include);
  } else if (typeof include === 'string') {
    if (include.length > 0) {
      includeList.push(include);
    }
  }
  if (Array.isArray(skip_render)) {
    skipRenderList.push(...skip_render);
  } else if (typeof skip_render === 'string') {
    if (skip_render.length > 0) {
      skipRenderList.push(skip_render);
    }
  }

  const posts = [].concat(locals.posts.toArray(), locals.pages.toArray())
    .filter(post => {
      return post.sitemap !== false && !isMatch(post.source, skipRenderList);
    })
    .sort((a, b) => {
      return a.updated - b.updated;
    });

  if (posts.length <= 0) {
    return;
  }

  function template(config) {
    const nunjucks = require('nunjucks');
    const env = new nunjucks.Environment(null, {
      autoescape: false,
      watch: false
    });

    env.addFilter('uriencode', str => {
      return encodeURL(str);
    });

    const src = config.sitemap.template || join(__dirname, '../sitemap.txt');
    const tmpl = nunjucks.compile(readFileSync(src, 'utf8'), env);
    return tmpl;
  }

  const data = template(config).render({
    config,
    posts,
    includeList,
    tags: tagsCfg ? locals.tags.toArray() : [],
    categories: catsCfg ? locals.categories.toArray() : []
  });

  return {path, data};
};

function isMatch(path, patterns) {
  return micromatch.isMatch(path, patterns);
}

