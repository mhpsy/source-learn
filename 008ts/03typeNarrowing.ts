type test = string | number | boolean;

let data: test = 10;

const whatType = (data: test) => {
    if (typeof data === 'number') {
        console.log('number')
    } else if (typeof data === 'string') {
        console.log('string')
    } else {
        console.log('boolean', data)//boolean
    }
}