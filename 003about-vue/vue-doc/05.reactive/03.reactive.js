let activeEffect = null

class Dep {
    constructor() {
        this.subscribers = new Set()
    }

    depend() {
        if (activeEffect) this.subscribers.add(activeEffect)
    }

    notify() {
        this.subscribers.forEach(effect => effect())
    }
}


function watchEffect(effect) {
    activeEffect = effect
    effect()
    activeEffect = null
}

const targetMap = new WeakMap()

function getDep(target, key) {
    // 无论如何一定能够拿到一个map
    let depsMap = targetMap.get(target)
    //如果取出来的map不存在，就创建一个新的map
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    // 无论如何一定能够拿到一个Dep
    // 如果取出来的Dep不存在，就创建一个新的Dep
    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Dep()
        depsMap.set(key, dep)
    }
    return dep;
}

function reactive(target) {
    const handler = {
        get(target, key, receiver) {
            // 收集依赖 如果当前有activeEffect，就收集
            const result = Reflect.get(target, key, receiver)
            const dep = getDep(target, key)
            dep.depend()
            return result
        },
        set(target, key, value, receiver) {
            // 设置值的时候，要通知依赖更新
            const result = Reflect.set(target, key, value, receiver)
            const dep = getDep(target, key)
            dep.notify()
            return result
        }
    }
    return new Proxy(target, handler)
}

const data = reactive({price: 5, quantity: 2})
watchEffect(() => {
    console.log(data.price * data.quantity, 11)
})

watchEffect(() => {
    console.log(data.quantity, 22)
})

watchEffect(() => {
    console.log(data.price, 33)
})

data.price = 20
