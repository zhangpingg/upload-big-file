/** 流程步骤
 *  1)上传文件后,将文件切片
 *  2)上传所有的文件切片
 *  3)服务器接收到所有的切片,并合并切片
 */

import { useRef, useState } from 'react';
import { request } from '@/utils/request';
import { Progress } from 'antd';

const SIZE = 5 * 1024 * 1024; // 切片大小

const Index = () => {
  const workerRef = useRef<Worker>();
  const fileHashRef = useRef<any>();
  const [percent, setPercent] = useState<number>(0);

  /** 创建文件切片: File对象继承于Blob，所以可以用Blob.slice()方法将文件切成小块来处理 */
  const createFileChunk = (file: File, size = SIZE) => {
    const fileChunkList = []; // 文件切片(二进制)数组
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
      data: JSON.stringify({
        fileName: fileName,
        size: SIZE,
        fileHash: fileHashRef.current,
      })
    });
  }
  /** 上传切片 */
  const uploadChunks = async (chunkData: any, fileName: string) => {
    const requestList = chunkData
      .map((item: any) => {
        const formData = new FormData();        // 封装表单数据
        formData.append("chunk", item?.chunk);  // 切片
        formData.append("hash", item?.hash);    // 哈希
        formData.append("fileHash", item.fileHash);  // 文件内容hash
        formData.append("fileName", fileName);  // 文件名
        return { formData };
      }).map((item: any) => {
        return request({
          url: "http://localhost:8100/upload",
          method: 'post',
          data: item.formData,
        })
      }
      );
    await Promise.all(requestList); // 并发请求,上传所有的文件切片
    await mergeRequest(fileName);  // 合并切片
  }
  /** 创建进度条 */
  // const createProgressHandler = (item: any) => {
  //   return (e: any) => {
  //     item.percentage = parseInt(String((e.loaded / e.total) * 100));
  //   };
  // };
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
    const file = e.target.files[0];  // 数组每个元素都是File对象
    const fileName = file.name;
    const fileChunkList = createFileChunk(file);
    const fileHash = await calculateHash(fileChunkList);
    fileHashRef.current = fileHash;
    const chunkData = fileChunkList.map((item, index) => ({
      chunk: item.file,
      hash: `${fileHash}-${index}`,  // 文件名+下标 Test.zip-0 Test.zip-1...
      fileHash,
    }));
    await uploadChunks(chunkData, fileName);
  }

  return (
    <div>
      <input type="file" onChange={changeFile} />
      <Progress percent={percent} />
    </div>
  );
}

export default Index;
