---
sidebar: auto
sidebarDepth: 2
datetime: '2019-07-22'
category: 开发笔记
---

# vuex state 存储大量数据的方式

## 如何请求与改变数据

以在参数配置页面中保存和重置按钮的功能为例，首先请求大量数据后存储到 vuex 的 state 中并单独设一个默认的存储对象，在界面组件的 computed 里 mapState 出存储的数据。在界面更改 state 存储的数据时可以不通过 mutations，直接在界面组件中更改绑定的值

点击重置按钮时只需将 vuex 的 state 的默认存储对象重新赋值给 vuex 存储的数据即可，由于数据写在 computed 里，可以动态更新

点击保存时，将 vuex 的 state 里存储的参数配置发给后台进行保存即可

**假设有一个请求得到的对象记录了好几百条数据**

```json
{
    "s4TransEquipmentConfig":[
        "style": "ELECTRICAL",
        "type": "OSN9800 U64",
        "id": "1",
    ],
    "s1TransPlan":[],
    "s4PlanStrategy":[
        {
            "levelList":[
                "L2Layer",
                "L3Layer",
                "L4Layer"
            ],
            "areaTypeList":[
                "Develop5G",
                "Undev5G",
                "HighValue",
                "MidValue",
                "LowValue"
            ]
        }
    ]
}
```

vuex 的 state 如下

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
Vue.use(Vuex)
const store = new Vuex.Store({
    getters,
    state: {
        ...
        s4TransEquipmentConfig: null,
        s1TransPlan: null,
        s4PlanStrategy: null
    }
})
```

vuex 的 mutations.js 中，保存和重置功能如下

```javascript
const mutations = {
    SAVE_CONFIG_DATA(state, data) {
        state.resKeys = Object.keys(data)
        ...
        state.s4TransEquipmentConfig = data.s4TransEquipmentConfig
        state.s1TransPlan = data.s1TransPlan
        state.s4PlanStrategy = data.s4PlanStrategy
        state.storeDevice = {
            ...
            s4TransEquipmentConfig: _.cloneDeep(state.s4TransEquipmentConfig),
            s1TransPlan: _.cloneDeep(state.s1TransPlan),
            s4PlanStrategy: _.cloneDeep(state.s4PlanStrategy)
        }
    },
    RESET_DEVICE_CAP(state, val) {
        ...
        state.s4TransEquipmentConfig = _.cloneDeep(state.storeDevice.s4TransEquipmentConfig)
        state.s1TransPlan = _.cloneDeep(state.storeDevice.s1TransPlan)
        state.s4PlanStrategy = _.cloneDeep(state.storeDevice.s4PlanStrategy)
    }
}
export default mutations
```

界面组件将存储的数据写在 computed 里，不通过 mutations 也能改变 vuex 中 state 存储的值，下面组件中每次触发 add 事件， vuex 中存储的数据和界面显示的数据都会更新

```vue
<template>
    <div>
        <div v-for='(item, index) in s4PlanStrategy[0].areaTypeList' :key='index'>{{ item }}</div>
        <button @click='add'>add</button>
        <button @click='save'>save</button>
        <button @click='reset'>reset</button>
    </div>
