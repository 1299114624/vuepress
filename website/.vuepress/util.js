export const hashRE = /#.*$/
export const extRE = /\.(md|html)$/
export const endingSlashRE = /\/$/
export const outboundRE = /^(https?:|mailto:|tel:)/

export function normalize (path) {
  return path
    .replace(hashRE, '')
    .replace(extRE, '')
}

export function getHash (path) {
  const match = path.match(hashRE)
  if (match) {
    return match[0]
  }
}

export function isExternal (path) {
  return outboundRE.test(path)
}

export function isMailto (path) {
  return /^mailto:/.test(path)
}

export function isTel (path) {
  return /^tel:/.test(path)
}
// 解析文档路径，添加 html 后缀
export function ensureExt (path) {
  if (isExternal(path)) {
    return path
  }
  const hashMatch = path.match(hashRE)
  const hash = hashMatch ? hashMatch[0] : ''
  const normalized = normalize(path)

  if (endingSlashRE.test(normalized)) {
    return path
  }
  return normalized + '.html' + hash
}

// 过滤指定条件的文章
function documentFilter (filters) {
  // filters = {path, datetime, category, tag}
  return this.$site.pages.filter(page => {
    let path = page.path
    let datetime = page.frontmatter.datetime ? page.frontmatter.datetime : ''
    let category = page.frontmatter.category ? page.frontmatter.category : ''
    let tag = page.frontmatter.tag ? page.frontmatter.tag : ''

    if (filters.path && path) {
      return path.indexOf(filters.path) > -1
    }
    if (filters.datetime && datetime) {
      return datetime.indexOf(filters.datetime) > -1
    }
    if (filters.category && category) {
      return category.indexOf(filters.category) > -1
    }
    if (filters.tag && tag) {
      return tag.indexOf(filters.tag) > -1
    }
  })
}

function generateCates () {
    let cates = {}
    this.$site.pages.forEach(category => {
      if (category.frontmatter.category) {
        let cate = category.frontmatter.category
        if (!cates[cate]) {
          cates[cate] = []
          cates[cate].push(category)
        } else {
          cates[cate].push(category)
        }
      }
    })
    return cates
}

export default {
    installArr: [
    {
      name: '$ensureExt',
      func: ensureExt
    }, 
    {
      name: '$documentFilter',
      func: documentFilter
    }, 
    {
      name: '$generateCates',
      func: generateCates
    }
    ],
    install: function (_Vue) {
      this.installArr.forEach(item => {
        _Vue.prototype[item.name] = item.func
      })
    }
}