interface indexAble {
    [index: number]: string
}

const indexAble1: indexAble = ['a', 'b', 'c'];
const indexAble2: indexAble = {0: 'a', 1: 'b', 2: 'c'};

interface stringAble {
    [index: string]: number
}

const stringAble1: stringAble = {a: 1, b: 2, c: 3};
const timeObj: stringAble = {time: 1, time2: 2, time3: new Date().getTime()}
// const stringAble2: stringAble = [1, 2, 3]; error


