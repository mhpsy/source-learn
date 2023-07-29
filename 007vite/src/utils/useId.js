let id = 0;
const useId = (pre = "") => {
    return `${pre}-${id++}`
}

export{
    useId
}