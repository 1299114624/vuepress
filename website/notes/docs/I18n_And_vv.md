---
sidebar: auto
sidebarDepth: 2
datetime: '2019-08-18'
category: 开发笔记
---

# 国际化 i18n 与表单验证 vee-validate

## vee-validate

(友情链接)[https://www.cnblogs.com/xxwang/p/6104715.html]

(官方英文文档)[https://baianat.github.io/vee-validate/]

### 代码结构

```
├─ main.js
├─ validate
|  ├─ validate.js
|  └─ validateCustomRules.js
```

### 安装

```sh
npm install vee-validate --save
```

### main.js

```javascript
import Vue from 'vue'
import VeeValidate from 'vee-validate'
// 自定义内置规则的错误信息
import veeDict from './validate/validate'
// 引入自定义规则
import {validatorExtend} from './validate/validateCustomRules'
validatorExtend(VeeValidate.Validator)
Vue.use(VeeValidate, {
    locale: curLanguage,
    dictionary: veeDict
})
```

### 自定义内置规则的错误信息

配置文件的 locale 表示 dictionary 对象的属性名，此时 main.js 里的 curLanguage可能是 zh_CN 或者 en_US 这两种

validate.js

```javascript
const veeDict = {
    zh_CN: {
        messages: {
            required: () => '该项为必填项',
            min_value: (field, val) => '该项必须大于等于'+ val,
            max_value: (field, val) => '该项必须小于等于'+ val,
            between: (field, val) => '请输入'+ val[0] + '~' + val[1] + '的整数',
            numeric: () => '请输入整数',
            decimal2: '请输入整数或最多两位小数位',
            numbercommas: '请输入整数和半角逗号'
        }
    },
    en_US: {
        messages: {
            required: () => 'The value must be entered',
            min_value: (field, val) => 'The value must be greater than or equal to' + val,
            max_value: (field, val) => 'The value must be less than or equal to' + val,
            between: (field, val) => 'Please input a number between' + val[0] + 'to' + val[1],
            numeric: () => 'Please input an integer',
            decimal2: '',
            numbercommas: 'Please input an integer and commas'
        }
    }
}
export default veeDict
```

### 引入自定义规则

validateCustomRules.js

```javascript
const rulesArr = [
    {
        name: 'decimal2',
        rules: {
            getMessage(field, params, data) {
                return (data && data.message) || 'Something went wrong'
            },
            validate(value) {
                return /^\d+([.]\d{1,2})?$/.test(value)
            }
        }
    },
    {
        name: 'numbercommas',
        rules: {
            getMessage(field, params, data) {
                return (data && data.message) || 'Something went wrong'
            },
            validate(value) {
                return /^[\d](,\d+)*$/.test(value)
            }
        }
    }
]
const validatorExtend = validatorArg => {
    rulesArr.forEach(el => {
        validatorArg.extend(el.name, el.rules)
    })
}
export {validatorExtend}
```

### 使用场景

```vue
    <el-input class='unbi-input' v-model='scope.row.type' size='small' 
    v-validate='"required"' :name='scope.row.id + "type"' data-vv-delay='500'></el-input>
    <span v-if='errors.has(scope.row.id + "type")' class='help is-danger db'
    >{{errors.first(scope.row.id + 'type')}}</span>
```

提醒: 错误信息里面的名称通常就是表单的 name 属性，除非是通过 Vue 实例传递进来的。

提醒: 养成好习惯，给每个 field 添加 name 属性，如果没有 name 属性有没有对值进行绑定的话，validator 可能不会对其进行正确的校验

## i18n

### 代码结构

```
├─ main.js
├─ lang
|  ├─ zh.js
|  └─ en.js
```

### 安装

```sh
npm install vue-i18n --save
```

### main.js

```javascript
import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)
const i18n = new VueI18({
    locale: curLanguage,
    messages: {
        'zh_CN': require('./lang/zh'),
        'en_US': require('./lang/en')
    }
})
```

**如果是多个 app 项目放在一个框架中，可以写一个对象来包含 i18n 的信息**

```javascript
import CapacityPlanning from './CapacityPlan'
import store from './store'
window.CapacityPlan = {
    i18nMessages: {
        'zh_CN': require('./lang/zh'),
        'en_US': require('./lang/en')
    },
    basePath: window.platformBasePath + 'NPCapacityPlanningWebsite/'
}
if (!global._babelPolyfill) {
    require('babel-polyfill')
}
const CapacityPlanningParamsSetting = {
    ...CapacityPlanning,
    store
}
// 组件全局注册
const components = [CapacityPlanningParamsSetting]
const install = function(Vue, opts = {}) {
    if (install.installed) {
        return
    }
    components.map(component => {
        Vue.component(component.name, component)
    })
}
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}
export default {
    install,
    CapacityPlanningParamsSetting
}
```

### zh.js

```javascript
module.exports = {
    CAPACITY: {
        CANCEL_SUCCESS: '取消成功',
        RESET_SUCCESS: '重置成功'
    },
    JOY: {
        next: '下一步',
        previous: '上一步',
    }
}
```

### en.js

```javascript
module.exports = {
    CAPACITY: {
        CANCEL_SUCCESS: 'Cancel success',
        RESET_SUCCESS: 'Reset success'
    },
    JOY: {
        next: 'Next',
        previous: 'Previous',
    }
}
```

### 使用场景

```vue
<template>
    <div>
        <span>{{$t('CAPACITY.BEAR.OPTIONAL_DEVICE_CONFIG')}}</span>
        <el-table>
            <el-table-column :label='$t("CAPACITY.BEAR.DEVICE_TYPE_SMP")'>111</el-table-column>
        </el-table>
    </div>
</template>
<script>
export default {
    data() {
        return {
            subFrameTypeList: [
                {value:'MIXED',name:this.$t('CAPACITY.BEAR.MIXED')},
                {value:'OPTICAL',name:this.$t('CAPACITY.BEAR.OPTICAL')},
                {value:'ELECTRICAL',name:this.$t('CAPACITY.BEAR.ELECTRICAL')},
            ]
        }
    },
    methods: {
        checkIsSingle(scope) {
            if (scope.row.levelList.length > 1) {
                this.$message({
                    showClose: true,
                    title: this.$t('CAPACITY.MAIN.ERROR'),
                    message: this.$t('CAPACITY.BEAR.AT_MOST_ONE'),
                    type: 'error'
                })
            }
        }
    }
}
</script>
```