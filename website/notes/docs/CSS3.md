---
sidebar: auto
sidebarDepth: 2
datetime: '2019-07-02'
category: 开发笔记
---

# CSS3

## CSS选择器

### 属性选择器

- E[attribute] 表示存在 attr 属性即可
    div[class]
- E[attr=val] 表示属性值完全等于 val
    div[class='mydemo']
- E[attr*=val] 表示属性值里包含 val 字符并且在’任意‘位置
    div[class*='mydemo']
- E[attr^=val] 表示属性值里包含 val 字符并且在’开始‘位置
    div[class^='mydemo']
- E[attr$=val] 表示属性值里包含 val 字符并且在’结束‘位置
    div[class$='mydemo']

### 兄弟伪类选择器

- +为附近相邻的满足条件的元素 .first + li
- ~为满足条件的兄弟元素元素 .first ~ li

### 相对于父元素的结构伪类选择器

- li:first-child 查找 li 元素的父元素的第一个 li 元素
- li:last-child 查找 li 元素的父元素的最后一个 li 元素
- li:first-of-child 查找第一个满足要求的元素
- li:last-of-child 查找最后一个满足要求的元素
- li:nth-child(3||odd、even) 表示索引第3个元素
- li:empty 表示没有任何内容的li，包括空格
    ```css
    p:empty {
    display: none;
    }​
    ```
- E:target 通常结合锚点来使用，用来匹配文档(页面)的url的某个标志符的目标元素
- E:enabled 和 E:disabled 在某些表单元素如输入框，复选框等包含这些状态
- E:checked 单选和复选按钮的选中和未选中状态
- E:selection 用来匹配突出显示的文本(用鼠标选择文本时的文本)。浏览器默认情况下，用鼠标选择网页文本是以“深蓝的背景，白色的字体”显示的。
- E:not 否定选择器，就拿form元素来说，比如说你想给表单中除submit按钮之外的input元素添加红色边框，CSS代码可以写成
    ```css
    input:not([type="submit"]){
    border:1px solid red;
    }
    ```
- E:before 和 E:after 伪元素选择器，使用的场景最多的就是清除浮动
    - 是一个行内元素，如果想设置宽高则需要转换成块 display:block float:** position
    - 必须加 content，哪怕不设置内容，也需要 content:''
    - 0.5px 直线：
        ```css
        .box{
            position:relative
        }
        .box::after{
            content:'';
            position:absolute;
            left:0;
            top:0;
            width:100%;
            height:1px;
            background-color:#ccc;
            transform:scaleY(.5)
        }
        ```
    - 和伪元素无关，但也写在这，实心小三角：
        ```css
        .box1{
            width: 0;
            height: 0;
            border:20px solid;
            border-color: transparent transparent transparent black;
        }
        ```
    - 空心小三角
        ```css
        .box1{
            width:0;
            height:0;
            border:20px solid;
            border-color: transparent transparent transparent black;
            position: relative;
        }
        .box1::after{
            content:'';
            display:block;
            width：0;
            height: 0;
            border: 19px solid;
            border-color: transparent transparent transparent white;
            position: absolute;
            left: -20px;
            top: -19px;
        }
        ```

## 颜色 RGB

用 opacity 设置父盒子颜色透明度，会影响到子元素颜色的透明度，而用 rgba 就不会影响到子元素

rgba(255, 255, 255, 0) 第四个为透明度

## 文字阴影

text-shadow: 可以多层阴影效果，以逗号分隔，文字的左上角为坐标原点，例如 X、Y坐标为 5px 5px 则在坐标轴右下方

- 距离（length）
- 模糊值（shadow）不能为负值，越大越模糊
- 颜色（color）

下面代码中 text-shadow 后面的值分别为 X的offset、Y的offset、模糊值、color

```css
/*侧阴影效果*/
.demo1{
    text-shadow: 2px 2px 2px #ff0000
}
/*辉光效果*/
.demo2{
    text-shadow: 0 0 30px #fff
}
/*多层辉光效果*/
.demo3{
    text-shadow: 0 0 5px #fff,0 0 15px #fff,0 0 40px #fff,0 0 70px red
}
/*苹果效果*/
.demo4{
    color: black;
    text-shadow: 0 1px 1px #fff;
}
/*浮雕效果*/
.demo5{
    color: #ccc;
    text-shadow: -1px -1px 0px #fff,-2px -2px 0px #eee,1px 1px 0px #444,2px 2px 0px #333
}
/*模糊字效果*/
.demo6{
    color: transparent; /*将本身设置为透明*/
    text-shadow: 0 0 6px #ff9966
}
```

