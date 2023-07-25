const path = require("path")

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "./build"),
        filename: "output.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                // loader: "css-loader"
                use: [
                    // "css-loader",//这里如果只有这一个loader是搞不定的
                    { loader: "style-loader", options: {} },//执行的顺序居然是从后往前的!!!？？？
                    { loader: "css-loader", options: {} },//完整的写法
                    {
                        //事实上这个对象里面的内容可以抽出去
                        //抽成postcss.config.js文件
                        loader: "postcss-loader", options: {
                            postcssOptions: {
                                plugins: [
                                    // require("autoprefixer"),// 这个用的比较少
                                    require("postcss-preset-env")
                                ]
                            }
                        }
                    }

                ]
            }
        ]
    }
}