---
sidebar: auto
sidebarDepth: 2
datetime: '2019-06-20'
category: 开发笔记
--- 

# webpack 篇

(友情链接)[https://www.cnblogs.com/libin-1/p/6596810.html]

## 项目结构之打包路径

```
├─ java
├─ resources
|  ├─ ...
|  └─ structs.xml
├─ webapp
|  ├─ appscene
|  |  ├─ 5GReady
|  |  ├─ capacityPlanSetting
|  |  ├─ index
|  |  |  ├─ dev
|  |  |  |  ├─ build
|  |  |  |  ├─ config
|  |  |  |  ├─ src
|  |  |  |  ├─ static
|  |  |  |  ├─ index.html
|  |  |  |  ├─ package.json
|  |  |  |  ├─ .eslintrc.js
|  |  |  |  └─ .gitignore
|  |  |  ├─ prod
|  |  |  |  ├─ dist
|  |  |  |  └─ index.jsp
|  |  |  ├─ prof
|  |  |  ├─ appHome.json
|  |  |  └─ .gitignore
|  |  └─ CapacityScene
|  |     └─ CapacityScene.js
|  ├─ jsp
|  ├─ js
|  ├─ css
|  ├─ META-INF
|  ├─ WEB-INF
|  ├─ favicon.ico
|  └─ js
```

在 config 文件夹 index.js 中可以修改打包输出的路径，在以上结构中，想在 dev 文件夹中打包的静态资源文件放到与之同级的 prod 文件夹中则需要修改以下文件

```javascript
module.exports = {
    build: {
        env: require('./prod.env'),
        index: path.resolve(__dirname, '../dist/index.html'),
        assetsRoot: path.resolve(__dirname, '../../prod'),
        assetsSubDirectory: 'dist/static',
        assetsPublicPath: ',/NPCapacityPlanningWebsite/appscene/index/prod',
    }
}
```

- index: 模板
- assetsSubDirectory: 除了 index.html 之外的静态资源要存放的路径
- assetsPublicPath: 代表打包后， index.html 里面引用资源的相对地址

## ie9和一些低版本的高级浏览器对es6新语法并不支持

出现这种状况时浏览器一般会报错 requires a Promise polvfill in this browser, 解决办法是安装 babel-polyfill

第一步，项目安装 babel-polyfill

```javascript
npm install --save-dev babel-polyfill
```

然后需要在 webpack.base.conf.js 里修改如下

**一定要注意 app 数组里的先后顺序，否则 gobal 对象里不会出现 _babelPolvfill: true 这组属性**

```javascript
module.exports = {
    entry: {
        app: ['babel-polyfill', './src/main.js']
    },
    ...
}
```

注意此时是在单 vue 项目里做此修改的，如果需要和别的 vue 项目一起放在一个框架中，这样写可能会导致 babel-polyfill 在框架引入我们的项目时报冲突。

此时在 webpack.base.conf.js 的 entry 里按照默认的不进行修改，而在 main.js 中做如下修改

```javascript
if (global && !global._babelPolyfill) {
    require('babel-polyfill')
}
```

## 将抽离的样式放入一个 css 文件

打包时会默认在 webpack.base.conf.js 使用 ExtractTextPlugin 将 js 里引入的 css 抽离出来，如果将它的 allChunks 设为 true 则会抽离成一个文件

```javascript
new ExtractTextPlugin({
    filename: utils.assetsPath('css/CapacityPlanning.css'),
    allChunks: true,
})
```

## 打包 js 成一个文件

默认打包会生成 app.js manifest.js vendor.js

如果想只生成一个 CapacityPlanning.js 则需要在 webpack.prod.conf.js 中注释掉以下三个实例

```javascript
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),
```

## 设置文件如何被解析

webpack.bae.conf.js 里

```javascript
    resolve: {
        extensions: ['.js', '.vue', '.json'], // 自动解析确定的拓展名，使导入模块时不带扩展名
        alias: { // 创建 import 或 require 的别名
        'vue$': 'vue/dist/vue.esm.js',
        '@': resolve('src'),
        }
    },
```