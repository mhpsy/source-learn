使用两个插件
npx babel  src/index.js --out-dir dist --plugins=@babel/plugin-transform-arrow-functions,@babel/plugin-transform-block-scoping

使用预设
npx babel  src/index.js --out-dir dist --presets=@babel/preset-env
