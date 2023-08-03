const obj = {
    name: 'John',
    age: 30
} as const;

//意思是obj对象的属性值不可修改
// obj.name = 'Tom';   //报错