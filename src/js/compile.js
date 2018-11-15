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
  compile(fragment){
    this.toArray(fragment.childNodes).forEach(node=>{
      // 元素节点 解析指令 也就是收集属性，看哪个属性是v-开头
      if(this.isEle(node)){
       let attrs = this.toArray(node.attributes)
       attrs.forEach(attr=>{
         let attrName = attr.name
         if(this.isDirective(attrName)){
          let realAttr = this.getAttr(attrName)
          console.dir(attr)
          let attrValue = attr.value
          console.log(attrValue)
          console.log('attrValue',attr.textContent)
          if(realAttr === 'text'){
            node.textContent = this.vm.$data[attrValue]
          }
          if(realAttr === 'html'){
            node.innerHTML = this.vm.$data[attrValue]
          }
         }
       })
        
      }
    })
  }
  toArray(arrayLike){
    return Array.prototype.slice.call(arrayLike)
  }
  isEle(node){
    return node.nodeType === 1
  }
  isText(node){
    return node.nodeType === 3
  }
  isDirective(str){
    return str.startsWith('v-')
  }
  getAttr(directive){
    return directive.slice(2)
  }
  
}