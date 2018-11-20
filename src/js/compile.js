class Compile {
  constructor(vm, el) {
    this.el = el
    this.vm = vm
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
  }
  compile(fragment) {
    let childNodes = fragment.childNodes
    // 遍历子节点
    this.toArray(childNodes).forEach(node => {
      // 元素节点 收集属性，指令属性的话就需要解析 
      if (this.isElementNode(node)) {
        this.compileNode(node)
      }
      if (this.isTextNode(node)) {
        this.compileText(node)
      }
      // 这里是重点，递归思想。
      // 标签的话其实需要再来一次，其实可以想象fragment就是一个标签元素其他类似。
      // 必须先解析指令在递归。这样防止覆盖。
      // !!!敲黑板   如果当前节点有子节点的话，需要递归解析
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node)
      }
    })
  }
  compileNode(node) {
    let attrs = this.toArray(node.attributes)
    attrs.forEach(attr => {
      let attrName = attr.name
      // 事件指令比较特殊 单独处理
      if(this.isEventDirective){
        // v-on:click="fn"
        let eventName = attrName.slice(5)
        let expr = attr.value
        compileUtil.eventHandle(node, this.vm, expr,eventName)
      }
      if (this.isDirective(attrName)) {
        // v-text
        let realAttr = attrName.slice(2)
        console.log(realAttr)
        let expr = attr.value
        // obj必须判断属性存不存在
        compileUtil[realAttr] && compileUtil[realAttr](node, this.vm, expr)
      }
    })
  }
  compileText(node){
    compileUtil.mustache(this.vm, node)
  }
  toArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike)
  }
  isElementNode(node) {
    return node.nodeType === 1
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  isDirective(str) {
    return str.startsWith('v-')
  }
  isEventDirective(str){
    return str.startsWith('v-on:')
  }
  getAttr(directive) {
    return directive.slice(2)
  }

}

/**
 * 重点！！ 优化小技巧
 *             if (realAttr === 'text') {
              node.textContent = this.vm.$data[attrValue]
            }
            if (realAttr === 'html') {
              node.innerHTML = this.vm.$data[attrValue]
            }
            if (realAttr === 'model') {
              node.value = this.vm.$data[attrValue]
            }
            这种优化成 obj = {text:function(){},....}
            简化写成：obj[realAttr](node,vm,expr)
            
 * 
 */
let compileUtil = {
  text(node, vm, expr) {
    node.textContent = this.getVMValue(vm,expr)
    new Watcher(vm,expr,newValue=>{
      node.textContent = newValue
    })
  },
  html(node, vm, expr) {
    node.innerHTML = this.getVMValue(vm,expr)
    new Watcher(vm,expr,newValue=>{
      node.innerHTML = newValue
    })
  },
  model(node, vm, expr) {
    let _this = this
    node.value = this.getVMValue(vm,expr)
    new Watcher(vm,expr,newValue=>{
      node.value = newValue
    })
    // 这里注意双向绑定
    node.addEventListener('input',function(){
      _this.setVMValue(vm,expr,node.value)
    })
  },
  eventHandle(node, vm, expr,eventName){
    node.addEventListener(eventName,function(){
      // 将this指向vm
      vm.$methods[expr].bind(vm)()
    })
  },
  isMustache(text) {
    return /\{\{.+\}\}/.test(text)
  },
  mustache(vm, node) {
    let text = node.textContent
    if (!this.isMustache(text)) {
      return
    }
    let _this = this
    // 将{{msg}}换成对应的值
    let reg = /\{\{(.+?)\}\}/g
    // 控制台输入('{{dd}} {{df}}').replace(/\{\{(.+?)\}\}/g,function(){console.log(arguments)})
    // 第二个参数是{{key}}的key
    // replace可以替换，fn可以动态获取{{key}}的key
    // ('{{dd}} {{df}}').replace(reg, function () { console.log(arguments) })
    // replace用法https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace
    // https://www.cnblogs.com/2han/p/6371307.html  懒惰性和贪婪性 克服贪婪性在量词元字符后面加?即可
    let g_expr
    text = text.replace(reg, function () {
      // console.log(arguments)
      let expr = g_expr = arguments[1]
      return _this.getVMValue(vm,expr)
    })
    // text = this.replaceStr(text,reg,vm)
    node.textContent = text
    // TODO 这里是bug
    new Watcher(vm,g_expr,newValue=>{
      node.textContent = newValue
    })
  },
  // 有时候的值复杂一些，就不能单纯的vm.$data[key]了，比如data.car.color，data[car][color]
  getVMValue(vm,expr){
    // 迭代递归
    let temp = vm.$data
    expr.split('.').forEach(item=>{
      temp = temp[item]
    })
    return temp
  },
  // vm.data.car.color  vm[data][car][color] = 'red'
  setVMValue(vm,expr,newValue){
    // 迭代递归
    let temp = vm.$data
    let arr = expr.split('.')
    arr.forEach((item,index)=>{
      // 不是最后的key的话
      if(arr.length-1<index){
        temp = temp[item]
      }else{
        // 最后的key的话直接赋值
        temp[item] = newValue
      }
    })
  },
  // 要替换的文本text，替换的正则表达式，替换的新值，最后返回替换完的结果
  // 纯粹为了解脱mustache那边的
  replaceStr(text,reg,vm){
    let _this = this
    // 控制台输入('{{dd}} {{df}}').replace(/\{\{(.+?)\}\}/g,function(){console.log(arguments)})
    // 第二个参数是{{key}}的key
    // replace可以替换，fn可以动态获取{{key}}的key
    // ('{{dd}} {{df}}').replace(reg, function () { console.log(arguments) })
    // replace用法https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace
    // https://www.cnblogs.com/2han/p/6371307.html  懒惰性和贪婪性 克服贪婪性在量词元字符后面加?即可
    text = text.replace(reg, function () {
      // console.log(arguments)
      let expr = arguments[1]
      return _this.getVMValue(vm,expr)
    })
    return text
  }



}