![](@/imgs/002.png)

## 盒模型

CSS3 中可以通过 box-sizing 来指定盒模型，可为 content-box、border-box

- content-box：标准盒模型（W3C盒子模型），width 指 content 部分的宽度，

    实际宽度 = width + border + padding

    ![](@/imgs/003.png)

- border-box：怪异盒模型（IE盒子模型），width 表示 content + padding + border 这三个的宽度，
    
    实际宽度 = width

    ![](@/imgs/004.png)

## 边框圆角

- border-radius：左上 右上 右下 左下
    ```css
    .box{
        width: 100px;
        height: 100px;
        background: red;
        border-radius: 0 50px 0 0;
    }
    ```
    ![](@/imgs/005.png)

- border-radis: 椭圆
    ```css
    .box{
        width: 200px;
        height: 100px;
        background: red;
        border-radius: 100px/50px;
    }
    ```
    ![](@/imgs/006.png)

- 右上角的椭圆
    ```css
    .box{
        width: 100px;
        height: 100px;
        background: red;
        border-radius: 0 50px 0 0/0 100px 0 0;
    }
    ```
    ![](@/imgs/007.png)

## 线性渐变

linear-gradient

- 第一个参数表示线性渐变的方向
    - to left：设置渐变为从右到左，相当于：270deg;
    - to right：设置渐变为从左到右，相当于：90deg;
    - to top：设置渐变为从下到上，相当于：0deg;
    - to bottom：设置渐变为从上到下，相当于：180deg，这是默认值，等同于留空不写。也可以直接指定度数，如45deg
- 第二个参数是起点颜色，可以指定颜色的位置
- 第三个参数是终点颜色，你还可以在后面添加更多的参数，表示多种颜色的渐变

```css
.box3{
    width: 300px;
    height: 300px;
    background: linear-gradient(
        90deg,
        rgba(243,245,246,1) 0%,
        rgba(243,245,246,1) 0%,
        rgba(243,245,246,1) 93%,
        rgba(228,232,233,1) 100%,
        rgba(228,232,233,1) 100%
    );
}
```

![](@/imgs/008.png)

## background

- background-image：如果图片大于容器那么默认就在左上角放置，如果小于容器那么会平铺
- background-repeat：round会缩小图片后平铺。space会产生间距值

    round：可能会让图片变形
    ![](@/imgs/009.png)

    space
    ![](@/imgs/010.png)
- background-attachment：fixed 背景图位置固定不变；scroll 会滚动但不会根据容器滚动而滚动；local 会跟随容器内滚动而滚动
- background-position：移动背景图片位置
- background-size: auto（原始大小）|| number（数值）|| percentage（百分比）|| cover（放大铺满）|| contain（缩小铺满）
    ```css
    .box3{
        width: 200px;
        height: 200px;
        background-image: url('./006.png');
        background-repeat: no-repeat;
        background-size: contain
    }
    ```
    - auto：此值为默认值，保持背景图片的原始高度和宽度

    ![](@/imgs/013.png)
    - number：此值设置具体的值，可以改变背景图片的大小
    - percentage：此值为百分值，可以是 0% ~ 100% 之间任何值，但此值只能应用在块元素上，所设置的百分值将使用的背景图片大小根据元素的宽度的百分比来计算
    - cover：此值是将图片放大，以适合铺满整个容器

    ![](@/imgs/012.png)
    - cover：此值是将图片缩小，以适合铺满整个容器

    ![](@/imgs/011.png)
- background-origin：设置背景坐标的原点
- background-clip：border-box\content-box\padding-box 设置内容裁切设置的是裁切，其实是显示 

## 边框图片

- border-image-source: url("") 默认将图片放在四角
- border-image-slice 设置四个角上面的裁切距离，加 fill 填充内部
- border-image-width 图片宽度，如果不设置，会默认为边框宽度
- border-image-outset 将边框扩展
- border-image-repeat 设置图片的平铺，为 repeat 重复平铺或 round 将内容缩放进行平铺

## 弹性盒子

详见 [阮一峰博客——flex](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)

## 过渡



