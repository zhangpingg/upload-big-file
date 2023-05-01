/** 大文件上传
 *  1)前端上传大文件时使用 Blob.prototype.slice 将文件切片，并发上传多个切片，
 *    最后发送一个合并的请求通知服务端合并切片
 *  2)服务端接收切片并存储，收到合并请求后使用流将切片合并到最终文件
 */
/** 断点续传
 *  1)使用 spark-md5 根据文件内容算出文件 hash
 *  2)通过 hash 可以判断服务端是否已经上传该文件，从而直接提示用户上传成功（秒传）
 *  3)通过 XMLHttpRequest 的 abort 方法暂停切片的上传
 *  4)上传前服务端返回已经上传的切片名，前端跳过这些切片的上传
 */

import { useMemo, useRef, useState } from 'react';
import { Progress, message, Button } from 'antd';
import { request } from '@/utils/request';

const SIZE = 5 * 1024 * 1024; // 切片大小

const Index = () => {
  const [file, setFile] = useState<File | undefined>();
  const workerRef = useRef<Worker>();
  const fileHashRef = useRef<any>('');
  const requestListRef = useRef<any>([]); // 只保存正在上传切片的 xhr
  const chunkDataRef = useRef<any[]>([]);
  const [percent, setPercent] = useState<number>(0); // 计算文件内容的hash进度

  // const uploadPercentage = useMemo(() => {
  //   if (!file || !chunkDataRef.current.length) return 0;
  //   const loaded = chunkDataRef.current
  //     .map(item => item.size * item.percentage)
  //     .reduce((acc, cur) => acc + cur);
  //   return parseInt((loaded / file.size).toFixed(2));
  // }, []);
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
  const mergeRequest = async () => {
    await request({
      url: "http://localhost:8100/merge",
      method: 'post',
      data: JSON.stringify({
        fileName: file?.name,
        size: SIZE,
        fileHash: fileHashRef.current,
      })
    });
  }
  /** 上传切片 */
  const uploadChunks = async (uploadedList = [] as any) => {
    const list = chunkDataRef.current
      .filter(({ hash }) => !uploadedList.includes(hash))
    const requestList = list
      .map((item: any) => {
        const formData = new FormData();        // 封装表单数据
        formData.append("chunk", item?.chunk);  // 切片
        formData.append("hash", item?.hash);    // 哈希
        formData.append("fileHash", item.fileHash);  // 文件内容hash
        formData.append("fileName", file?.name!);  // 文件名
        return { formData };
      }).map((item: any) => {
        return request({
          url: "http://localhost:8100/upload",
          method: 'post',
          data: item.formData,
          requestList: requestListRef.current,
        })
      }
      );
    await Promise.all(requestList); // 并发请求,上传所有的文件切片
    // 之前上传的切片数量 + 本次上传的切片数量 = 所有切片数量时合并切片
    if (uploadedList.length + requestList.length === chunkDataRef.current.length) {
      await mergeRequest();
    }
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
  /** 验证上传 */
  const verifyUpload = async (fileName: string, fileHash: string | unknown) => {
    const res: any = await request({
      url: "http://localhost:8100/verify",
      method: 'post',
      data: JSON.stringify({
        fileName,
        fileHash,
      })
    });
    return JSON.parse(res?.data);
  };
  /** 选择文件 */
  const changeFile = async (e: any) => {
    setFile(e.target.files[0]) // 数组每个元素都是File对象
  }
  /** 上传文件 */
  const uploadFile = async () => {
    if (!file) {
      message.info('请先上传文件');
      return;
    };
    const fileChunkList = createFileChunk(file);
    const fileHash = await calculateHash(fileChunkList);
    const { shouldUpload, uploadedList } = await verifyUpload(file.name, fileHash);
    if (!shouldUpload) {
      message.success('file upload success');
      return;
    }
    fileHashRef.current = fileHash;
    chunkDataRef.current = fileChunkList.map((item, index) => ({
      chunk: item.file,
      hash: `${fileHash}-${index}`,  // 文件名+下标 xone.zip-0 xone.zip-1...
      fileHash,
    }));
    await uploadChunks(uploadedList);
  }
  /** 暂停上传 */
  const pauseUpload = () => {
    requestListRef.current.forEach((xhr: any) => xhr?.abort()); // 取消请求
    requestListRef.current = [];
  }
  /** 恢复上传 */
  const resumeUpload = async () => {
    if (!file) return;
    const { uploadedList } = await verifyUpload(file.name, fileHashRef.current);
    await uploadChunks(uploadedList);
  }

  return (
    <div>
      <input type="file" onChange={changeFile} />
      <div>计算文件内容 hash 的进度：<Progress percent={percent} style={{ width: '400px' }} /></div>
      <div>上传文件的进度：？？？</div>
      <Button onClick={uploadFile}>上传</Button>
      <Button onClick={pauseUpload}>暂停上传</Button>
      <Button type='primary' onClick={resumeUpload}>恢复上传</Button>
    </div>
  );
}

export default Index;
