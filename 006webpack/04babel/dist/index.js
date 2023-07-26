"use strict";

var arr = [1, 2, 3, 4];
var sum = arr.reduce(function (x, y) {
  return x + y;
}, 0);
console.log(sum);