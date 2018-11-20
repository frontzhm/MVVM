/**
 * watch负责把compile模块和observer模块关联起来
 * 一旦vm的data的数据键名字发生变化的时候，就触发回调函数
 * 每一个键名字就会新建一个watcher。
 * watch的原理是，初次渲染的时候，也就是在compile那边就建立watch对象，传入cb，cb也就是重新渲染dom，这时候并不执行。
 * 但是watch对象已经存在了。此时一旦改变相应的值，也就是setter就会知道值变化了，在setter那边执行watch对象的update方法，update会执行cb
 * 这样compile就和observer联系起来。说的直白点。 一旦 data.msg = 9 触发setter ,执行update,执行cb。
 * 这里还有一个点。同一个数据比如msg,v-text的时候建立了一个watch,v-html的时候也建立一个watch,但其实msg变化的时候，两个watch的update都需要执行。
 * 于是，这里涉及到了订阅-发布模式。就是一旦值发生变化，就通知所有订阅该值的watch执行update.
 * 于是，每个值就是一个模式
 * 
 * vue那边，首先是数据劫持，也就是监视每个属性，给每个属性新建dep,然后是compile,compile就会new watch,
 * 这样就会把watch存到Dep.target，紧接着读取属性，这里就可以把watch放进对于的dep里。再清空target。
 *   Dep.target = this
    this.oldValue = this.getVMValue(vm,expr)
 */
class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb
    // 每新建一个watcher都要去存起来，存起来的技巧是用Dep这个类本身
    Dep.target = this
    // 这行会执行getter操作，也就会收集watcher,收集完释放Dep.target
    this.oldValue = this.getVMValue(vm, expr)
    Dep.target = null
  }
  update() {
    let oldValue = this.oldValue
    let newValue = this.getVMValue(this.vm, this.expr)
    if (oldValue !== newValue) {
      this.cb(newValue)
    }
  }
  getVMValue(vm, expr) {
    // 迭代递归
    let temp = vm.$data
    expr.split('.').forEach(item => {
      temp = temp[item]
    })
    return temp
  }
}

class Dep {
  constructor() {
    this.subs = []
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  notify() {
    this.subs.forEach(watcher => {
      watcher.update()
    })
  }
}