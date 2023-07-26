//这个方法实际就是返回一个函数，这个函数的作用就是判断传入的参数是否在map中
//来源Vue的源码 而且是第一个方法
function makeMap(str, expectsLowerCase) {
    const map = /* @__PURE__ */ Object.create(null);
    const list = str.split(",");
    console.log(list)
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    console.log(map)
    console.log((val) => !!map[val.toLowerCase()])
    return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}

const HTML_TAGS = "html,body"

console.log(makeMap(HTML_TAGS, true));
console.log(makeMap(HTML_TAGS, true)("html"));
