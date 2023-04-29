const http = require('http');

const server = http.createServer();       // 搭建一个简单的服务器

server.on('request', (req, res) => {      // 监听接口请求,处理相应的请求结果
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  });
  if (req.url === '/submitForm') {
    res.write('结果1');
  }
})
server.listen(9000);