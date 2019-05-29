<template>
    <div class="code">
        <div class="code--title">
            <h2>{{title}}</h2>
            <small>{{description}}</small>
        </div>
        <div class="code--demo">
            <div class="code-content">
                <slot></slot>
            </div>
        </div>
        <div v-if="isShow" class="code--segmennt">
            <slot name="codeText"></slot>
        </div>
        <div class="code--button" v-if="$slots.codeText" @click="handleToggleShow">{{codeTextBtn}}</div>
    </div>
</template>

<script>
export default {
    props:['title', 'description'],
    data(){
        return{
            isShow: false,
            codeTextBtn: '显示代码'
        }
    },
    methods:{
        handleToggleShow(){
            this.isShow = !this.isShow;
            this.codeTextBtn = this.isShow ? '隐藏代码' : '显示代码'
        }
    }
}
</script>

<style lang="scss" scoped>
.code{
    .code--title {
        h2{
            padding: 0;
            margin: 0;
            border-bottom: none;
            font-size: 18px;
        }
        small {
        font-size: 14px;
        display: inline-block;
        margin: 10px 0;
        color: #5e6d82;
        }
    }
}
</style>

