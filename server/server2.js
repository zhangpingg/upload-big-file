const http = require('http');
const path = require("path");
const multiparty = require("multiparty");
const fs = require("fs-extra");

const server = http.createServer();       // 搭建一个简单的服务器

const UPLOAD_DIR = path.resolve(__dirname, "target2"); // C:\...\uploadBigFile\server\target2

/** 读取文件流, 传输合并到目标文件中 */
const pipeStream = (path, writeStream) => {
  return new Promise((resolve) => {
    const readStream = fs.createReadStream(path); // 读取切片文件流
    // 文件读取完成
    readStream.on("end", () => {
      fs.unlinkSync(path);  // 同步删除文件 (注意:如果不删的话,只能提交一次)
      resolve();
    });
    readStream.pipe(writeStream); // 读取的流，写进目的地的路径
  });
};

server.on('request', (req, res) => {      // 监听接口请求
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  });
  if (req.url === '/submitForm') {
    const form = new multiparty.Form(); // 创建一个表单解析器的实例
    // form.parse()方法解析表单数据
    // fields:表单中的文本字段  files:表单中上传的文件信息
    form.parse(req, async (error, fields, files) => {
      if (error) {
        console.log(error);
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('Internal server error');
        return;
      }
      const fileName = fields['picName'][0];
      const fileDir = path.resolve(UPLOAD_DIR, fileName + '_accept'); // 接收的文件流存储的目录
      await fs.move(files[fields['picName']][0].path, `${fileDir}`); // 移动某个目录或文件
      const filePath = path.resolve(UPLOAD_DIR, fileName + '_merge'); // 合并后的文件流目录
      pipeStream(
        fileDir,
        fs.createWriteStream(filePath),  // 创建一个可写流
      );
      res.end("上传成功");
    });
  }
})
server.listen(9000, () => {
  console.log("listening port 9000");
});