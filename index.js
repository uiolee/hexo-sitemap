/* global hexo */
'use strict';

const { extname } = require('path');

hexo.config.sitemap = Object.assign({
  path: 'sitemap.txt',
  tags: true,
  categories: true
}, hexo.config.sitemap);

const config = hexo.config.sitemap;

if (typeof config.path === 'string' && !extname(config.path)) {
  config.path += '.txt';
}

hexo.extend.generator.register('sitemap', require('./lib/generator'));

