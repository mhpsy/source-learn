import {useId} from "./utils/useId.js";
// import {size} from "../node_modules/lodash-es/lodash.js";//原生的引入方式
import {size} from "lodash-es";//vite的引入方式

const arr = []
for (let i = 0; i < 10; i++) {
    arr.push(useId("test") + " " + i);
    console.log(useId("test") + " " + i);
}

console.log(size(arr));

const htmlDivElement = document.createElement("div");
htmlDivElement.className = "play-less";
htmlDivElement.innerHTML = "play vite";

document.querySelector(".main").appendChild(htmlDivElement);

//vite也支持引入css
import "./style/main.css";
import "./style/less/index.less";