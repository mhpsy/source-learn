class Dep {
    constructor() {
        this.subscribers = new Set()
    }

    addEffect(effect) {
        this.subscribers.add(effect)
    }

    notify() {
        this.subscribers.forEach(effect => effect())
    }
}

const data = {price: 5, quantity: 2}

const dep = new Dep()

const target = () => console.log(data.price * data.quantity)
const target2 = () => console.log(data.price)

//核心思想就是把每一个依赖都收集进去，然后当数据变化的时候，通知每一个依赖
//这里是手动触发，实际上是在数据变化的时候触发

dep.addEffect(target)
dep.addEffect(target2)

dep.notify() // 10, 5

data.price = 20
dep.notify() // 40, 20
