<template>
    <div class="container">
        <content custom v-if="!data.categoryData">
        </content>
        <div class="datalist" v-if="data.categoryData">
            <h1>{{data.categoryData}}</h1>
            <div class="dataItem" v-for="category in categories">
              <aLink
              :time='category.frontmatter.datetime'
              :href='category.path'
              :title='category.title'></aLink>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      categories: []
    }
  },
  computed: {
    data () {
      return this.$page.frontmatter
    }
  },
  mounted () {
    console.log(222,this.$title,this.$description,this.$page)
    console.log(111,this.$page.frontmatter,'$site',this.$site)
    console.log(333,this.$categories(),'documentFilter',this.$documentFilter({
          category: this.data.categoryData
        }))
    this.compCates()
  },
  methods: {
    compCates () {
      // 过滤指定分类的所有文章
      if (this.$categories() && this.$categories()[this.data.categoryData]) {
        // 判断是否存在分类列表
        this.categories = this.$categories()[this.data.categoryData].sort((a,b)=>{
          return new Date(b.frontmatter.datetime) - new Date(a.frontmatter.datetime)
        })
      } else {
        // 若不存在, 从所有文章列表中获取
        this.categories = this.$documentFilter({
          category: this.data.categoryData
        }).sort((a, b) => {
          return new Date(b.frontmatter.datetime) - new Date(a.frontmatter.datetime)
        })
      }
    }
  },
  watch: {
    data () {
      this.compCates()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../public/css/config.scss';
.container {
  max-width: $navWidth;
  min-height: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
</style>

