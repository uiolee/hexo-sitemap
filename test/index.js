'use strict';

require('chai').should();
const Hexo = require('hexo');
// const cheerio = require('cheerio');
const { deepMerge } = require('hexo-util');
// const { transform } = require('camaro');
// const { extname } = require('path');
const sitemapCfg = {
  path: 'sitemap.txt',
  tags: true,
  categories: true
};

describe('Sitemap generator', () => {
  const hexo = new Hexo(__dirname, { silent: true });
  hexo.config.sitemap = sitemapCfg;
  const defaultCfg = deepMerge(hexo.config, {
    sitemap: sitemapCfg
  });

  const Post = hexo.model('Post');
  const Page = hexo.model('Page');
  const generator = require('../lib/generator').bind(hexo);
  // const sitemapTmpl = require('../lib/template')(hexo.config);

  let posts = [];
  let locals = {};

  before(async () => {
    await hexo.init();
    let data = await Post.insert([
      { source: 'foo', slug: 'foo', updated: 1e8 },
      { source: 'bar', slug: 'bar', updated: 1e8 + 1 },
      { source: 'baz', slug: 'baz', updated: 1e8 - 1 }
    ]);
    await Promise.all(data.map(post => post.setTags(['lorem'])));
    await Promise.all(data.map(post => post.setCategories(['ipsum'])));
    posts = data;
    data = await Page.insert([
      { source: 'bio/index.md', path: 'bio/', updated: 1e8 - 3 },
      { source: 'about/index.md', path: 'about/', updated: 1e8 - 4 }
    ]);
    posts = posts.concat(data);
    posts = posts.sort((a, b) => a.updated - b.updated);
    locals = hexo.locals.toObject();
  });

  beforeEach(() => {
    hexo.config = deepMerge(hexo.config, defaultCfg);
  });

  it('default', async () => {
    const result = generator(locals);
    const reg = new RegExp('\\r\\n|\\r|\\n', 'g');
    let items = result.data.replace(reg, '\n');
    items = items.split('\n');
    result.path.should.eql('sitemap.txt');
    for (let i = 0; i < posts.length; i++) {
      items[i + 1].should.eql(posts[i].permalink);
    }
  });


  describe('skip_render', () => {
    it('array', () => {
      hexo.config.skip_render = ['foo'];

      const result = generator(locals);
      result.data.should.not.contain('foo');
    });

    it('string', () => {
      hexo.config.skip_render = 'bar';

      const result = generator(locals);
      result.data.should.not.contain('bar');
    });

    it('string - off', () => { // coverage branch 100%
      hexo.config.skip_render = '';

      const result = generator(locals);
      result.should.be.ok;
    });

    it('invalid type', () => {
      hexo.config.skip_render = { foo: 'bar' };

      const result = generator(locals);
      result.should.be.ok;
    });

    it('off', () => {
      hexo.config.skip_render = null;

      const result = generator(locals);
      result.should.be.ok;
    });
  });

  describe('include', () => {
    it('array', () => {
      hexo.config.sitemap.include = ['https://github.com/'];

      const result = generator(locals);
      result.data.should.contain('https://github.com/');
    });

    it('string', () => {
      hexo.config.sitemap.include = 'https://github.com/';

      const result = generator(locals);
      result.data.should.contain('https://github.com/');
    });

    it('string - off', () => { // coverage branch 100%
      hexo.config.sitemap.include = '';

      const result = generator(locals);
      result.should.be.ok;
    });

    it('invalid type', () => {
      hexo.config.sitemap.include = { foo: 'https://github.com/' };

      const result = generator(locals);
      result.should.be.ok;
    });

    it('off', () => {
      hexo.config.sitemap.include = null;

      const result = generator(locals);
      result.should.be.ok;
    });

  });
});

it('No posts', async () => {
  const hexo = new Hexo(__dirname, { silent: true });
  hexo.config.sitemap = {
    path: 'sitemap.txt'
  };
  const Post = hexo.model('Post');
  const generator = require('../lib/generator').bind(hexo);

  await Post.insert([]);
  const locals = hexo.locals.toObject();
  const result = typeof generator(locals);

  result.should.eql('undefined');
});
