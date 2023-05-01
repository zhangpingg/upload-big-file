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
    readStream.on("end", () => {
      fs.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream); // 读取的流，写进目的地的路径
  });
};
/** 合并切片 */
const mergeFileChunk = async (filePath, fileHash, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, `chunkDir_${fileHash}`); // chunk目录路径
  const chunkList = await fs.readdir(chunkDir);
  chunkList.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  chunkList.map((chunk, index) => {
    pipeStream(
      path.resolve(chunkDir, chunk),
      fs.createWriteStream(filePath, { start: index * size }),  // 创建一个可写流
    );
  });
};
/** 获取扩展名 */
const getExtension = (fileName) => {
  return path.parse(fileName).ext;
}
/** 已上传的所有切片名 */
const createUploadedList = async (fileHash) => {
  const chunkDir = path.resolve(UPLOAD_DIR, `chunkDir_${fileHash}`);
  return fs.existsSync(chunkDir)
    ? await fs.readdir(chunkDir)
    : [];
}

server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONs") {
    res.statusCode = 200;
    res.end();
    return;
  }
  if (req.url === '/upload') {
    const multipart = new multiparty.Form();
    multipart.parse(req, async (error, fields, files) => {
      if (error) {
        console.log(error);
        return;
      }
      const [chunk] = files.chunk;
      const [hash] = fields.hash;
      // const [fileName] = fields.fileName;
      const [fileHash] = fields.fileHash;
      const chunkDir = path.resolve(UPLOAD_DIR, `chunkDir_${fileHash}`);
      if (!fs.existsSync(chunkDir)) {
        await fs.mkdirs(chunkDir);
      }
      // chunk.path 存储临时文件的路径
      await fs.move(chunk.path, `${chunkDir}/${hash}`); // 移动某个目录或文件
      res.end(JSON.stringify({
        code: 1,
        message: "chunk upload success",
      }));
    });
  } else if (req.url === '/merge') {
    const data = await getParamsData(req);
    const { fileName, size, fileHash } = data;
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${getExtension(fileName)}`);  //合并后的文件路径
    await mergeFileChunk(filePath, fileHash, size);
    res.writeHead(200, {
      "content-type": "application/json",
    });
    res.end(
      JSON.stringify({
        code: 0,
        message: "文件合并成功",
      })
    );
  } else if (req.url === '/verify') {
    const data = await getParamsData(req);
    const { fileName, fileHash } = data;
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${getExtension(fileName)}`)
    if (fs.existsSync(filePath)) {
      res.end(
        JSON.stringify({
          shouldUpload: false
        })
      );
    } else {
      res.end(
        JSON.stringify({
          shouldUpload: true,
          uploadedList: await createUploadedList(fileHash),
        })
      );
    }
  }
});

server.listen(8100, () => {
  console.log("listening port 8100");
});
