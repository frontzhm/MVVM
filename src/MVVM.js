class Dep{
    constructor(){
        // 存放所有的watcher
        this.subs = []
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    // 发布
    notify(){
        this.subs.forEach(sub=>{sub.update()})
    }
}
// 当new watcher的时候就创建了一个观察者，把这个观察者放到全局，这个观察者会取值，在取值的时候，全局就有观察者了，然后把这个观察者放到对应的属性里。
// 当数据变化的时候，让Dep的观察者自动更新。
// 观察者 （基于发布订阅的） 观察者 被观察者
class Watcher{
    // vm.$watch(vm,'school.name',newValue=>{})
    // 新值和旧值如果一样的话 就不会执行cb
    constructor(vm,expr,cb){
        // 因为属性要用，所以存到this去
        this.vm = vm
        this.expr = expr
        this.cb = cb
        // 默认先存放一个老值
        this.oldValue = this.get()
    }
    get(){
        // 先把自己放到target
        Dep.target= this
        // vm.$data.name 
        // 取值把这个观察者和数据关联起来
        let value = CompileUtil.getVal(this.vm,this.expr)
        // 不取消 任何值取值 都会添加watcher
        Dep.target = null
        return value
    }
    // 更新操作 数据变化后 会调用观察者的update方法
    update(){
        let newValue = CompileUtil.getVal(this.vm,this.expr)
        if(newValue !== this.oldValue){
            this.cb(newValue)
        }
    }
}
// 实现数据劫持
class Observer{
    constructor(data){
        // console.log(data)
        this.observer(data)
    }
    observer(data){
        // 是对象才观察
        if(data && typeof data === 'object'){
            // 如果是对象
            for(let key in data){
                this.defineReactive(data,key,data[key])
            }
        }
    }
    // 每个属性都有自己的一个发布订阅，这样单个属性变化的时候启动其相应的观察者变化，也就是模块变化.
    defineReactive(obj,key,value){
        // 给每个属性 都加上一个具有发布订阅的功能
        let dep = new Dep()
        // value也是一个对象的时候
        this.observer(value)
        Object.defineProperty(obj,key,{
            get(){
                // 创建watcher时，会取到对应内容 并且把watcher放到全局
                Dep.target && dep.subs.push(Dep.target)
                return value
            },
            // {school:{name:'huahua'}}
            set:(newValue)=>{
                if(newValue !== value){
                    // 新值也是一个对象的时候 照样监控
                    // 为了不改变this的值，可以变成箭头函数
                    this.observer(newValue)
                    value = newValue
                    dep.notify()
                }
            }
        })
    }
}
// 基类
class Compiler {
  constructor(el, vm) {
    // 判断el是不是一个元素，不是就获取
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm
    // 把当前节点中的元素 获取到 放到内存里，这句之后，短暂的el是空的，因为移到碎片里了
    let fragment = this.node2fragment(this.el);
    console.log(fragment);
    // 把节点中的内容进行替换
    // 编译模板 再数据编译
    this.compile(fragment)
    // 把内容再塞到页面中
    this.el.appendChild(fragment)
  }
  isDirective(attrName){
    return attrName.startsWith('v-')
  }
  // 编译元素
  compileElement(node){
    let attributes = [...node.attributes]
    // console.log(attributes)
    // v-model="school.name"
    attributes.forEach(attr=>{
        // console.log(attr)
        // name就是v-mdel  value就是school.name  expr重命名value
        let {name,value:expr} = attr
        // console.log(name,value)
        if(this.isDirective(attr.name)){
            let [,directive] = name.split('-');
            // 当处理 methods v-on:click
            let [directiveName,eventName] = directive.split(':')
            // 需要调用不同的指令来处理 指令所在元素  v-model="schol.name"  需要处理input.value 和拿到school.name 这就需要data.school.name也就是vm的实例了
            CompileUtil[directiveName](node,expr,this.vm,eventName)
            // CompileUtil[directive](node,expr,this.vm)
        }
    })
  }
  // 编译文本的
  compileText(node){
    // 判断当前文本节点中内容是否包含{{}}
    let content = node.textContent
    // console.log(content,'内容')
    // ?随便取，最多取到}}   {{q}}{{w}}  q}}{{w
    let reg = /\{\{(.+?)\}\}/
    if(reg.test(content)){
        // 找到所有{{}} 的文本
        console.log(content)
        // {{a}} {{b}} 先替换了，再塞进去
        CompileUtil['text'](node,content,this.vm)
    }


  }
  // 核心的编译方法
  // 用来编译内存中的dom节点 文本的话有没有{{}} 标签的话属性有没有v-开头
  compile(node){
      let childNodes = [...node.childNodes]
      childNodes.forEach(child=>{
          if(this.isElementNode(child)){
              this.compileElement(child)
            // console.log('element',child)
            // 如果是元素的话，需要把自己传进去，再去遍历子节点
            this.compile(child)
          }else{
            this.compileText(child)

            // console.log('text',child)
          }
      })
      
  }
  isElementNode(node) {
    return node.nodeType === 1;
  }
  
  // 把节点移动到内存中
  node2fragment(node) {
    let fragment = document.createDocumentFragment();
    let firstChild;
    //   while(firstChild = node.firstChild){
    while (node.firstChild) {
      firstChild = node.firstChild;
      // appendChild具有移动性，
      fragment.appendChild(firstChild);
    }
    return fragment;
  }
}
CompileUtil = {
    // 根据表达式取到对应的数据
    getVal(vm,expr){
        // 没有.的话直接就是vm.$data
        return expr.split('.').reduce((data,cur)=>{
            return data[cur]
        },vm.$data)
    },
    // vm.$data.school = 2
    setVal(vm,expr,value){
        return expr.split('.').reduce((data,cur,index,arr)=>{
            if(index === arr.length-1){
                data[cur] = value
            }
            return data[cur]
        },vm.$data)
    },
    // 解析model指令 需要考虑输入改变data
    model(node,expr,vm){
        // node是节点 expr是school.name也就是表达式 vm是当前实例 vm.$data
        // 给输入框赋予value属性 node.value = xxx
        let fn = this.updater['modelUpdater']
        // 给输入框加入一个观察者 如果稍后数据更新了会触发此方法，这样新值重新赋值给输入框的value
        new Watcher(vm,expr,newValue=>{
            fn(node,newValue)
        })
        node.addEventListener('input',e=>{
            // 获取用户输入的内容
            let value = e.target.value
            this.setValue(vm,expr,value)
        })
        let value = this.getVal(vm,expr)
        fn(node,value)
    },
    html(node,expr,vm){
        let fn = this.updater['htmlUpdater']
        // 后来值变化的时候 就只是触动这里
        new Watcher(vm,expr,newValue=>{
            fn(node,newValue)
        })
        // 第一次走这里 这里就走完了
        let value = this.getVal(vm,expr)
        fn(node,value)
        // node.innerHTML = xxx 和上面的有重复思维，于是再来个updater

    },
    getContentValue(vm,expr){
        // 遍历表达式，将内容替换成一个完整的内容返回 这是解决 {{a}} {{c}} 如果a变了，重新获取a的值和b的值在塞进dom里
        let reg = /\{\{(.+?)\}\}/g
        return expr.replace(reg,(...args)=>{
            return this.getVal(vm,args[1])
        })
    },
    on(node,expr,vm,eventName){
        node.addEventListener(eventName,function(e){
            vm[expr](e)
        })
    },
    text(node,expr,vm){
        // expr {{a}} {{c}} => a c
        let fn = this.updater['textUpdater']
        let reg = /\{\{(.+?)\}\}/g
        let content = expr.replace(reg,(...args)=>{
            // 给表达式中每个{{}}都加上观察者
            new Watcher(vm,args[1],newValue=>{
               // 这里不能直接赋值，因为还有别的{{}},于是getContentValue
                fn(node,this.getContentValue(vm,expr))
            })
            return this.getVal(vm,args[1])
        })
        fn(node,content)
    },
    updater:{
        // 把数据插入到节点中
        modelUpdater(node,value){
            node.value = value
        },
        htmlUpdater(node,value){
            node.innerHTML = value
        },
        // 处理文本节点
        textUpdater(node,value){
            node.textContent = value
        }
    }
}
class Vue {
  constructor(options) {
    // this.el $data $options
    this.$el = options.el;
    this.$data = options.data;
    let computed = options.computed
    let methods = options.methods
    // 元素存在 编译模板
    if (this.$el) {
      // 把数据全部转化用Object.defineProperty来定义
      new Observer(this.$data)
      
      // 有依赖关系 数据
      // {{getNewName}} 先到vm.$data vm只是代理
      for (let key in computed) {
         Object.defineProperty(this.$data,key,{
             get:()=>{
                 // 注意这里的箭头 因为箭头不改变this
                 // computed里面有this，需要将this指向改成当前的实例，不然就变成window了
                 console.log(computed)
                 return computed[key].call(this.$data)
             }
         })
      }
    //   methods也代理到vm
      for(let key in methods){
          Object.defineProperty(this,key,{
              get(){
                  return methods[key]
              }
          })
      }
      // 把数据获取操作 vm上的取值操作 都代理到vm.$data
      this.proxyVm(this.$data)
    //   console.log(this.$data)
      new Compiler(this.$el, this);
    }
  }
  proxyVm(data){
      for(let key in data){
          Object.defineProperty(this,key,{
              get(){
                  return data[key]
              },
              set(newValue){
                data[key] = newValue
              }
          })
      }
  }
}
