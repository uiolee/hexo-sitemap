# hexo-sitemap
>generate sitemap.txt for hexo

## Install

```bash
npm i hexo-sitemap
```

## Uninstall

```bash
npm uninstall hexo-sitemap
```

## Config

`_config.yml` sample

```yaml
sitemap: 
    path: sitemap.txt
```

or

```yaml
sitemap: 
    path: sitemap.txt
    template: template.txt
    tags: true
    categories: true
    include: 
    - http://example.com
    - https://example.com
```

- path - sitemap path. (default: sitemap.txt)
- tags - Add site's tags to sitemap
- categories - Add site's categories to sitemap
- template - Custom template path. (default template: [./sitemap.txt](./sitemap.txt))
- include - other urls you want to add to sitemap.txt

## Exclude Posts/Pages

Add `sitemap: false` to the post/page's front matter.

## [License](./LICENSE)

Modified from [hexojs/hexo-generator-sitemap](https://github.com/hexojs/hexo-generator-sitemap)
