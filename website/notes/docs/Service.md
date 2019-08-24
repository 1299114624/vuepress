---
sidebar: auto
sidebarDepth: 2
datetime: '2019-07-15'
category: 开发笔记
---

# Service 数据请求的两种设计

## 通过 defferred 对象链式调用

> 此方式输出一个函数并返回一个 defferred 对象，通过改变 defferred 对象的状态实现 .then 的链式调用

### service.js

首先 src 目录下新建一个 service 文件夹，新建一个 service.js

```javascript
import { baseMockUrl, isNeedMock, mockKeyArr } from '@/common/tools/mockData.js'
const Service = function() {}
// 'commonResult/queryCommonResult.action'
const commonQueryURL = window.capacityPlanFrameConfig.common.commonQueryURL

/**
 * 通用查询方法
 * @param {String} key 查询后台service key 非必要
 * @param {String} paramOpt 查询后台传参
 * @param {String} opt 其它配置，包括是否异步、使用的url
 * @return {*} 查询延迟对象
 */
Service.prototype.commonQuery = function (key, paramOpt, opt) {
    /*
        key "getIPGisBoundary"
        paramOpt { curLayer: "IP_AGG", curYear: 2020, id: null, level: null }
        opt undefined
    */
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
    // req.rawUrl = 'dist/static/json/config.json'
    /*
        req {
            url: "commonResult/queryCommonResult.action",
            data: {
                key: "getIPGisBoundary",
                projectd: "4981135087678000000",
                params: "{"sceneId":"10100000","curLocale":"zh_CN","schemeId":1,"level":null,"id":"null","curYear":2020,"curLayer":"IP_AGG"}"
            }
        }
    */
    return xhr(req)
}

// 参数查询 all
Service.prototype.queryConfigAll = function (opt) {
    const serviceKey = 'queryAllconfig'
    // "{"sceneId":"10100000","curLocale":"zh_CN","schemeId":1,"level":-1,"userId":"ywx654049","projectd":"4981135087678000000"}"
    const params = handleParams(opt)
    if (!isNeedMock || mockKeyArr.indexOf(key) > -1) {
        const req = {
            url: 'commonResult/queryFrameService.action',
            async: false,
            type: 'post',
            data: {
                projectId,
                key: serviceKey,
                params
            }
        }
        return xhr(req)
    } else {
        // QCC 接口平台MOCK模拟测试请求
        const defer = $.Defferred()
        $.ajax({
            async: false,
            url: baseMockUrl + 'mock/query',
            type: 'POST',
            data: {
                projectId: projectId,
                serviceKey: serviceKey,
                params: params
            },
            dataType: 'json'
        }).done(function (data) {
            defer.resolve(data)
        }).fail(errorHandler)
        return defer
    }
}

/**
 * 获取请求参数对象
 * @param {Object} paramOpt 请求参数配置
 * @return {String} 请求参数对象
 */
function handleParams(paramOpt) {
    const params = {
        sceneId: scene_id,
        curLocale: curLanguage,
        schemeId: window.capacitySchemeId
    }
    if (typeof paramOpt !== undefined) {
        for (const key in paramOpt) {
            if (paramOpt.hasOwnProperty(key)) {
                params[key] = paramOpt[key]
            }
        }
    }
    return JSON.stringify(params)
}

/**
 * 发送 ajax 请求
 * @param {Object} opt 请求配置
 * @return {*} 延迟对象
 */
function xhr(opt) {
    const defer = $.Defferred()
    // window.CapacityPlan.basePath http://unb61.huawei.com/NPCapacityPlanningWebsite/
    // undefined !== false 返回为 true
    $.ajax({
        async: opt.async !== false,
        url: opt.rawUrl || window.CapacityPlan.basePath + opt.url,
        type: opt.type || 'POST',
        data: opt.data || {},
        dataType: 'json'
    }).done(function (data) {
        defer.resolve(data)
    }).fail(errorHandler)
    return defer
}

/**
 * error 报错抛出
 */
function errorHandler() {
    console.error('ajax request error')
}

export default new Service()
```

