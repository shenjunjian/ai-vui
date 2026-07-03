import { createTemplate } from "bingo";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { camelize, capitalize } from "scripts-common";

export default createTemplate({
  // Define your options using Zod schemas
  options: {
    rawName: z.string().describe("组件名称（如：button-group）"),
  },

  // Generate files based on options
  async produce({ options }) {
    const name = camelize(options.rawName);
    const capName = capitalize(name);

    // 辅助函数：递归读取本地目录并转化为 Bingo 要求的嵌套对象格式
    function readDirectoryFiles(dirPath) {
      const result = {};
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          // 如果是目录，递归调用
          result[entry.name] = readDirectoryFiles(fullPath);
        } else {
          // 如果是文件，读取文本内容
          let content = fs.readFileSync(fullPath, "utf8");

          content = content
            .replaceAll("$rawName$", options.rawName)
            .replaceAll("$name$", name)
            .replaceAll("$capName$", capName);

          result[entry.name.replace("name", options.rawName)] = content;
        }
      }

      console.log("readDirectoryFiles result= ", result);
      return result;
    }

    console.log("produce will return ");

    return {
      // see https://www.create.bingo/build/concepts/creations#files
      // 通过 vp create 启动时，当前路径为ai-vui\packages\
      files: readDirectoryFiles("../scripts/add-component/src/component-template"),
    };
  },
});
