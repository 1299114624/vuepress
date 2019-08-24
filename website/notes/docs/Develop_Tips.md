---
sidebar: auto
sidebarDepth: 2
datetime: '2019-06-19'
category: 开发笔记
---

# 编程小技巧

## 代码锁

现在有一个保存按钮，为了防止在保存结果返回前多次发送保存请求，我们可以在请求前上锁，请求后解锁（和防止连续快速点击的节流是两回事）

```javascript
if (this.canSaving) {
    this.canSaving = false // 点击完成后立刻把锁关闭
    const saveData = this.initSaveData()
    const bearPromise = Services.updateAllConfig({
        userId: window.userId,
        config: JSON.stringify(saveData)
    })
    Promise.all([bearPromise]).then((res) => {
        let value = false
        for (const item of res) {
            this.saveErrorMsg = item.ret.errorMsg
            if (item.ret && item.ret.success) {
                value = res && item.ret.success
            }
        }
        return value
    }).then((res) => {
        this.canSaving = true // 保存完成后放开锁
        ...
    })
}
```

## 少用 if 中的 ||

当需要在 if 中判断一个值是否等于多个值中的一个时，可以将多个值写在一个数组中，然后用 indexOf

```javascript
const showLst = ['10600620', '80400401']
if (showLst.indexOf(window.scene_Id) > -1) {
    this.isShow = true
} else {
    this.isShow = false
}
```

## 注意传给后台的参数类型

有时我们给后台发送请求时，传的 params 不是一个对象而是一个字符串

```javascript
Service.prototype.commonQuery = function (key, paramOpt, opt) {
    const reqUrl = basePath + commonQueryURL
    const params = handleParams(paramOpt)
    // 有时我们想临时在这里给后台多传一个东西作为验证，由于 handleParams 将 paramOpt 转换成了字符串，需要先解析
    // let params = handleParams(paramOpt)
    // params = JSON.parse(params)
    // params.solutionId = '90000153'
    // params = JSON.stringify(params)
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
```

## 注释的格式
/** */注释的话，你再调用类和方法的时候会出现提示，内容就是你写的注释。

```javascript
/**
 * 获取表格控件的data配置
 * @param {Object} vm vue
 * @param {Object} commonParams 公共查询参数
 * @return {Object} 表格控件的data配置
 */
export const getData = function (vm, commonParams) {
    const tableDataCfg = vm.opts.data
    return fetch TableData({
        vm,
        key: tableDataCfg.key,
        orderby: tableDataCfg.orderby,
        orderSort: tableDataCfg.orderSort || 'desc',
        queryParams: {
            ...commonParams,
            ...(typeof tableDataCfg.queryParams === 'function' ? 
            tableDataCfg.queryParams(vm) : 
            tableDataCfg.queryParams)
        }
    })
}
```

## getters 里不一定只能存值也能存函数

```javascript
// rightPanelTools 
const rightPanelTools = {
    '90000153': [],
    default: [exportBtn]
}
const getTools = (tools) => {
    return function (solutionId) {
        return tools[solutionId] ? tools[solutionId] : tools.default
    }
}
export default getTools(rightPanelTools)
```

接下来可以写一个配置对象引入该模块并将配置对象存储在 vuex 的 state 中，这样就能通过 getter 得到一个函数，通过传入不同的参数拿到不同的东西

将模块写进配置文件：

```javascript
import { rightPanelTools, collapse, back, path } from '@/config/atom/right-panel'
export default {
    common: {
        ...
        rightPanelTools: rightPanelTools,
        ...
    }
}
```

getters 内容如下：

```javascript
const getters = {
    // gis预置配置
    gisPrepare: state => state.common.gisPrepare,
    // 右侧面板工具栏配置
    rightPanelTools: state => state.common.rightPanelTools,
    // 返回上一层按钮事件
    backEvents: state => state.common.backEvents,
    // 面包屑事件
    pathEvents: state => state.common.pathEvents
}
```

在需要用的地方读取 vuex 中存的这个函数传入 solutionId

```javascript
computed: {
    ...mapGetters('frameConfig', ['rightPanelTools', 'pathEvents', 'backEvents']),
    rightPanelToolLst: function() {
        return this.rightPanelTools(window.solutionId)
    }
}
```

## vuex 的命名空间 namespaced

store 下的 index.js 引入 modules 文件并带有 namespaced: true，在使用前需要加上该命名空间

```javascript
import frameConfig from './modules/frameConfig.js'
const store = new Vuex.Store({
    state: {},
    getters,
    mutations,
    modules: {
        frameConfig
    }
})
```

