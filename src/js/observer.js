class Observer {
  constructor(object) {
    if (typeof object !== 'object') {
      return
    }
    this.object = object
    this.walk(object)

  }
  walk(object) {
    // 注意对参数的筛选,别少了call
    if (Object.prototype.toString.call(object) !== '[object Object]') {
      return
    }
    // 舍弃for in
    Object.keys(object).forEach(key => {
      // 劫持属性
      this.defineReactive(object, key, object[key])
      // 注意这里的递归，不是第一层就结束了，还有属性值如果是对象的话，依旧需要数据劫持.
      // 递归的停止条件是，参数不是对象。
      console.log('object', object)
      this.walk(object[key])
    })

  }
  // defineReactive(object, key) 开始的这个需要另设temp接收值，索性放进参数里。以及为了后续的操作。
  defineReactive(object, key, value) {
    // 这个this为了_this.walk
    let _this = this
    // 每个属性都需要建一个dep，getter收集watcher,setter触发通知。
    let dep = new Dep()
    Object.defineProperty(object, key, {
      enumerable: true,
      configurable: true,
      get() {
        console.log('正在读取值' + key, value)
        // 收集watcher
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newValue) {
        // 一样的话不需要设置，设置值是为了读取值，所以return，这样读取还是原来的值，没毛病。
        if (newValue === value) {
          return
        }
        console.log('设置值' + key, newValue)
        value = newValue
        // 设置的值如如果是对象
        if (Object.prototype.toString.call(newValue) === '[object Object]') {
          _this.walk(newValue)
        }
        // 一旦数据变化，就会触发通知，这样所有的watcher就会重新渲染。
        dep.notify()
      }
    })
  }
}