import { add } from "./utils/math";

const { dateTransform } = require("./utils/transform.js")

//只需要导入webpack就会执行
import "./element/test"

console.log(add(10,20));
console.log(dateTransform(2020,10,20));