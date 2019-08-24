---
sidebar: auto
sidebarDepth: 2
datetime: '2019-06-20'
category: 开发笔记
---

# 一种大型可复用项目的模块化开发思想

组件和数据分离，所有数据请求的url和格式单独放在一个配置对象里，可复用方案分别有其对应的配置文件

项目结构

```
├─ common
├─ components
|  ├─ gis
|  ├─ table
|  ├─ chart
|  └─ others
├─ config
|  ├─ atom
|  |  ├─ gis
|  |  ├─ table
|  |  ├─ common
|  |  ├─ chart
|  |  └─ others
|  ├─ scene
|  |  ├─ 5g-ready
|  |  └─ np
|  └─ frameMain.js
├─ lang
├─ service
├─ store
├─ views
└─ main.js
```

## main.js

在 main.js 里通过模块化方式引入 Service 请求文件，将请求数据的方式通过原型链写在 vue 实例的原型上。

```javascript
import Service from '@/service/service.js'
Vue.prototype.Service = Service
```

## Service.js

Sevice.js 记录了数据的请求代码，业务侧请求的配置文件详见 config__atom__common__index.js。

Service.prototype.commonQuery 返回的是一个 deferred 延迟对象，在 config__atom__common__index.js里使用 .then 来执行成功回调的过滤函数（我们以前常用的是 $.ajax().then()，这里的 $.ajax() 也是返回了一个 deferred 延迟对象）。

