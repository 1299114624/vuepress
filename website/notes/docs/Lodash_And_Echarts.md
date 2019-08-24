---
sidebar: auto
sidebarDepth: 2
datetime: '2019-08-22'
category: 开发笔记
---

# lodash 与自封装工具函数与 echarts

## lodash

(友情链接)[http://lodash.think2011.net/]

### 安装

```sh
npm install --save lodash
```

### main.js

```javascript
import lodash from 'lodash'
window._ = lodash
```

## 自封装工具函数

### 代码结构

```
├─ main.js
├─ common
|  └─ tools.js
|     └─ dataHandler.js
```

### dataHandler.js

(numeraljs友情链接)[http://numeraljs.com/]

```javascript
/** 
 * @desc 数据处理工具
 */
import numeral from 'numeral'
import I18N from '@/lang/i18n'
/** 
 * 数字处理
 */
const NumberHandler = {
/** 
 * @desc 处理较大数字
 * @param {*} input 输入
 * @param {Boolean} isRangeFormat 是否进行范围处理，默认进行范围处理
 * @return {String} 输出
 */
}
```

