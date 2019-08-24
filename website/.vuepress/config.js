const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  title: '个人网站', // 设置网站标题
  description: '叶硕强', //描述
  dest: 'dist',   // 设置输出目录
  port: 3000, //端口
  head: [
    ['link', { rel: 'icon', href: `/logo.png` }]
  ],
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('../static')
      }
    }
  },
  themeConfig: {
    logo: '/logo.png',
    locales: {
      '/': {
        nav: [
          { text: '妙笔生花', link: '/articles/' },
          { text: 'yuki控件库专栏', link: '/yuki/' },
          { text: '开发笔记', link: '/notes/' },
          { text: '收藏夹', link: '/favorite/' },
          { text: '个人网站', link: 'http://yeshuoqiang.cn/' },
          { text: 'GitHub', link: 'https://github.com/1299114624' }
        ]
      }
    }
  },
}