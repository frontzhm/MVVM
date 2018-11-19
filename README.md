# write-vue
自己尝试写写简单版的vue.

## 简单的开始

建个src，放个`index.html`，`js/vue.js`。

```js
let vm = new Vue({
    el:'#app',
    data:{
        msg:'hi'
    },
    method:{
        clickFn(){
            console.log('click')
        }
    }
})
```
首先，vue是个类，需要传一个对象。
```js
class Vue{
    constructor(opt={}){
        this.$el = opt.el
        this.$data = opt.data
        this.$methods = opt.methods
    }
}
// 在控制台打印下vm，哎嗨，有那么点意思了啊
```

## 范围内的解析

vue是在el的范围内解析的。将其中的相应的指令解析成正确的内容。
这里的大逻辑是，将el所有子节点移到fragment,framment解析完成之后，重新添加到el。这样做是减少重绘。
```js
    // 不想多次重绘，所以用fragment媒介
    let fragment = document.createDocumentFragment()
    // 首先把el的节点都移到fragment下，解析完成之后，再放回来。
    let childNodes = this.el.childNodes
    this.toArray(childNodes).forEach(node => {
      fragment.appendChild(node)
    })
    // 编译
    this.compile(fragment)
    // 编译完成塞回来
    this.el.appendChild(fragment)
```
```html
    <div id="app">
        <p>{{msg}}</p>
        <p v-text="msg"  >{{msg}}</p>
        <p v-html="msg"></p>
        <input type="text" v-model="msg">
        <button v-on:click="clickFn">点我</button>
    </div>
```
遇到标签解析指令，遇到文本解析`{{}}`。

