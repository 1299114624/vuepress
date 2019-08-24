/**
 * 扩展 VuePress 应用
 */
// import VueHighlightJS from 'vue-highlight.js';
// import 'highlight.js/styles/atom-one-dark.css';
// import Element from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

import util from './util' 

import './public/css/index.scss'

export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData // 站点元数据
}) => {
  // Vue.component('chart', VueECharts)
  Vue.use(util)
  Vue.prototype['$categories'] = Vue.prototype.$generateCates
}