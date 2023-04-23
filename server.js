// node server 启动本地服务
const http = require("http");
const path = require("path");
const fse = require("fs-extra");
const multiparty = require("multiparty");

const server = http.createServer();
const UPLOAD_DIR = path.resolve(__dirname, "target"); // 大文件存储目录

server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status = 200;
    res.end();
    return;
  }
  switch (req.url) {
    case '/upload':
      res.end('request success');
      break;
    case '/merge':
      const multipart = new multiparty.Form();  //  multiparty 处理前端传来的 formData
      multipart.parse(req, async (err, fields, files) => {
        console.log(11, err);
        console.log(22, fields);
        console.log(33, files);
        if (err) {
          return;
        }
        console.log('files', files);
        const [chunk] = files.chunk;
        const [hash] = fields.hash;
        const [filename] = fields.filename;
        // 创建临时文件夹用于临时存储 chunk
        // 添加 chunkDir 前缀与文件名做区分
        const chunkDir = path.resolve(UPLOAD_DIR, 'chunkDir' + filename);

        if (!fse.existsSync(chunkDir)) {
          await fse.mkdirs(chunkDir);
        }

        // fs-extra 的 rename 方法 windows 平台会有权限问题
        // @see https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
        await fse.move(chunk.path, `${chunkDir}/${hash}`);
        res.end("received file chunk");
      });
      res.end('merge success');
      break;
  }
});

server.listen(3000, () => console.log("listening port 3000"));
