/** 流程步骤
 *  1)上传文件
 *  2)点击上传按钮,将文件切片
 *  3)上传所有的文件切片
 *  4)服务器合并切片
 */

import { useState } from "react";
import axios from 'axios';
import fetch from 'isomorphic-fetch';
import { request } from '@/utils/request';

const Index = () => {
  const SIZE = 1 * 1024 * 1024; // 切片大小
  const [container, setContainer] = useState<any>()

  /** change文件 */
  const handleFileChange = (e) => {
    const [file] = e.target.files;
    if (!file) return;
    setContainer({ file })
  }
  /** 生成文件切片 */
  const createFileChunk = (file: any, size = SIZE) => {
    const fileChunkList = []; // 分片列表
    let cur = 0;
    while (cur < file.size) {
      fileChunkList.push({ file: file.slice(cur, cur + size) });
      cur += size;
    }
    return fileChunkList;
  }
  /** 合并切片 */
  const mergeRequest = async () => {
    await request({
      url: "http://localhost:8100/merge",
      method: 'post',
      headers: {
        "content-type": "application/json"
        // "Content-type": `multipart/form-data; boundary=----${Math.random()}`
      },
      data: JSON.stringify({
        filename: container.file.name,
        size: SIZE,
      })
    });
    // await fetch('https://localhost:3000/merge', {
    //   method: 'post',
    //   mode: 'cors',
    //   headers: {
    //     "Content-type": "application/json; charset=UTF-8"
    //     // "Content-type": "multipart/form-data"
    //   },
    //   data: JSON.stringify({
    //     filename: container.file.name
    //   })
    // });
  }
  /** 上传切片 */
  const uploadChunks = async (data: any) => {
    const requestList = data
      .map(({ chunk, hash }) => {
        const formData = new FormData();
        formData.append("chunk", chunk);  // 切片
        formData.append("hash", hash);    // 哈希
        formData.append("filename", container.file.name); // 文件名
        return { formData };
      }).map(({ formData }) => {
        return request({
          url: "http://localhost:8100/upload",
          method: 'post',
          data: formData
        })
      }
      );
    await Promise.all(requestList); // 并发请求
    await mergeRequest();  // 合并切片
  }
  /** 上传 */
  const handleUpload = async () => {
    if (!container?.file) return;
    const fileChunkList = createFileChunk(container.file);
    const _data = fileChunkList.map(({ file }, index) => ({
      chunk: file,
      // 文件名 + 数组下标
      hash: container.file.name + "-" + index
    }));
    await uploadChunks(_data);
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>upload</button>
    </div>
  );
}

export default Index;
