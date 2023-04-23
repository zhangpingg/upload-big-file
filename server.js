// node server 启动本地服务
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
    let dataStr = "";
    // 每次发送的数据
    req.on("data", (data) => {
      dataStr += data;  // 通过post请求，服务器接受到的是流数据(<Buffer 1a 2b>)，隐式转换为字符串
    });
    // 数据发送完成
    req.on("end", () => {
      resolve(JSON.parse(dataStr)); // { filename: 'Test.zip', size: 1048576 }
    });
  });
/** 读取切片文件流, 传输合并到目标文件中 */
const pipeStream = (path, writeStream) => {
  return new Promise((resolve) => {
    const readStream = fs.createReadStream(path); // 读取切片文件流
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
  const multipartyInstance = new multiparty.Form(); //  处理前端传来的 formData
  // files保存了formData中文件，fields参数保存了formData中非文件的字段
  // 即 fields-哈希,文件名  files-切片信息(即chunck)
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
