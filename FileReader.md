# FileReader
异步读取文件(或原始数据缓冲区) 的内容，可以将Blob读取为不同的格式
唯一目的是读取blob对象中的数据
const reader = new FileReader(); // 创建FileReader对象
1)基本使用
  (1)对象属性
    error：在读取文件时发生的错误
    result：文件内容（该属性仅在读取操作完成后才有效）
    readyState：FileReader读取状态的数字
      0-还没有加载任何数据
      1-数据正在被加载
      2-已完成全部的读取请求
  (2)FileReader对象的方法来加载文件：
      FileReader.readAsText()：读取指定Blob中的内容，完成之后，result属性中保存了一个字符串
      FileReader.readAsDataURL()：读取指定 Blob 中的内容，完成之后，result属性中保存data: URL 格式的 Base64 字符串（如：图片）
      FileReader.readAsArrayBuffer()：读取指定Blob中的内容，完成之后，result 属性中保存 ArrayBuffer 数据对象
      FileReader.readAsBinaryString()：读取指定 Blob 中的内容，完成之后，result 属性中保存原始二进制数据
2) 事件处理
  onabort：在读取操作被中断时触发；
  onerror：在读取操作发生错误时触发；
  onload：在读取操作完成时触发；
  onprogress：在读取 Blob 时触发，也可以监控文件的上传进度
