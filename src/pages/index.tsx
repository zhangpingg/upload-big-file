/** 流程步骤
 *  1)上传文件
 *  2)点击上传按钮,将文件切片
 *  3)上传所有的文件切片
 *  4)服务器合并切片
 */

import { request } from '@/utils/request';

const SIZE = 1 * 1024 * 1024; // 切片大小

const Index = () => {  
  /** 创建文件切片: File对象继承自 Blob，所以可以用 Blob.slice()方法将文件切成小块来处理 */
  const createFileChunk = (file: File, size = SIZE) => {
    const fileChunkList = []; // 分片(二进制)数组
    let cur = 0;
    while (cur < file.size) {
      fileChunkList.push({ file: file.slice(cur, cur + size) });
      cur += size;
    }
    return fileChunkList;
  }
  /** 合并切片 */
  const mergeRequest = async (fileName: string) => {
    await request({
      url: "http://localhost:8100/merge",
      method: 'post',
      // headers: {
      //   "content-type": "application/json"
      //   // "Content-type": `multipart/form-data; boundary=----${Math.random()}`
      // },
      data: JSON.stringify({
        filename: fileName,
        size: SIZE,
      })
    });
  }
  /** 上传切片 */
  const uploadChunks = async (data: any, fileName: string) => {
    const requestList = data
      .map(({ chunk, hash }: any) => {
        const formData = new FormData(); // 处理表单数据
        formData.append("chunk", chunk);  // 切片
        formData.append("hash", hash);    // 哈希
        formData.append("filename", fileName); // 文件名
        return { formData };
      }).map(({ formData }: any) => {
        return request({
          url: "http://localhost:8100/upload",
          method: 'post',
          data: formData
        })
      }
      );
    await Promise.all(requestList); // 并发请求
    await mergeRequest(fileName);  // 合并切片
  }
  /** 选择文件 */
  const changeFile = async (e: any) => {
    const [file] = e.target.files;  // 上传的文件（是一个二进制的数据）
    const fileChunkList = createFileChunk(file);
    const data = fileChunkList.map(({ file: chunkFile }, index) => ({
      chunk: chunkFile,  // 切片(二进制)
      hash: `${file.name}-${index}`,  // 文件名+下标 Test.zip-0 Test.zip-1...
    }));
    await uploadChunks(data, file.name);
  }

  return (
    <div>
      <input type="file" onChange={changeFile} />
    </div>
  );
}

export default Index;