这里的 xhr 函数可以返回一个 defferred 对象来用 .then 链式调用，但由于 $.ajax 本身也相当于返回一个 defferred 对象，所以也可以直接 return $.ajax({})

### Service.js 挂到 vue 原型上

使用时可直接在组件中使用 this.Service

```javascript
// main.js
import Service from '@/service/service.js'
Vue.prototype.Service = Service
```

我们在原子组件的 created 里执行获取数据的函数，做到数据的按需请求

### colorBar 组件

```vue
<template>
    <div class='chart-block'>
        <div class='chart-head'>
            <span v-text='title'></span>
        </div>
        <chart
        v-if='colorBarShow'
        class='color-bar'
        :ref='"colorBar" + opts.name'
        :options='colorBarOptions'
        auto-resize>
        </chart>
    </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import ChartOptions from './optionsUtil'
export default {
    props: {
        opts: Obeject
    },
    data() {
        return {
            title: this.opts.title || '',
            colorBarShow: false,
            chartData: []
        }
    },
    computed: {
        ...mapState(['id','curYear','curLayer']),
        ...mapGetters(['level']),
        colorBarOptions() {
            return ChartOptions(this.opts, this.chartData)
        }
    },
    watch: {
        curYear: function() {
            this.fetchChartData()
        }
    },
    created() {
        this.fetchChartData()
        this.bindEvents()
    },
    methods: {
        fetchChartData() {
            let addQueryParams = {}
            if (this.opts.addQueryParams) {
                addQueryParams = typeof this.opts.addQueryParams === 'function' ? this.opts.addQueryParams(this) : this.opts.addQueryParams
            }
            const reqParam = {
                level: this.level,
                id: this.id,
                curYear: this.curYear,
                curLayer: this.curLayer,
                ...addQueryParams
            }
            this.Service.commonQuery(this.opts.key, reqParam).then(res => {
                if (res && res.ret.returndata) {
                    this.chartData = res.ret.returndata
                    this.colorBarShow = true
                }
            })
        },
        bindEvents() {
            this.$root.$on('colorBarEvents', events => {
                for (const event of events) {
                    console.log(event.type)
                }
            })
        }
    }
}
</script>
```

### table 组件

可以在组件内定义 bindEvents 方法，在需要时 $emit 执行，以 table 为例，传入的配置信息中包含 gis 地图的事件，当点击 table 行时执行

table 的某一 config 配置信息:

```javascript
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
    {type: 'toPageLastIndex', value: 3}
]
```

table 原子组件执行事件：

```javascript
import tableEvent from './tools/tableEvents'
...
methods: {
    onRowClick(rowData, event, colunmn) {
        let messageArray = []
        if (Object.prototype.toString.call(this.message) === '[object Object]') {
            messageArray = this.message[colunmn.property] ? this.message[colunmn.property] : this.message.default
        } else {
            if (Array.isArray(this.message) && this.message.length > 0) {
                messageArray = this.message
            }
        }
        for (const msgItem of messageArray) {
            if (!tableEvent[msgItem.type]) {
                console.warn('Table do not have event type:' + msgItem.type)
                return
            } else {
                tableEvent[msgItem.type](this.msgItem, { rowData, event, colunmn })
            }
        }
    }
}
```

tableEvent 定义事件函数:

