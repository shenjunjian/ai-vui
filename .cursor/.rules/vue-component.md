1. 按标准的Vue3 组合式语法编写，组件的模板参考`scripts\add-component\src\component-template` 的结构。
2. 所有的computed变量，都可以定义到state变量中
3. 模板中使用icon的时候，使用类名来表示icon, 比如 ci-home。 每一个组件需要的图标会在 rfcs 中提前约定好。
4. 定义状态切换类事件时，统一要添加一个beforeXXx的属性，比如closed事件，要添加 beforeClose属性，接收一个函数返回false或 Promise<boolean> 或异步中有错误时，表示取消。
   closed事件表示已经触发完毕。
