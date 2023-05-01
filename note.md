# 问题
1. 服务端合并切片失败（fetch, axios有问题）(import { request } from 'umi')
2. ArrayBuffer 二进制数据缓冲区
3. 上传文件的进度（还是要计算每个切片的上传进度）
4. 恢复上传报错

# 笔记
二进制数据：只是一种数据格式（存储在内存当中）
1. FormData
  是一个用于封装表单数据的API, 键值对key/value的构造方式（有点类似Map）
  FormData 对象能够设置三种类型的值，string、Blob、File，所以我们不需要转换格式，可以直接传文件
2. Blob（浏览器端）
  一种二进制数据容器，它可以存储任意类型的数据，例如图片、音频、视频、文本等。Blob对象可以通过JavaScript中的Blob构造函数创建，也可以通过使用File对象或者从其他API中获取到的数据来创建。
  Blob是存储原始二进制数据 (存储任意值 | 如图片、音频、视频、文本等)
  (1) File对象继承自 Blob，所以可以用 Blob.slice()方法将文件切成小块来处理
3. Buffer（Node端） 
  是一个类，也是一种二进制数据容器（可以简单理解为Array）
4. bsee64编码
  把二进制数据转换为base64编码，映射关系用的ASCll （把二进制格式通过编码转换成可见字符）
	Base64编码是一种用64个可打印字符来表示二进制数据的方法
  优点：不需要考虑传输的数据是二进制还是文本，只需要将其转换为Base64编码即可
  Data URL技术，图片数据以base64字符串格式嵌入到了页面中,减少http请求


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