```javascript
const eventsMap = {
    /**
     * 自定义事件
     * @param {*} vm Vue
     * @param {*} event 用户配置事件
     * @param {*} tableData 点击table时，行的信息rowData,事件event,列的信息colunmn
     * @example {type: 'selfDefine', selfDefine(vm, rowData) {}}
     */
    selfDefine: function(vm, event, tableData) {
        const rowData = tableData.rowData
        event.selfDefine(vm, rowData)
    },
    /**
     * 页面跳转
     * @param {*} vm Vue
     * @param {*} event 用户配置事件
     * @param {*} tableData 点击table时，行的信息rowData,事件event,列的信息colunmn
     * @example {type: 'toPageLastIndex', value: 3}
     */
    toPageLastIndex: function(vm, event, tableData) {
        const rowData = tableData.rowData
        const nextPageIndex = vm.CapacityCommon.getNextPageIndex(vm.pageIndex, event.value)
        vm.pushBreadCrumb({
            pageIndex: nextPageIndex,
            name: rowData.name || rowData.areaName,
            id: rowData.id,
            level: rowData.level
        })
        vm.setPageIndex(nextPageIndex)
    },
    gisEvent: function(vm, event, tableData) {
        vm.$root.$emit('GisView', event.value)
    }
}
export default eventsMap
```

## 通过必报形式 import Service 类

### service.js

首先，新建一个 Service.js 输出一个 ES6 的类

```javascript
const basePath = window.basePath
const projectId = window.projectId
const curLanguage = window.curLanguage
const extendParams = params => {
    return $.extend({}, {
        projectId,
        lan: curLanguage
    },
    params)
}
class Service {
    constructor() {
        
    }
    static baseXhr(url, params, type) {
        if (!params) {
            params = {}
        }
        if (!type) {
            type = 'GET'
        }
        const allParams = extendParams(params)
        return new Promise((resolve, reject) => {
            $.ajax({
                url: basePath + url,
                type,
                data: allParams
            }).done(function(res){
                if (res.ret.returnData) {
                    let data = res.ret.data
                    resolve(data)
                } else {
                    reject('返回数据格式不对')
                }
            }).fail(function(err) {
                reject(err)
            })
        })
    }
    static getSchemes(params) {
        return this.baseXhr('scheme/queryScheme.action', params)
    }
    static getHeader(params) {
        return this.baseXhr('param/queryParam.action?schemeId=' + params.schemeid, params, 'POST')
    }
    static removeScheme(params) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: basePath + `scheme/deleteScheme.action?projectId=${projectId}&schemeId=${params.schemeId}&userId=${params.userId}`,
                type: 'post',
                data: {}
            }).done(function(res){
                if (res.ret.returnData) {
                    let data = res.ret.data
                    resolve(data)
                } else {
                    reject('返回数据格式不对')
                }
            }).fail(function(err) {
                reject(err)
            })
        })
    }
    static addScheme(params) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: basePath + `scheme/createScheme.action?projectId=${projectId}`,
                type: 'post',
                data: params
            }).done(function(res){
                if (res.ret.returnData) {
                    let data = res.ret.data
                    resolve(data)
                } else {
                    reject('返回数据格式不对')
                }
            }).fail(function(err) {
                reject(err)
            })
        })
    }
}
```

### Service.js 直接在组件引入

使用时可以直接 import  { Service } from '@/service/service'，可以选择 async 和 await 来等待前一个异步执行完后再执行下一个异步

```javascript
import  { Service } from '@/service/service'
...
methods: {
    async _initEx(callBack) {
        await this.getAllSchemes()
        await this.getFieldsByPost()
        callBack && callBack()
    },
    // 获取所有方案和当前选中的方案
    getAllSchemes() {
        return newPromise((resolve, reject) => {
            Service.getSchemes().then(res => {
                this.allSchedules = []
                const data = res
                for (var index in data) {
                    this.allSchedules.push({
                        id: data[index].id,
                        label: this.getSchemesTitle(data[index].title)
                    })
                    if (data[index].defaultScheme) {
                        this.schemeId = data[index].id
                    }
                }
                resolve(true)
            }).catch(err => {
                console.log(err)
                reject(err)
            })
        })
    }
}
```

**await 后面需要跟一个异步操作，这里的 Service.getSchemes().then() 已经是一个异步操作，所以 getAllSchemes 函数可以不用返回一个 Promise 然后 resolve(true) 可以直接 return Service.getSchemes().then()**