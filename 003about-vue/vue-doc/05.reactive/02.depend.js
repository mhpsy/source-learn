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

const data = {price: 5, quantity: 2}

const dep = new Dep()

function watchEffect(effect) {
    activeEffect = effect
    dep.depend()
    effect()
    activeEffect = null
}

const target = () => console.log(data.price * data.quantity)
const target2 = () => console.log(data.price)

//核心思想就是把每一个依赖都收集进去，然后当数据变化的时候，通知每一个依赖
//这里是用watchEffect来触发，实际上是在数据变化的时候触发

watchEffect(target)
watchEffect(target2)

// 第一次在watchEffect内部执行
// dep.notify() // 10, 5

data.price = 20
dep.notify() // 40, 20
