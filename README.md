# write-vue
听着某课程之后，试着写简单版的vue.

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

## 数据劫持

听着高大上，也就是跟踪属性，读取属性或设置属性的时候，都知道并且可以控制返回值。是这货，`Object.defineProperty`
把data的每个属性都getter和setter。每个自然就是遍历。其次是考虑到属性值也是对象的情况，递归。

## 一旦值改变，相应的渲染就需要重新编译

观察者模式啊。首先，getter用于收集订阅者（也就是compile那边的watcher），setter用于触发动作。
定义一个dep依赖收集的类。
watcher主要是，值变化的时候，执行回调函数来重新编译。每个`{{}}`（指令一样啦，这里的只是一个代表）都是一个watcher。compile那边编译的时候就新建watcher。
dep的作用是，每个值有很多的`{{}}`，每个这样的都需要在，值变化的时候，执行回调函数来重新编译。所有收集所有的watcher，值变化的时候一起通知。
总结：每个属性，有很多`{{}}`，每个`{{}}`就是一个watcher，而每个属性就是一个dep。值变化，就会触发所有订阅者的动作，也就是watcher的渲染动作。每新建一个watcher的时候，就记得添加到相应的Dep里。每一个compile的时候就新建一个watcher.
这里好难理解。没事多琢磨。说自己的。

## 增加代理

vm.$data[expr] => vm[expr]

> [大大的解释](https://github.com/answershuto/learnVue/blob/master/docs/%E4%BE%9D%E8%B5%96%E6%94%B6%E9%9B%86.MarkDown)


