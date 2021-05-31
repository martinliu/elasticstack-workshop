---
title: "Windows 本地安装"
date: 2020-05-31T15:26:15Z
draft: false
weight: 14
---

## Install Hugo theme on your project

If you have git installed, you can include hugo-theme-techdoc repository into your core repository as submodule using `git submodule` within your project directory.

```
cd your_project
git submodule add https://github.com/thingsym/hugo-theme-techdoc.git themes/hugo-theme-techdoc
```

For more information read [the Hugo documentation](https://gohugo.io/getting-started/quick-start/).

## Or download Hugo theme on your project

If you have git installed, you can do the following at the command-line-interface within your project directory.

```
cd your_project/themes
git clone https://github.com/thingsym/hugo-theme-techdoc.git
```

## Configure

You may specify options in config.toml (or config.yaml/config.json) of your site to make use of this theme's features.

For an example of `config.toml`, see [config.toml](https://github.com/thingsym/hugo-theme-techdoc/blob/master/exampleSite/config.toml) in exampleSite.

```
2021-05-31T19:26:15Z
```

See [the Configuration documentation](../configuration/).

## Preview site

To preview your site, run Hugo's built-in local server.

```
hugo server -t hugo-theme-techdoc
```

Browse site on http://localhost:1313

