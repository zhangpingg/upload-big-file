# 问题
1. 服务端合并切片失败（fetch, axios有问题）
2. ArrayBuffer 二进制数据缓冲区
3. readAsArrayBuffer 读取一个文件后，怎么下

# 笔记
二进制数据：只是一种数据格式（存储在内存当中）
1. FormData
  是一个用于封装表单数据的API, 键值对key/value的构造方式（有点类似Map）
  FormData 对象能够设置三种类型的值，string、Blob、File，所以我们不需要转换格式，可以直接传文件
2. Blob（浏览器端）
  一种二进制数据容器，它可以存储任意类型的数据，例如图片、音频、视频、文本等。Blob对象可以通过JavaScript中的Blob构造函数创建，也可以通过使用File对象或者从其他API中获取到的数据来创建。
  (1) File对象继承自 Blob，所以可以用 Blob.slice()方法将文件切成小块来处理
3. Buffer（Node端） 
  是一个类，也是一种二进制数据容器（可以简单理解为Array）
4. bsee64编码
  把二进制数据转换为base64编码，映射关系用的ASCll （把二进制格式通过编码转换成可见字符）
	Base64编码是一种用64个可打印字符来表示二进制数据的方法
  优点：不需要考虑传输的数据是二进制还是文本，只需要将其转换为Base64编码即可
  Data URL技术，图片数据以base64字符串格式嵌入到了页面中,减少http请求
