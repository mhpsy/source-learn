const h = (tag, props, children) => {
    return {
        tag,
        props,
        children,
    }
}

const mount = (vnode, container) => {
    // tag
    const el = (vnode.el = document.createElement(vnode.tag))

    // props
    if (vnode.props) {
        for (const key in vnode.props) {
            if (key === 'style') {
                for (const styleName in vnode.props.style) {
                    el.style[styleName] = vnode.props.style[styleName]
                }
            } else {
                const value = vnode.props[key]
                el.setAttribute(key, value)
            }
        }
    }

    // children
    if (vnode.children) {
        if (typeof vnode.children === 'string') {
            el.textContent = vnode.children
        } else {
            vnode.children.forEach((v) => {
                mount(v, el)
            })
        }
    }

    // mount
    if (typeof container === 'string') {
        container = document.querySelector(container)
    }
    container.appendChild(el)
}

const patch = (n1, n2) => {
    // tag
    const el = (n2.el = n1.el)

    // props
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    // newProps
    for (const key in newProps) {
        const oldValue = oldProps[key]
        const newValue = newProps[key]
        if (oldValue !== newValue) {
            if (key === 'style') {
                for (const styleName in newValue) {
                    el.style[styleName] = newValue[styleName]
                }
                for (const styleName in oldValue) {
                    if (!newValue.hasOwnProperty(styleName)) {
                        el.style[styleName] = ''
                    }
                }
            } else {
                el.setAttribute(key, newValue)
            }
        }
    }
    // oldProps
    for (const key in oldProps) {
        if (!newProps.hasOwnProperty(key)) {
            el.removeAttribute(key)
        }
    }

    // children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []
    if (typeof newChildren === 'string') {
        if (typeof oldChildren === 'string') {
            if (newChildren !== oldChildren) {
                el.textContent = newChildren
            }
        } else {
            el.textContent = newChildren
        }
    } else {
        if (typeof oldChildren === 'string') {
            // new children is Array and old children is string
            // clear old children
            el.innerHTML = ''
            newChildren.forEach((v) => {
                mount(v, el)
            })
        } else {
            const commonLength = Math.min(oldChildren.length, newChildren.length)
            for (let i = 0; i < commonLength; i++) {
                patch(oldChildren[i], newChildren[i])
            }
            if (oldChildren.length > newChildren.length) {
                oldChildren.slice(newChildren.length).forEach((v) => {
                    el.removeChild(v.el)
                })
            } else if (oldChildren.length < newChildren.length) {
                newChildren.slice(oldChildren.length).forEach((v) => {
                    mount(v, el)
                })
            }
        }
    }
}

