<template>
    <div class="alink">
        <a :href='$ensureExt(link)' :target="target">{{title}}</a>
        <span class="time" v-if="time">{{time}}</span>
    </div>
</template>

<script>
export default {
  props: ['href', 'title', 'time'],
  computed: {
    link () {
      return this.href || this.title
    },
    target () {
      if (!this.href) { return '_blank' }
    }
  }
}
</script>

<style>
.alink {
  display:grid;
  grid-template-columns: 2fr 1fr;
  border:1px dashed #ccc;
  margin-bottom: 1em;
  margin-right: 1em;
  padding: .4em 1em;
  border-radius: .2em;
}
</style>
