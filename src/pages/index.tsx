/** 流程步骤
 *  1)上传文件
 *  2)点击上传按钮,将文件切片
 *  3)上传所有的文件切片
 *  4)服务器合并切片
 */

import { useRef, useState } from 'react';
import { request } from '@/utils/request';
import { Progress } from 'antd';

const SIZE = 1 * 1024 * 1024; // 切片大小

const Index = () => {
  const workerRef = useRef<Worker>();
  const [percent, setPercent] = useState<number>(0);

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
  /** 创建进度条 */
  const createProgressHandler = (item: any) => {
    return (e: any) => {
      item.percentage = parseInt(String((e.loaded / e.total) * 100));
    };
  };
  /** 上传切片 */
  const uploadChunks = async (data: any, fileName: string) => {
    const requestList = data
      .map((item: any, index: number) => {
        const formData = new FormData(); // 处理表单数据
        formData.append("chunk", item?.chunk);  // 切片
        formData.append("hash", item?.hash);    // 哈希
        formData.append("filename", fileName); // 文件名
        return { formData, index };
      }).map((item: any) => {
        return request({
          url: "http://localhost:8100/upload",
          method: 'post',
          data: item.formData,
          onProgress: createProgressHandler(data[item.index]),
        })
      }
      );
    await Promise.all(requestList); // 并发请求
    await mergeRequest(fileName);  // 合并切片
  }
  /** 计算hash */
  const calculateHash = (fileChunkList: any[]) => {
    return new Promise((resolve) => {
      // 主线程
      workerRef.current = new Worker('/hash.js');
      workerRef.current.postMessage({ fileChunkList });
      workerRef.current.onmessage = (e) => {
        const { percentage, hash } = e.data;
        setPercent(percentage);
        if (hash) {
          resolve(hash);
        }
      }
    })
  }
  /** 选择文件 */
  const changeFile = async (e: any) => {
    const [file] = e.target.files;  // 上传的文件（是一个二进制的数据）
    const fileChunkList = createFileChunk(file);
    const fileHash = calculateHash(fileChunkList);
    const data = fileChunkList.map(({ file: chunkFile }, index) => ({
      chunk: chunkFile,  // 切片(二进制)
      hash: `${file.name}-${index}`,  // 文件名+下标 Test.zip-0 Test.zip-1...
      index,
      percentage: 0,
      fileHash,
    }));
    await uploadChunks(data, file.name);
  }

  return (
    <div>
      <input type="file" onChange={changeFile} />
      <Progress percent={percent} />
    </div>
  );
}

export default Index;