</template>
<script>
import Services from '@/services/services'
import { mapState, mapMutations } from 'vuex'
export default {
    computed: {
        ...mapState(['s4TransEquipmentConfig', 's1TransPlan', 's4PlanStrategy', 'resKeys'])
    },
    created() {
        this.fetchConfigData()
    },
    methods: {
        ...mapMutations({
            saveConfigData: 'SAVE_CONFIG_DATA',
            resetDeviceCap: 'RESET_DEVICE_CAP'
        }),
        fetchConfigData() {
            Services.queryConfigAll().then(res => {
                if (res.ret.success) {
                    this.saveConfigData(res.ret.success)
                } else {
                    this.$message({
                        showClose: true,
                        title: this.$t('CAPCITY.MAIN.ERROR'),
                        message: this.$t('CAPCITY.MAIN.QUERY_ERROR'),
                        type: 'error'
                    })
                }
            })
        },
        click() {
            this.s4PlanStrategy[0].areaTypeList.push('test')
        },
        reset() {
            this.resetDeviceCap()
        },
        save() {
            let saveData = {}
            saveData = this.initSaveData()
            const bearPromise = Services.updateAllConfig({
                userId: window.userId,
                config: JSON.stringify(saveData)
            })
        },
        initSaveData() {
            const res = {}
            if (!this.resKeys) {
                return res
            }
            for (const key of this.resKeys) {
                res[key] = this[key]
            }
            return res
        }
    }
}
</script>
```

在 initSaveData 中，通过 for 循环来保存 vuex 中的数据

## 如何改变数据

我们从后台读取配置数据后，想要改变数值可以使用一个 select 选择列表来改变其绑定的值，再发送给后台进行保存，下拉列表的可选值是获取到对应选项所有数据的集合

假设 table表格有四行两列，每一个单元格包含了一个 select 下拉列表(也有可能包含了一个 input 输入框或 validate 校验 span 元素)，第一列包含了自定义的 input 输入框和下拉列表，第二列只有下拉列表

```vue
<template>
    <div>
        <el-table :data='s4TransEquipmentConfig' style='width:100%;min-width:1400px'>
            <!-- 设备/设备型号-->
            <el-table-column :label='$t("CAPACITY.BEAR.DEVICE_TYPE_SMP")' width='170'>
                <template slot-scope='scope'>
                    <el-select class='unbi-select' v-if='!scope.row.selfDefine' 
                    v-model='scope.row.type' placeholder='' size='small' @change='onDeviceChange(scope)'>
                        <el-option v-for='item in typeList' :key='item' :label='item' :value='item'>
                        </el-option>
                    <el-select>
                    <el-input class='unbi-input' v-else v-model='scope.row.type' size='small' 
                    v-validate='"required"' :name='scope.row.id + "type"' data-vv-delay='500'></el-input>
                    <span v-if='errors.has(scope.row.id + "type")' class='help is-danger db'
                    >{{errors.first(scope.row.id + 'type')}}</span>
                </template>
            </el-table-column>
            <!-- 设备/子架类型-->
            <el-table-column :label='$t("CAPACITY.BEAR.SUB_FRAME_TYPE")' width='170'>
                <template slot-scope='scope'>
                    <el-select class='unbi-select' v-model='scope.row.style' 
                    v-validate='"required"' :name='scope.row.id + "style"' placeholder='' size='small'>
                        <el-option v-for='item in subFrameTypeList' :key='item' :label='item.name' :value='item.value'>
                        </el-option>
                    <el-select>
                    <span v-if='errors.has(scope.row.id + "style")' class='help is-danger db'
                    >{{errors.first(scope.row.id + 'style')}}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
export default {
    data() {
        return {
            subFrameTypeList: [
                // 光电混合
                {value: 'MIXED', name: this.$t('CAPACITY.BEAR.MIXED')},
                // 光子架
                {value: 'OPTICAL', name: this.$t('CAPACITY.BEAR.OPTICAL')},
                // 电子架
                {value: 'ELECTRICAL', name: this.$t('CAPACITY.BEAR.ELECTRICAL')},
            ]
        }
    },
    computed: {
        ...mapState(['s4TransEquipmentConfig']),
        typeList() {
            const xorArr = this.getXorArr(this.s4TransEquipmentConfig)
            // 下拉列表的自定义选项
            return [...xorArr, this.$t(CAPACITY.MAIN.SELF_DEFINE)]
        }
    },
    methods: {
        // 获取设备型号下拉框内容
        getXorArr(configMap) {
            const deviceSet = new Set()
            for (const item of eqDefault) {
                deviceSet.add(item.type)
            }
            return [...deviceSet]
        }
    }
}
</script>
```

