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
  compile(tag) {
    let childNodes = tag.childNodes
    // 遍历子节点
    this.toArray(childNodes).forEach(node => {
      // 元素节点 收集属性，指令属性的话就需要解析 
      if (this.isEle(node)) {
        let attrs = this.toArray(node.attributes)
        attrs.forEach(attr => {
          let attrName = attr.name
          if (this.isDirective(attrName)) {
            let realAttr = this.getAttr(attrName)
            let attrValue = attr.value
            if (realAttr === 'text') {
              node.textContent = this.vm.$data[attrValue]
            }
            if (realAttr === 'html') {
              node.innerHTML = this.vm.$data[attrValue]
            }
            if (realAttr === 'model') {
              node.value = this.vm.$data[attrValue]
            }
          }
        })
        // 这里是重点，递归思想。
        // 标签的话其实需要再来一次，其实可以想象fragment就是一个标签元素其他类似。
        // 必须先解析指令在递归。这样防止覆盖。
        this.compile(node)
      }
      if (this.isText(node)) {
        let text = node.textContent
        if (this.isMustache(text)) { 
          node.textContent = this.mustache(this.vm,text) 
        }
        
      }
    })
  }
  toArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike)
  }
  isEle(node) {
    return node.nodeType === 1
  }
  isText(node) {
    return node.nodeType === 3
  }
  isDirective(str) {
    return str.startsWith('v-')
  }
  getAttr(directive) {
    return directive.slice(2)
  }
  isMustache(text) {
    return /\{\{.+\}\}/.test(text)
  }
  mustache(vm, text) {
    // 将{{msg}}换成对应的值
    let reg = /\{\{(.+?)\}\}/g
    // 控制台输入('{{dd}} {{df}}').replace(/\{\{(.+?)\}\}/g,function(){console.log(arguments)})
    // 第二个参数是{{key}}的key
    // replace可以替换，fn可以动态获取{{key}}的key
    // ('{{dd}} {{df}}').replace(reg, function () { console.log(arguments) })
    // replace用法https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace
    // https://www.cnblogs.com/2han/p/6371307.html  懒惰性和贪婪性 克服贪婪性在量词元字符后面加?即可
    text = text.replace(reg, function () {
      // console.log(arguments)
      let key = arguments[1]
      return vm.$data[key]
    })
    // 把换好的文本返回
    return text
  }

}