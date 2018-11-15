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