关于 deffered 介绍详见 [deferred](http://www.ruanyifeng.com/blog/2011/08/a_detailed_explanation_of_jquery_deferred_object.html)

关于 .then 和 .done 的介绍详见 [jquery手册](http://jquery.cuishifeng.cn/deferred.then.html)

```javascript
const Service = function() {}
const commonQueryURL = window.capacityPlanFrameConfig.common.commonQueryURL
/**
* 通用查询方法
* @param {String} key 查询后台service key 非必
* @param {Object} paramOpt 查询后台传参
* @param {Object} opt 其它配置，包括是否异步、使用的url
* @param {*} 查询延迟对象
*/
Service.prototype.commonQuery = function(key, paramOpt, opt) {
    const reqUrl = basePath + commonQueryURL
    const params = handleParams(paramOpt)
    const req = {
        url: reqUrl,
        data: {
            projectId,
            params
        }
    }
    if (key) {
        req.data.key = key
    }
    if (opt) {
        if (opt.url) {
            req.url = basePath + opt.url
        }
        if (opt.wholeUrl) {
            req.url = opt.wholeUrl
        }
        if (opt.async) {
            req.async = opt.async
        }
    }
    if (isNeedMock && mockKeyArr.indexOf(key) > -1) {
        req.url = baseMockUrl + key
    }
    return xhr(req)
}
/**
* 发送ajax 请求
* @param {Object} opt请求配置
* @return {*} 延迟对象
*/
function xhr(opt) {
    const defer = $.Deferred()
    $.ajax({
        async: opt.async !== false,
        url: opt.url,
        type: opt.type || 'POST',
        data: opt.data || {},
        dataType: 'json'
    }).done(function (data) {
        defer.resolve(data)
    }).fail(errorHandler)
    return deffer
}
/**
* error 报错抛出
*/
function errorHandler() {
    console.log('ajax request error')
}
export default new Service()
```

业务侧的 vm.Service.commonQuery('getMenuData') 必须返回一个 deferred 对象才能在请求得到结果之后执行过滤函数，而不是在请求结束后立刻执行过滤函数。

（假设 vm.Service.commonQuery('getMenuData') 是一个耗时很长的请求，这个请求延时 5s 执行 alert ，如果 vm.Service.commonQuery('getMenuData')没有返回一个 deferred 对象，则会立即执行 .then() 函数然后再等 5s 执行 alert，起不到延时的作用）

## config 配置文件

config 文件夹里包括不同场景的配置文件（为了复用，结构大体相同，但内容不同）和基本组件的配置文件

### scene 场景方案配置文件

以 5g-ready 为例，在 config__scene__5g-ready__index.js 里预先规定好该方案的 gis 谷歌地图和 rightPanel 右侧折叠面板中将要用到的所有事件名。rightPanel 内部的基本组件将要用到的事件名放在 config__atom 里，具体配置将在下一节详讲。其结构大致如下：

```
scene
├─ 5g-ready
|  ├─ page-tools
|  |  ├─ filterPanel.js
|  |  ├─ modalDialog.js
|  |  └─ ...
|  └─index.js
...
```

page-tools 中存放谷歌地图与用户交互的事件名，如点击出现弹窗，点击过滤面板过滤谷歌地图上自己画的点线面等。index.js 里输出不同页面不同图层的事件名，目前的图层有4层，分别为全市级，区域级，站点级，设备级的图层，每个图层都有其对应的谷歌地图展示图例和右侧面板的详情数据。例如 IP-ACC-1 对象里包含了IP设备在接入层里的全市级图层的地图配置和数据配置

```javascript
/**
* @desc 5g场景配置
*/
import pageTools from './page-tools'
import rightCover from '@/config/atom/right-panel/cover'
// 业务原子组件
import atom from '@/config/atom'
import {gp, gc, gm} from '@/config/atom/gis'
import { rightPanelTools, collapse, back, path } from '@/config/atom/right-panel'
/**
 * 配置项
 * 
 * @config  common - 公共配置项
 *  @config  beforeRender - 渲染前做的工作
 *  @config  levelRule - 查询后台的传参
 *  @config  commonQueryURL - 公共查询的URL值
 *  @config  gisPrepare - gis提前准备工作
 *  @config  rightPanelTools - 右侧面板工具栏配置
 * @config  pageMap - 页面显示内容的配置项
 *  @config  [pageIndex] - 当前层次
 *  @config  gis - GIS配置
 *  @config  rightPanel - 右侧面板配置
 *  @config  pageTools
 */
 export default {
    common: {
        beforeRender: atom.common.beforeRender5G,
        levelRule: atom.common.levelRule5G,
        commonQueryURL: 'commonResult/queryCommonResult.action',
        gisPrepare: gp.gisPrepare,
        rightPanelTools: rightPanelTools,
        backEvents: back,
        pathEvents: path
    },
    pageMap: {
        /**
        * IP 当前页面主页
        * ACC 接入层，外部输入框架层次，全部层次配置使用All
        * @params {Number} pageIndex 当前层次
        */
        'IP-ACC-1': {
            gis: [
                {
                    content: [gc.boundary_keyMessage_level4, gc.sitePointInitHide, gc.siteLineInitHide],
                    message: {
                        clickGeometryCollection: gm.cityRegionClick5G,
                        clickPoint: gm.regionSiteClick,
                        clickLineString: gm.regionSiteClick,
                        clickNone: gm.regionClickNone
                    }
                }
            ],
            rightPanel: [
                {
                    // index: 0 索引，非必要，数量过多时方便阅读查看
                    // type: 'collapse' 默认是折叠栏
                    // exclusive: true 折叠栏是否互斥，不配置默认互斥
                    content: [
                        collapse.cityStatisticAcc, collapse.regionStatistic, collapse.siteStatistic, collapse.linkStatistic, collapse.ringChainStatistic, collapse.deviceStatistic, collapse.boardStatistic, collapse.portStatistic
                    ]
                }
            ]
        },
        ...
    }
 }
```

gis 和 rightPanel 中存储了谷歌地图和折叠面板的事件方法名，atom.common.beforeRender5G里规定了页面加载前的数据请求

### frameMain.js

引入 index.js 输出的对象，根据使用场景 sceneId 选取配置挂载到 window 对象上。

```javascript
import scene5GReadyConfig from '@/config/scene/5g-ready/index.js'
import sceneNPConfig from '@/config/scene/np/index.js'
const sceneConfigMap = {
    10100000: scene5GReadyConfig,
    10600620: sceneNPConfig
}
window.capacityPlanFrameConfig = sceneConfigMap[window.sceneId]
```

### atom 所有原子组件数据来源的配置文件

atom 文件夹中记录了所有公共组建的基本配置信息，具体的组件和方法得去 components 文件夹中找，每个组件都有一个 bindEvents 方法通过 $on 接受绑定事件，在 atom 配置信息里通过 vm.$emit 来规定将要触发的事件

```
atom
├─ rightPanel
|  ├─ collapse.js
|  └─ ...
├─ table
|  ├─ index.js
|  └─ column.js
├─ common
|  └─ index.js
├─ ...
└─ index.js
```

atom__rightPanel__collapse.js：

```javascript
import table from '@/config/atom/table'
import others from '@/config/atom/others'
export default {
    // 设备现状
    deviceCurStatus: {
        name: 'deviceCurStatus',
        title: I18N.DEVICE_CUR_STATUS,
        compList: [textCard.deviceBasicInfoDialog, others.devicePanel, table.deviceBoardInfo, table.devicePortInfo]
    },
    ...
}
```

atom__table__index.js：记载了所有table的配置，根据不同场景scene配置中的折叠面板collapse配置来从中挑选

```javascript
import column from './column.js/'
/**
* @desc 表格 原子配置
*
* @config type: 组件类型
* @config opts: 显示内容配置
*   @config title: I18N.ADMIN_STATISTIC 表格title描述
*   @config clickable: false 行是否可点击
*   @config hasPagination: false 是否有翻页
*   @config getSpanParams: function(){}获取合并单元格数据Step 1
*   @config config: function(vm) {
*                    return {
*                       hasSearch: false,// 不配时默认为有搜索框
*                       columns: []
*                       more: {
*                           title: '',
*                           columns: []
*                       }
*                    }   
*                   }// 表格列配置
*   @config config: data: {
*                       key: '',
*                       orderby: 'deviceReplace',
*                       orderSort: 'desc/asc',
*                   }// 表格请求数据配置
* @config message: 消息配置
*/
export default {
    // -------------行政区 start------------
    adminRegionStatistic: {
        type: 'Table',
        opts: {
            config: {
                columns: [columns.adminRegion, columns.portMerge],
                more: {
                    title:I18N.ADMIN_REGION_STATISTIC,
                    columns: [columns.boardMerge, columns.portMerge]
                }
            },
            data: {
                key: 'getIPNetPlanDistrictArea',
                orderby: 'deviceReplace'
            }
        },
        message: [
            {
                type: 'selfDefine',
                selfDefine(vm, rowData) {
                    vm.$root.$emit('GisView', [
                        {type: 'clearKeyMessage'},
                        {type: 'clearAllLayer'}
                    ])
                }
            },
            {type: 'toPageLastIndex', value: 2}
        ]
    },
    ...
}
```

atom__table__columns.js：table的列配置，包括表头名，数据的0转-处理等等

```javascript
import { NumberHandler, BusinessHandler } from '@/common/tools/dataHandler.js'
export default {
    //-----------common.start------------
    // 利用率 （%）
    useRatePercent: {
        prop: 'useRatio',
        label: 'I18N.USE_RATE_PERCENT'，
        align: 'right',
        sortable: true,
        formatter(row, column, value) {
            return NumberHandler.cleanNegaData(value, '-')
        }
    },
    // 总数
    totalCountSum: {
        prop: 'sum',
        label: 'I18N.SUM',
        align: 'center'
    },
    ...
}
```

atom__common__index.js：记录了在 App.vue 加载时，界面渲染前获取数据的函数

```javascript
export default {
    // 界面渲染前需要提前获取的参数
    beforeRender5G: function(vm) {
        const pageIndexPromise = new Promise((resolve, reject) => {
            // 当为非框架3.0时才需要查询
            vm.Service.commonQuery('getMenuData').then((res) => {
                if(res && res.ret.returnData) {
                    const result = res.ret.returnData
                    const curLayer = result[0].children[0].type
                    const startPageIndex = curLayer.replace('_','-') + '-1'
                    resolve({
                        startPageIndex,
                        curLayer,
                        menuRes: res.ret.returnData
                    })
                }
            })
        })
        const yearPromise = new Promise((resolve, reject) => {
            vm.Service.commonQuery('getYear').then(res => {
                if(res && res.ret.returnData) {
                    resolve(res.ret.returnData)
                }
            })
        })
        return Promise.all([pageIndexPromise, yearPromise]).then(resArr => {
            const startPageIndex = resArr[0].startPageIndex
            const curLayer = resArr[0].curLayer
            vm.$store.commit('setPageIndex', startPageIndex)
            vm.$store.commit('setCurLayer', curLayer)
            vm.$store.commit('initBreadcrumb', {
                name: window.gisInfo.city,
                index: startPageIndex
            })
            const yearArr = resArr[1]
            vm.$store.commit('initYear', yearArr)
            vm.$store.commit('setStoreValue', {
                key: 'menuRes',
                value: resArr[0].menuRes
            })
        })
    }
}
```

atom__index.js：只引入common.js 供场景配置使用

```javascript
/**
* @desc 业务相关原子组件
*/
import common from './common'
export default {
    common
}
```


## components

components 文件夹中存储所有原子组件，在页面中通过动态组件 :is 的方式引用，需要传入配置信息和数据信息

```
components
├─ base
├─ chart
├─ gis
├─ table
├─ tabletext
├─ global.js
...
```

### global.js

在 global.js 中注册所有的原子组件，再在 main.js 中引入 global.js

```javascript
import Vue from 'vue'
const requireComponent = require.context('.', true, /\.vue$/)
requireComponent.keys().forEach(fileName => {
    // 因为得到的 fileName 格式是 './baseButton.vue' 所以这里我们去掉头和尾，只保留真正的文件名
    const componentName = capitalizeFirstLetter(fileName.match(/w+(?=\.vue$)/)[0])
    const componentConfig = requireComponent(fileName)
    Vue.component(componentName, componentConfig.default || componentConfig)
})
/**
* 处理路径名
* @param {String} string 组件名字符串
* @returns {String} 命名规则
*/
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
```

### table.vue

table 组件以 props 中的 opts 接收当前组件的配置信息，该配置信息从 config 文件夹中读取，将一个动态数据请求函数传入 yuki-table 组件中

```vue
<template>
    <div>
        <div class='cp-table-head'>
            <span v-text='opts.title'></span>
        </div>
        <yuki-table
            :config='getTableConfig()'
            :data='getTableData()'
            :hasPagination='opts.hasPagination !== false'
            :row-click='opts.clickable === false ? null : onRowClick'
            loading>
        </yuki/table>
    </div>
</template>
```

```javascript
import { getConfig, getData } from './tools/tableHandler.js'
export default {
    props: {
        message: Object,
        opts: Object,
        addParams: Object
    },
    methods: {
        getTableConfig() {
            return getConfig(this)
        },
        getTableData() {
            const params = {
                id: this.id,
                curYear: this.curYear,
                curLayer: this.curLayer,
                level: this.level,
                schemeId: window.capacitySchemeId,
                ...this.addParams
            }
            const dataFunc = getData(this, params)
            dataFunc.paramsKey = { curYear: this.curYear }
            return dataFunc
        },
        ...
    }
}
```

#### opts

从 views 文件夹中的页面组件中传给 table 组件的 opts 格式如下，opts 包含了表格的配置信息，表格数据需要在之后根据 key 请求后台得到

```js
{
    config: {
        hashSearch: false,
        columns: [
            {props: "deviceType", label: "设备型号", align: "left"},
            {props: "deviceReplace", label: "替换", children: [
                {props: "deviceReplace", label: "入网", align: "right", sortable: true},
                {props: "deviceReplaceOut", label: "退网", align: "right", sortable: true},
            ]}
        ]
    },
    data: {
        key: "getIPDeviceDetail",
        orderby: "deviceAdd"
    }
}
```

#### tableHandler.js

tableHandler.js 负责处理表格的配置对象和数据信息，通过在 table.vue 中给 getConfig 和 getData 传入 this 当前 vue 实例来拿到opts

```javascript
/** 
* 获取表格控件的 config 配置
* @param {Object} vm vue
* @return {Object} 表格控件的 config 配置
*/
export const getConfig = function (vm) {
    const tableConfigCfg = typeof (vm.opts.config) === 'function' ? vm.opts.config(vm) : vm.opts.config
    const dataParser = tableConfigCfg.dataParser ? tableConfigCfg.dataParser : _dataParser
    if (tableConfigCfg.hasSearch === false) {
        return {
            columns: tableConfigCfg.columns,
            dataParser
        }
    }
}
/** 
* 获取表格控件的 data 配置
* @param {Object} vm vue
* @param {Object} commonParams 公共查询参数
* @return {Object} 表格控件的 data 配置
*/
export const getData = function (vm, commonParams) {
    const tableDataCfg = vm.opts.data
    return fetchTableData({
        vm,
        key: tableDataCfg.key,
        orderby: tableDataCfg.orderby,
        orderSort: tableDataCfg.orderSort || 'desc',
        queryParams: {
            ...commonParams
        }
    })
}
/** 
* 表格查询传参
* @param {Object} Obj={vm, key, orderby, orderSort, queryParams} key，排序，其它
* @return {Promise} 查询Promise
*/
function fetchTableData({vm, key, orderby, orderSort, queryParams}) {
    const dataFunc = function (params) {
        return $.ajax({
            url: basePath + window.capacityPlanFrameConfig.common.commonQueryURL,
            type: 'POST',
            dataType: 'json',
            data: {
                projectId,
                key,
                params: JSON.stringify($.extend(
                    {
                    orderby,
                    orderSort
                    },
                    params,
                    queryParams
                ))
            }
        })
    }
    return dataFunc
}
```







