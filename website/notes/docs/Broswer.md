---
sidebar: auto
sidebarDepth: 2
datetime: '2019-07-05'
category: 开发笔记
---

# 浏览器相关

## XSS攻击

> 跨网站指令码是一种网站应用程式的安全漏洞攻击，是[代码注入](https://www.wikiwand.com/zh-hans/%E4%BB%A3%E7%A2%BC%E6%B3%A8%E5%85%A5)的一种。它允许恶意使用者将程式码注入到网页上，其它使用者在观看网页时就会收到影响。这类攻击通常包含了 HTML 以及使用者端脚本语言。

XSS 分为三种：反射型，存储型和 DOM-based

### 如何攻击

XSS 通过修改 HTML 节点或者执行 JS 代码来攻击网站。

例如通过 URL 获取某些参数

```html
<!-- http:www.domain.com?name=<script>alert(1)</script> -->
<div>{{name}}</div>
```

上述 URL 输入可能会将 HTML 改为 `<div><script>alert(1)</script></div>` ，这样页面中就凭空多了一段可执行脚本。这种攻击类型是反射性攻击，也可以说是 DOM-based 攻击。

也有另一种场景，比如写了一篇包含攻击代码 `<script>alert(1)</script>` 的文章，那么可能浏览文章的用户都会被攻击到。这种攻击类型是存储型攻击，也可以说是 DOM-based 攻击，并且这种攻击打击面更广。

### 如何防御

最普遍的做法是转义输入输出的内容，对于引号，尖括号，斜杠进行转义

```javascript
function escape(str) {
    str = str.replace(/&/g, '&amp;')
    str = str.replace(/</g, '&lt;')
    str = str.replace(/>/g, '&gt;')
    str = str.replace(/"/g, '&quto;')
    str = str.replace(/'/g, '&#39;')
    str = str.replace(/`/g, '&#96;')
    str = str.replace(/\//g, '&#x2F;')
    return str
}
```

通过转义可以将攻击代码 `<script>alert(1)</script>` 变成

```javascript
// -> &lt;script&gt;alert(1)&lt;&#x2F;script&gt;
escape('<script>alert(1)</script>')
```

对于显示富文本来说，不能通过上面的办法来转义所有字符，因为这样会把需要的格式液过滤掉。这种情况通常采用白名单过滤的办法，当然也可以通过黑名单过滤，但是考虑到需要过滤的标签和标签属性实在太多，更加推荐使用白名单的方式。

```javascript
var xss = require('xss')
var html = xss('<h1 id="title">XSS Demo<h1><script>alert("xss");</script>')
// -> <h1>XSS Demo</h1>&lt;script&gt;alert("xss");&lt;/script&gt;
console.log(html)
```

以上示例使用了 js-xss 来实现。可以看到在输出中保留了 h1 标签且过滤了 script 标签。

## CSRF攻击

> 跨站请求伪造，通常缩写为 CSRF 或者 XSRF，是一种挟制用户在当前已登录的 Web 应用程序上执行非本意的操作的攻击方式。

简单的说，CSRF就是利用用户的登录状态发起恶意请求。

### 如何攻击

假设网站中有一个通过 Get 请求提交用户评论的借口，那么攻击者就可以在钓鱼网站中加入一个图片，图片的地址就是评论接口

```html
<img src="http://www.domain.com/xxx?comment='attack'" />
```

如果接口是 Post 提交的，就相对麻烦点，需要用表单来提交接口

```html
<form action="http://www.domain.com/xxx" id="CSRF" method="post">
    <input name="comment" value="attack" type="hidden" />
<form>
```

### 如何防御

防范 CSRF 可以遵循以下几种规则：

1. Get 请求不对数据进行修改
2. 不让第三方网站访问到用户 Cookie
3. 阻止第三方网站请求接口
4. 请求时附带验证信息，比如验证码或者 token

#### SameSite

可以对 Cookie 设置 SameSite 属性。 该属性设置 Cookie 不随着跨域请求发送，该属性可以很大程度减少 CSRF 的攻击，但是该属性目前并不是所有浏览器都兼容。

#### 验证 Referer

对于需要防范 CSRF 的请求，我们可以通过验证 Referer 来判断该请求是否为第三方网站发起的。

#### Token

服务器下发一个随机 Token（算法不能复杂），每次发起请求时将 Token 携带上，服务器验证 Token 是否有效。

## 从输入地址到页面渲染

1. 浏览器进行域名解析

2. 进行 TCP 三次握手连接

3. 浏览器向服务器发送请求

4. 服务器返回 html 代码

5. 浏览器解析 html 代码并请求资源文件

6. 渲染页面

##  浏览器请求静态资源的流程

![](@/imgs/014.png)

## 缓存策略

[缓存策略](https://www.cnblogs.com/xingxia/p/cache.html)