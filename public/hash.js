// spark-md5.min.js 根据文件内容计算出文件的 hash 值

self.importScripts("./spark_md5.min.js"); // 导入脚本 （npm install --save-dev spark-md5）

// worker线程：接受信息，生成hash
self.onmessage = (e) => {
  const { fileChunkList } = e.data;
  const spark = new self.SparkMD5.ArrayBuffer();  // 创建md5实例（因为创建是ArrayBuffer，所以下面接收的也是这种）
  let percentage = 0;
  let count = 0;
  const loadNext = (index) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(fileChunkList[index].file);  // Blob格式转换为ArrayBuffer格式
    reader.onload = (e) => {
      count++;
      spark.append(e.target.result); // 添加切片（Blob格式）
      if (count === fileChunkList.length) {
        self.postMessage({
          percentage: 100,    // 进度
          hash: spark.end(),  // hash, 根据内容获取唯一的hash（文件内容不会根据文件名修改而改变）
        })
        self.close();
      } else {
        percentage += 100 / fileChunkList.length;
        self.postMessage({ percentage });   // 向主线程发送事件
        loadNext(count);
      }
    }
  }
  loadNext(0);
}