class Vue {
  constructor(opt = {}) {
    this.$el = this.getNode(opt.el)
    this.$data = opt.data
    this.$methods = opt.methods
    // 先数据劫持下
    new Observer(this.$data)
    // 代理
    this.proxy(this.$data)
    this.proxy(this.$methods)
    // compile的作用是把html中指令还有{{}}变成data中的值
    new Compile(this,this.$el)


  }
  getNode(el) {
    // el可能是字符串可能是node，统一变成node
    return typeof el === 'object' ? el : document.querySelector(el)
  }
  proxy(obj){
    Object.keys(obj).forEach(key => {
      Object.defineProperty(this,key,{
        configurable:true,
        enumerable:true,
        getter(){
          return obj[key]
        },
        set(newValue){
          let oldValue = obj[key]
          if(oldValue===newValue){
            return
          }
          obj[key] = newValue
        }
      })
    })
  }
}

// proxy 可以单独写出来
/**
 * function proxy(beProxyedObj,proxyObj){
 *   Object.keys(beProxyedObj).forEach(key => {
      Object.defineProperty(proxyObj,key,{
        configurable:true,
        enumerable:true,
        getter(){
          return beProxyedObj[key]
        },
        set(newValue){
          let oldValue = beProxyedObj[key]
          if(oldValue===newValue){
            return
          }
          beProxyedObj[key] = newValue
        }
      })
    })
 * }
 */