frameConfig.js ：

```javascript
const getters = {
    // gis预置配置
    gisPrepare: state => state.common.gisPrepare,
    // 右侧面板工具栏配置
    rightPanelTools: state => state.common.rightPanelTools,
    // 返回上一层按钮事件
    backEvents: state => state.common.backEvents,
    // 面包屑事件
    pathEvents: state => state.common.pathEvents
}
export default {
    namespaced: true,
    getters
}
```

在引入时需在前方加上命名空间

```javascript
...mapGetters('frameConfig', ['rightPanelTools', 'pathEvents', 'backEvents'])
```

## 从 url 里拿 query 值

**http://domain.com/?search=a#hash**

?search=a 整个指的是 location.search, #hash 是 location.hash 或者叫 fragment, 而 query 则指的是以第一个 ? 开始，至行尾或者 # 结束，fragment 则以 # 开始，行尾结束

对 URL 在 # 之后的部分做变动不会刷新页面，你可以在浏览器的 console 里分别输入 window.location.hash='#hash' 和 window.location.search="?sa" 执行看看结果，后者是会刷新页面的。在HTML5中有 History API 可以不刷新页面对 URL 进行修改，就不用加一个 # 来防刷新了。另外有 # 分隔做单页应用的时候服务器那边也好处理

**http://unb61.huawei.com/NPCapacityPlanningWebsite/appscene/capacityPlanSettings/index.jsp?cur_project_id=40001452115555&cur_scene_id=1000800&schemeId=1**

要想在上述 url 中取得 schemeId 并挂载到 window 对象上时可以写一个方法

```javascript
methods: {
    getCapacitySchemeId() {
        const schemeIdMatchArr = /\.*schemeId=(\d*)/.exec(window.location.href)
        let capacitySchemeId = null
        if (schemeIdMatchArr) {
            capacitySchemeId = Number(schemeIdMatchArr[1])
        }
        window.capacitySchemeId = capacitySchemeId
    }
}
```

## 取得最高层级的 window 对象

当存在多个 iframe 嵌套时，我们想拿到最外面的 window 对象，则需要封装一个函数

```javascript
var getWindowTop = function(doc) {
    try {
        console.log(doc.parent.location.href)
        if (doc !== doc.parent) {
            return getWindowTop(doc.parent)
        }
        return doc
    }
    catch(e) {
        return doc
    }
}
```

使用时直接传入当前所在的 window 对象

```javascript
console.log(getWindowTop(window).solutionId)
```

## 文件夹模块集合成一个新的输出对象

```javascript
// index.js
import tools from './tools'
import rightCollapse from './collapse'
import rightBack from './back'
import rightPath from './path'

export const rightPanelTools = toos
export const collapse = rightCollapse
export const back = rightBack
export const path = rightPath
```

使用时

```javascript
import {rightPanelTools, collapse, back, path} from '@/config/atom/right-panel'
```

## 使用 vuex 控制某组件显隐

vuex 代码如下

```javascript
const mutations = {
    // 设置右侧覆盖
    setRightCover(state, val) {
        state.rightCover = {
            key: val.key,
            addParams: val.addParams
        }
    }
}
const getters = {
    rightCoverShow: (state) => {
        return state.rightCover && state.rightCover.key
    }
}
```

使用时 v-if 可以写在组件外面

```vue
<template>
    <right-cover v-if='rightCoverShow'>
    </right-cover>
</template>
<script>
import {mapGetters, mapMutations} from 'vuex'
export default {
    computed() {
        ...mapGetters('rightCoverShow', )
    },
    methods: {
        ...mapMutations(['setRightCover']),
        show() {
            this.setRightCover({
                key: 'rightChainDetail',
                addParams: {
                    id: rowData.id
                }
            })
        },
        goBack() {
            const curRightCover = window.capacityPlanFrameConfig.rightCover[this.rightCover.key]
            if (curRightCover && curRightCover.beforeBack) {
                curRightCover.beforeBack(this)
            }
            this.setRightCover({
                key: '',
                addParams: null
            })
        }
    }
}
</script>
```

**`window.capacityPlanFrameConfig.rightCover[this.rightCover.key]` 是 cover.js 中的一个对象，它的 beforeBack 规定了返回前执行的函数**

cover.js 的配置文件如下

