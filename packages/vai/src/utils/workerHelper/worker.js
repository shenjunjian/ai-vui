self.onmessage = async function (e) {
  try {
    const { fnStr, args } = e.data;
    const userFn = self[fnStr] || eval("(" + fnStr + ")");
    const result = await userFn(...args);
    self.postMessage({ success: true, result });
  } catch (err) {
    self.postMessage({
      success: false,
      message: "Worker 执行 fn 异常：" + err?.message,
    });
  }
};

/** 内置一些常用的方法，这样初始化时自动编译后，避免了每个worker内 eval() 出一个函数 */
self["randomArr"] = (list) => {
  return list.map((i) => i + Math.random());
};
