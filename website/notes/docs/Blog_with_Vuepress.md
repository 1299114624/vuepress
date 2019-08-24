---
sidebar: auto
sidebarDepth: 2
datetime: '2019-05-07'
category: 开发笔记
---

# 使用 Vuepress 搭建静态博客

## 前言

[VuePress](https://vuepress.vuejs.org/zh/guide/) 由两部分组成：一部分是支持用 Vue 开发主题的极简静态网站生成器，另一个部分是为书写技术文档而优化的默认主题。它的诞生初衷是为了支持 Vue 及其子项目的文档需求。

每一个由 VuePress 生成的页面都带有预渲染好的 HTML，也因此具有非常好的加载性能和搜索引擎优化（SEO）。同时，一旦页面被加载，Vue 将接管这些静态内容，并将其转换成一个完整的单页应用（SPA），其他的页面则会只在用户浏览到的时候才按需加载。

## 环境搭建

首先需要安装相关的依赖包

```
npm install -g vuepress
```

随后，新建一个空文件夹作为项目目录，新建一个 `README.md`，在项目目录下运行 `vuepress dev` 即可开启站点。通常情况下，访问 `http://localhost:8080` 即可看到。

如果站点目录不在项目根目录，比如放在 `/website` 下，则运行 `vuepress dev ./website`，访问的入口文件依然是 `/website/README.md`。

在项目根目录下使用 `npm init` 创建一个 `package.json`，输入如下内容

```json
{
  "scripts": {
    "start": "vuepress dev ./website"
  }
}
```

或

```json
{
  "scripts": {
    "start": "vuepress dev ./website"
  }
}
```

如此，就可使用 `npm start` 开启项目了。

## 配置文件

在站点目录下创建一个名叫 `.vuepress` 的文件夹，再在其中创建一个 `config.js` 即可。

注意: 项目根目录跟站点根目录并不相同，比如有如下结构

```
/
├─ node_modules
├─ dist
└─ website
   ├─ README.md
   ├─ .vuepress
   |  ├─ config.js
   |  ├─ public
   |  |  ├─ logo.png
   |  |  ├─ 404.png
   |  |  ├─ favicon.ico
   |  |  └─ manifest.json
   |  └─ theme
   |     ├─ Layout.vue
   |     └─ NotFound.vue
   └─ articles
      └─ index.md
```

其中 `/` 是项目根目录，`/website` 是站点根目录。

### 配置文件结构

`config.js` 结构如下

```js
module.exports = {
  title: '小强个人网站',
  description: '小强个人网站',
  dest: 'dist',
  configureWebpack: {},
  locales: {},
  head: [
    ['link', { rel: 'icon', href: `/logo.png` }],
    ['link', { rel: 'manifest', href: '/manifest.json' }]
  ],
  themeConfig: {},
  markdown: {}
}
```

### 常用配置

使用 `title` 添加站点标题

使用 `description` 添加站点描述

使用 `dest` 指定生成目录路径，默认 '.vuepress/dist'

使用 `head` 添加页面头部信息

使用 `host` 指定开发时服务主机名，默认 '0.0.0.0'

使用 `port` 指定开发时服务端口号，默认 8080

使用 `base` 指定部署站点的基础路径，如果你想让你的网站部署到一个子路径下，则需要设置它

使用 `locales` 提供多语言支持的语言配置

### webpack 配置

用于修改内部的 Webpack 配置。可以给定一个对象或者一个函数。

对象形式:

```js
const path = require('path')
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, '../static')
      }
    }
  }
}
```

函数形式:

```js
module.exports = {
  configureWebpack: (config, isServer) => {
    if (!isServer) {
      // 修改客户端的 webpack 配置
    }
  }
}
```

webpack 内置众多加载器(loader)，包括: pug、postcss、stylus、scss、sass、less，只需安装相关包即可，比如要使用 less 则只需要

```
yarn add -D less less-loader
```

其他的加载器也相同

```
yarn add -D sass-loader node-sass
```

```
yarn add -D pug pug-plain-loader
```

其中，stylus 是不需要另行安装的，vuepress 中已内置。

详细请参考: [https://vuepress.vuejs.org/zh/config/#构建流程](https://vuepress.vuejs.org/zh/config/#%E6%9E%84%E5%BB%BA%E6%B5%81%E7%A8%8B)

### markdown 配置

Vuepress 内置部分常用的 Markdown 插件，直接配置即可使用，也可增加自定义插件。

```js
module.exports = {
  markdown: {
    lineNumbers: true,
    externalLinks: { target: '_blank', rel: 'noopener noreferrer' },
    anchor: { permalink: true, permalinkBefore: true, permalinkSymbol: '$' },
    toc: { includeLevel: [1, 2, 3] },
    config: md => {
      md.use(require('markdown-it-sub'))
      md.use(require('markdown-it-sup'))
      md.use(require('markdown-it-mark'))
      md.use(require('markdown-it-ins'))
      md.use(require('markdown-it-abbr'))
      md.use(require('markdown-it-kbd'))
      md.use(require('markdown-it-underline'))
      md.use(require('markdown-it-footnote'))
      md.use(require('markdown-it-checkbox'))
      md.use(require('markdown-it-task-checkbox'))
      md.use(require('markdown-it-deflist'))
      md.use(require('markdown-it-smartarrows'))
      md.use(require('markdown-it-imsize'))
      md.use(require('markdown-it-implicit-figures'))
      md.use(require('markdown-it-inline-comments'))
      md.use(require('markdown-it-attrs'))
      md.use(require('markdown-it-math'))
      md.use(require('markdown-it-plantuml'))
    }
  }
}
```

详细请参考: [https://vuepress.vuejs.org/zh/config/#markdown](https://vuepress.vuejs.org/zh/config/#markdown)

## 主题模板

模板文件位于站点目录下的 `theme` 目录中，必须创建一个名为 `Layout.vue` 的文件，用于布局。

注意：一但在 `.vuepress` 目录下新建了 `theme` 文件夹，如果不写 `Layout.vue` 就会报错，一但写了 `Layout.vue` 就会使用该文件里的配置，不可以不写。

### 主题配置

在 `config.js` 中:

- theme: 当你使用自定义主题的时候，需要指定它。当值为 "foo" 时，VuePress 将会尝试去加载位于 `node_modules/vuepress-theme-foo/Layout.vue` 的主题组件。

- themeConfig: 为当前的主题提供一些配置，这些选项依赖于你正在使用的主题。

### 在 Vue 中调用站点信息

在 Vue 模板中可以调用配置文件中定义的部分配置项，比如配置文件 `config.js` 如下

```js
module.exports = {
  title: '小强个人网站',
  description: '小强个人网站',
  configureWebpack: {}
}
```

其中 `title` 和 `description` 可以直接使用 `this.$title` 和 `this.$description` 来访问其值。

其他站点信息可以使用 `this.$site` 访问。

使用 `this.$site` 可以访问以下列出的一些常用的站点信息

```json
{
  "title": "小强个人网站",
  "description": "小强个人网站",
  "base": "/",
  "pages": [
    {
      "key": "v-3d6c9af2ee6b4",
      "path": "/notes/docs/Blog_with_Vuepress.html",
      "title": "使用 Vuepress 搭建静态博客",
      "frontmatter": {}
    },
    ...
  ]
}
```

### 在 Vue 中调用页面信息

在 .md 页面文件头部可以添加 frontmatter，格式如下

```md
---
title: 测试
datetime: 2019-05-07
---
```

在 Vue 中，使用 `this.$page.frontmatter` 即可访问此 frontmatter 源数据，比如 `this.$page.frontmatter['title']` 或者 `this.$page.frontmatter.title` 输出的就是字符串 "测试"。

使用 `this.$page` 除了访问 frontmatter 外，还可以访问以下内容:

```json
{
  "path": "/notes/",
  "key": "v-806fde1c5e216",
  "title": "开发笔记",
  "frontmatter": {}
}
```

其中，`title` 会抓取 .md 中的第一个 `h1`，也就是第一个 `#`，其余内容将自动生成。

## Markdown 页面

一个 Markdown 页面包括一个 yaml 格式的 frontmatter 源数据，已经正文内容。

比如

```md
---
title: welcome to home
datetime: 2019-05-07
---

# welcome to home
```

### 在 Markdown 中使用 HTML 标签

在 Markdown 中，可以直接使用 HTML 标签。

比如，以下内容是合法的

```md
<div class='box'>
# Hello
## Hi
</div>

<style lang='stylus'>
.box
  margin 0 auto
</style>
```

这样，可以将一些页面特有的样式和脚本剥离。

### 在 Markdown 中使用 Vue 的模板语法

在 Markdown 中，可以直接使用 Vue 提供的模板语法。

比如

```md
<div v-for='(value, key) in $page'>{{key}} - {{value}}</div>
```

输出内容结构如下

```
key - v-642dc64f07a03
path - /notes/docs/Publish_NPM_Package.html
title - 如何发布自己开发的NPM包
frontmatter - { "sidebar": "auto", "sidebarDepth": 2, "datetime": "2019-05-07", "category": "开发笔记" }
```

### 在 Markdown 中使用 Vue 组件

甚至，可以在 Markdown 中直接调用 Vue 组件，Vue 组件位于站点根目录下的 `components` 目录下，比如我们创建一个 `aLink.vue` 的组件:

```vue
<template>
    <div class="alink">
        <a :href='$ensureExt(link)' :target="target">{{title}}</a>
        <span class="time" v-if="time">{{time}}</span>
    </div>
</template>

<script>
export default {
  props: ['href', 'title', 'time'],
  computed: {
    link () {
      return this.href || this.title
    },
    target () {
      if (!this.href) { return '_blank' }
    }
  }
}
</script>

<style>
.alink {
  display:grid;
  grid-template-columns 2fr 1fr
  border:1px dashed #ccc;
  margin-bottom: 1em;
  margin-right: 1em;
  padding: .4em 1em;
  border-radius: .2em;
}
</style>

```

则在 Markdown 中可以有如下几种形式的调用方式:

```md
<aLink title='https://vuepress.vuejs.org' />
<aLink href='./docs/Website_Collection_Common' title='精品网址收藏 - 常用网址' />
<aLink time='2018-06-05' href='./docs/Blog_with_Vuepress' title='使用 Vuepress 搭建静态博客' />
```

### Escaping

如果有一段代码，使用了 HTML 标签或者 Vue 的模板语法，而不希望其被解析，可以使用 `v-pre` 指令避免之。

```md
::: v-pre
`<div>{{ This will be displayed as-is }}</div>`
:::
```

如此，输出的就是

::: v-pre
`<div>{{ This will be displayed as-is }}</div>`
:::

## 打包并发布

其实现在很多代码托管平台都提供静态网站服务，直接将源代码编译打包上传到对应的平台，配置一下即可，如果不想要别人看到源代码，只上传编译后的代码即可。

打包命令 `vuepress build`

可以在 `package.json` 中配置:

```json
{
  "scripts": {
    "build": "vuepress build website",
    "push": "npm run build && npm run push:gitee",
    "push:gitee": "git add * && git commit -am 0 && git push gitee master"
  }
}
```

此时，只需要使用 `npm run push` 即可打包并上传到指定代码托管平台。

或者在项目目录下创建 `deploy.sh`：

```sh
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd dist

# 如果是发布到自定义域名
# echo 'www.yourwebsite.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果你想要部署到 https://USERNAME.github.io
git push -f git@github.com:1299114624/1299114624.github.io.git master

# 如果发布到 https://USERNAME.github.io/<REPO>  REPO=github上的项目
# git push -f git@github.com:USERNAME/<REPO>.git master:gh-pages

cd -
```

此时，只需要在 `Git Bash Here` 中使用 `bash deploy.sh` 即可一键发布到自己的 `github` 网站上去

详细请参考: [手把手教你使用 VuePress 搭建个人博客](https://www.cnblogs.com/softidea/p/10084946.html)
