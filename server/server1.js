const http = require("http");
const fs = require("fs-extra");
const multiparty = require("multiparty");
const path = require("path");

const server = http.createServer();
const UPLOAD_DIR = path.resolve(__dirname, "target1");  // 切片|合并后的文件所存储的目录

/** 获取前端传来的fileName, size */
const getParamsData = (req) =>
  new Promise((resolve) => {
    let dataStr = "";
    req.on("data", (data) => {
      dataStr += data;  // 通过post请求，服务器接受到的是流数据(<Buffer 1a 2b>)，隐式转换为字符串
    });
    req.on("end", (data) => {
      resolve(JSON.parse(dataStr)); // { fileName: 'xone.zip', size: 1048576 }
    });
  });
/** 读取切片文件流, 合并到目标文件中 */
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
const mergeFileChunk = async (filePath, fileName, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, "chunkDir_" + fileName); // chunk目录路径
  const chunkList = await fs.readdir(chunkDir);
  chunkList.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  chunkList.map((chunk, index) => {
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
  switch (req.url) {
    case '/upload':
      const multipart = new multiparty.Form();
      multipart.parse(req, async (error, fields, files) => {
        if (error) {
          console.log(error);
          return;
        }
        const [chunk] = files.chunk;
        const [hash] = fields.hash;
        const [fileName] = fields.fileName;
        const chunkDir = path.resolve(UPLOAD_DIR, "chunkDir_" + fileName);
        if (!fs.existsSync(chunkDir)) {
          await fs.mkdirs(chunkDir);
        }
        // chunk.path 存储临时文件的路径
        await fs.move(chunk.path, `${chunkDir}/${hash}`); // 移动某个目录或文件
        res.end("chunk upload success");
      });
      break;
    case '/merge':
      const data = await getParamsData(req);
      const { fileName, size } = data;
      const filePath = path.resolve(UPLOAD_DIR, fileName);  //合并后的文件路径
      await mergeFileChunk(filePath, fileName, size);
      res.writeHead(200, {
        "content-type": "application/json",
      });
      res.end(
        JSON.stringify({
          code: 0,
          message: "文件合并成功",
        })
      );
      break;
  }
});

server.listen(8100, () => {
  console.log("listening port 8100");
});
