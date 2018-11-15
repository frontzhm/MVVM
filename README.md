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
