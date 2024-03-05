# 分片上传大文件

```bash
大文件上传
  1)前端上传大文件时使用 Blob.prototype.slice 将文件切片，并发上传多个切片，
    最后发送一个合并的请求通知服务端合并切片
  2)服务端接收切片并存储，收到合并请求后使用流将切片合并到最终文件
断点续传
  1)使用 spark-md5 根据文件内容算出文件 hash
  2)通过 hash 可以判断服务端是否已经上传该文件，从而直接提示用户上传成功（秒传）
  3)通过 XMLHttpRequest 的 abort 方法暂停切片的上传
  4)上传前服务端返回已经上传的切片名，前端跳过这些切片的上传

参考：https://juejin.cn/post/6844904046436843527?spm=a2c6h.12873639.article-detail.7.5d82753dJfmthy#heading-3
```
