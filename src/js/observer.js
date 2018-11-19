class Observer {
  constructor(object) {
    if (typeof object !== 'object') {
      return
    }
    this.object = object
    this.walk(object)

  }
  walk(object) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        // 劫持属性
        this.defineReactive(object, key)
      }
    }
  }
  defineReactive(object, key) {
    let temp = object[key]
    let _this = this
    Object.defineProperty(object, key, {
      enumerable: true,
      configurable: true,
      get() {
        console.log('正在读取值' + key, temp)
        return temp
      },
      set(newValue) {
        console.log('设置值' + key, newValue)
        temp = newValue
        if(Object.prototype.toString(newValue) === '[object Object]'){
          _this.walk(newValue)
        }
      }
    })
  }
}