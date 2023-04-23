// node server 启动本地服务
// const http = require("http");
// const path = require("path");
// const fse = require("fs-extra");
// const multiparty = require("multiparty");

// const server = http.createServer();
// const UPLOAD_DIR = path.resolve(__dirname, "target"); // 大文件存储目录

// server.on("request", async (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   if (req.method === "OPTIONS") {
//     res.status = 200;
//     res.end();
//     return;
//   }
//   switch (req.url) {
//     case '/upload':
//       res.end('request success');
//       break;
//     case '/merge':
//       const multipart = new multiparty.Form();  //  multiparty 处理前端传来的 formData
//       // console.log('req', req);
//       multipart.parse(req, async (err, fields, files) => {
//         console.log(11, err);
//         console.log(22, fields);
//         console.log(33, files);
//         if (err) {
//           return;
//         }
//         console.log('files', files);
//         const [chunk] = files.chunk;
//         const [hash] = fields.hash;
//         const [filename] = fields.filename;
//         // 创建临时文件夹用于临时存储 chunk
//         // 添加 chunkDir 前缀与文件名做区分
//         const chunkDir = path.resolve(UPLOAD_DIR, 'chunkDir' + filename);

//         if (!fse.existsSync(chunkDir)) {
//           await fse.mkdirs(chunkDir);
//         }

//         // fs-extra 的 rename 方法 windows 平台会有权限问题
//         // @see https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
//         await fse.move(chunk.path, `${chunkDir}/${hash}`);
//         res.end("received file chunk");
//       });
//       break;
//   }
// });

// server.listen(3000, () => console.log("listening port 3000"));


const http = require("http");
const fs = require("fs-extra");
const multiparty = require("multiparty");
const path = require("path");

const server = http.createServer();
// 切片临时存储的文件夹 D:\study\yafei_UploadBigFile\target
const UPLOAD_DIR = path.resolve(__dirname, "target");

/** 获取前端传来的filename, size */
const resolvePost = (req) =>
  new Promise((resolve) => {
    let dataStr = ""; // 为什么不是正常的json字符串 {"a":1,"b":2} ？？？
    req.on("data", (data) => {
      dataStr += data;
    });
    req.on("end", () => {
      resolve(JSON.parse(dataStr)); // { filename: 'Test.zip', size: 1048576 }
    });
  });

const pipeStream = (path, writeStream) => {
  return new Promise((resolve) => {
    const readStream = fs.createReadStream(path); // 读取文件流
    // 文件读取完成
    readStream.on("end", () => {
      fs.unlinkSync(path);  // 同步删除文件
      resolve();
    });
    readStream.pipe(writeStream); // 读取的流，写进目的地的路径
  });
};
/** 合并切片 */
const mergeFileChunk = async (filePath, filename, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, "chunkDir_" + filename); // chunk文件夹
  const chunkPaths = await fs.readdir(chunkDir);
  console.log('chunkPaths', chunkPaths);
  chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  chunkPaths.map((chunk, index) => {
    pipeStream(
      path.resolve(chunkDir, chunk),
      fs.createWriteStream(filePath, { start: index * size }),  // 创建一个可写流
    );
  });
};

server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONs") {
    res.statusCode = 200;
    res.end();
    return;
  }
  // 每次上传分片请求都会走这里
  const multipartyInstance = new multiparty.Form();
  // fields-哈希,文件名  files-切片信息(即chunck)
  multipartyInstance.parse(req, async (error, fields, files) => {
    if (error) {
      console.log(error);
      return;
    }
    const [chunk] = files.chunk;
    const [hash] = fields.hash;
    const [filename] = fields.filename;
    const chunkDir = path.resolve(UPLOAD_DIR, "chunkDir_" + path.parse(filename).base);
    if (!fs.existsSync(chunkDir)) {
      await fs.mkdirs(chunkDir);
    }
    // chunk.path 存储临时文件的路径
    await fs.move(chunk.path, `${chunkDir}/${hash}`); // 移动某个目录或文件
    res.end("chunk upload success");
  });

  if (req.url === "/merge") {
    const data = await resolvePost(req);
    const { filename, size } = data;
    // D:\study\yafei_UploadBigFile\target\Test.zip
    const filePath = path.resolve(UPLOAD_DIR, filename);
    await mergeFileChunk(filePath, filename, size);
    res.writeHead(200, {
      "content-type": "application/json",
    });
    res.end(
      JSON.stringify({
        code: 0,
        message: "文件合并成功",
      })
    );
  }
});

server.listen(8100, () => {
  console.log("listening port 8100");
});
