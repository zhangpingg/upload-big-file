// spark-md5.min.js 根据文件内容计算出文件的 hash 值

self.importScripts("./spark_md5.min.js");

// worker线程：接受信息，生成hash
self.onmessage = (e) => {
  const { fileChunkList } = e.data;
  const spark = new self.SparkMD5.ArrayBuffer();
  let percentage = 0;
  let count = 0;
  const loadNext = (index) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(fileChunkList[index].file);  // 读取文件切片
    reader.onload = (e) => {    // e:读取到的文件切片
      count++;
      spark.append(e.target.result);
      if (count === fileChunkList.length) {
        self.postMessage({
          percentage: 100,    // 进度
          hash: spark.end(),  // hash
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