```javascript
/**
 * @desc 右侧覆盖
 */
import I18N from '@/lang/i18n'
import textCard from '@/config/atom/text/text-card'
import table from '@/config/atom/table'
export default {
    // 环链详情
    rightChainDetail: {
        title: I18N.RING_CHAIN_DETAIL,
        compList: [textCard.ringChainDetail, table.deviceUpgradeTypeOnRing],
        beforeBack: function(vm) {
            vm.$root.$emit('legend', [
                {type: 'refresh', value: vm.$store.state.pageIndex}
            ])
        }
    },
    // 链路详情 环链信息
    linkInringDetail: {
        title: I18N.LINK_DETAIL,
        compList: [textCard.linkDetailstate, table.ringChainServiceState, table.ringChainList],
        beforeBack: function(vm) {
            vm.$root.$emit('GisView', [
                {type: 'clearLayer', value: ['ringDetailLinkPointLayer', 'ringDetailLinkLineLayer',
                'ringDetailRingPointLayer','ringDetailRingLineLayer', 'ringDetailRingLineLayerMidText']}
            ])
        }
    },
}
```

将 cover.js 输出对象挂载到 window 对象上的方式如下

config__scene__5g-ready__index.js

```javascript
/**
 * @desc np场景界面配置
 */
import pageTools from './page-tools'
import rightCover from '@/config/atom/right-panel/cover'
export default {
    common: {},
    pageMap: {},
    pageTools,
    rightCover
}
```

config__scene__frameMain.js

```javascript
import scene5GReadyConfig from '@/config/scene/5g-ready/index.js'
import sceneNPConfig from '@/config/scene/np/index.js'
const sceneConfigMap = {
    10100000: scene5GReadyConfig,
    10600620: sceneNPConfig
}
window.capacityPlanFrameConfig = sceneConfigMap[window.sceneId]
```

## 判断浏览器是否兼容IE

```javascript
const checkIECompatibility = () => {
    const userAgent = navigator.userAgent;
    let isIE = false;
    if (
        userAgent.indexOf('Trident') > -1 || userAgent.indexOf('compatible') > -1) &&
        userAgent.indexOf('MSIE') > -1 && !userAgent.indexOf('Opera') > -1)
    ) {
        isIE = true
    }
    return isIE
}
```

## 饿了么表格数据合并

假设一个表格有 10 行，我们想让第一列每两行合并一次，第二列的前三行合并，第二列的第四第五行合并，则传入的 spanMethod可以这样写

```javascript
spanMethod({row, column, rowIndex, columnIndex}) {
    const subrackNumberArr= [3,2,1,1,1,1,1]
    if (columnIndex === 0) {
        if (rowIndex % 2 === 0) {
            return {
                rowspan: 2,
                colspan: 1
            }
        } else {
            return {
                rowspan: 0,
                colspan: 0
            }
        }
    } else if (columnIndex === 1) {
        let spanIndex = 0
        for (let i = 0; i < subrackNumberArr.length; i++) {
            if (rowIndex === spanIndex) {
                return {
                    rowspan: subrackNumberArr[i],
                    colspan: 1
                }
            }
            spanIndex += subrackNumberArr[i]
        }
        return {
            rowspan: 0,
            colspan: 0
        }
    }
}
```

如果是动态数据请求，想把第二列相同数据的单元格行合并则可以写一个函数来输出上述的 subrackNumberArr

```javascript
const getSpanParam = function(res) {
    const total = res.length
    const subrackNumberArr = []
    if (res.length <= 0) {
        return []
    }
    // subrackNumber 指的是要进行比较数据是否相同的那个单元格 value 值
    let subrackNumber = res[0].subrackNumber
    let boardBusCount = 1
    for (let i = 1; i < res.length; i++) {
        if (res[i].subrackNumber === subrackNumber) {
            boardBusCount ++
        } else {
            subrackNumberArr.push(boardBusCount)
            boardBusCount = 1
            subrackNumber = res[i].subrackNumber
        }
    }
    subrackNumberArr.push(boardBusCount)
    return {
        subrackNumberArr,
        total
    }
}
const spanParamObj = getSpanParam(data)
```

## 所有样式可以放在一个文件夹中

可以在组件内不要包含 style 样式，直接全部提取到一个文件夹中，方便修改，使用时在 main.js 里引入

代码结构如下

```
atom
├─ main.js
├─ style
|  ├─ index.scss
|  ├─ gisTools.scss
|  └─ chart.scss
```

```scss
@import './chart.scss';
@import './gisTools.scss';
html {
    height: 100%;
    overflow: hidden;
}
#capacity-plan {
    /* 隐藏高德地图图标 */
    .amap-logo {
        display: none;
    }
    .leftWrapStyle > .left-wraper {
        border-top: 40px solid rgb(44,50,76);
        box-sizing: border-box;
    }
}
```
