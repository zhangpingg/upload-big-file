# 问题
1. 服务端合并切片失败（fetch, axios有问题）
2. ArrayBuffer
3. multiparty.Form()


# 笔记
1. FormData
  一种表示表单数据的键值对 key/value 的构造方式（有点类似Map）
  FormData 对象能够设置三种类型的值，string、Blob、File，所以我们不需要转换格式，可以直接传文件
2. Blob（浏览器端）
  一种二进制数据容器，它可以存储任意类型的数据，例如图片、音频、视频、文本等。Blob对象可以通过JavaScript中的Blob构造函数创建，也可以通过使用File对象或者从其他API中获取到的数据来创建。
  (1) File对象继承自 Blob，所以可以用 Blob.slice()方法将文件切成小块来处理
3. Buffer（Node端） 
  是一个类，也是一种二进制数据容器（可以简单理解为Array）
4. bsee64编码
  是一种将二进制数据转换为 ASCII 字符串的编码方式
  Base64编码是一种用64个字符来表示任意二进制数据的方法
  优点：不需要考虑传输的数据是二进制还是文本，只需要将其转换为Base64编码即可




