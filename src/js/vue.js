class Vue {
  constructor(opt = {}) {
    this.$el = this.getNode(opt.el)
    this.$data = opt.data
    this.$methods = opt.methods
    // 先数据劫持下
    new Observer(this.$data)
    // compile的作用是把html中指令还有{{}}变成data中的值
    new Compile(this,this.$el)

  }
  getNode(el) {
    // el可能是字符串可能是node，统一变成node
    return typeof el === 'object' ? el : document.querySelector(el)
  }
}