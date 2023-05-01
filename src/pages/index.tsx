import { useRef, useState } from 'react';
import { Progress, message, Button } from 'antd';
import { request } from '@/utils/request';

const SIZE = 5 * 1024 * 1024; // 切片大小

const Index = () => {
  const fileContainerRef = useRef<any>({
    file: null,
    worker: {}, // worker线程
    fileHash: '', // 文件内容的hash
    requestXhrList: [], // 正常上传切片的接口对象
    uploadedNum: 0,   // 已上传切片的数量
  });
  const [hashPercent, setHashPercent] = useState<number>(0);
  const [uploadPercent, setUploadPercent] = useState(0);

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
    const { file, fileHash } = fileContainerRef.current;
    await request({
      url: "http://localhost:8100/merge",
      method: 'post',
      data: JSON.stringify({
        fileName: file?.name,
        size: SIZE,
        fileHash,
      })
    });
  }
  /** 上传切片 */
  const uploadChunks = async (uploadedList = [] as any) => {
    const { file, chunkData, requestXhrList } = fileContainerRef.current;
    const requestList = chunkData
      .filter(({ hash }: any) => !uploadedList.includes(hash))
      .map((item: any) => {
        const formData = new FormData();        // 封装表单数据
        formData.append("chunk", item?.chunk);  // 切片
        formData.append("hash", item?.hash);    // 哈希
        formData.append("fileHash", item.fileHash);  // 文件内容hash
        formData.append("fileName", file?.name!);  // 文件名
        return { formData };
      }).map(async (item: any) => {
        const res: any = await request({
          url: "http://localhost:8100/upload",
          method: 'post',
          data: item.formData,
          requestList: requestXhrList,
        })
        const data = JSON.parse(res.data);
        if (data?.code === 1) {
          fileContainerRef.current.uploadedNum++;
          setUploadPercent(100 / chunkData.length * fileContainerRef.current.uploadedNum);
        }
        return data;
      }
      );
    await Promise.all(requestList); // 并发请求,上传所有的文件切片
    // 之前上传的切片数量 + 本次上传的切片数量 = 所有切片数量时合并切片
    if (uploadedList.length + requestList.length === chunkData.length) {
      await mergeRequest();
    }
  }
  /** 计算hash */
  const calculateHash = (fileChunkList: any[]) => {
    return new Promise((resolve) => {
      // 主线程
      const worker = new Worker('/hash.js');
      worker.postMessage({ fileChunkList });
      worker.onmessage = (e: any) => {
        const { percentage, hash } = e.data;
        setHashPercent(percentage);
        if (hash) {
          resolve(hash);
        }
      }
      fileContainerRef.current.worker = worker;
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
    fileContainerRef.current.file = e.target.files[0];  // 数组每个元素都是File对象
  }
  /** 上传文件 */
  const uploadFile = async () => {
    const { file } = fileContainerRef.current;
    if (!file) {
      message.info('请先上传文件');
      return;
    };
    const fileChunkList = createFileChunk(file);
    const fileHash = await calculateHash(fileChunkList);
    const { shouldUpload, uploadedList } = await verifyUpload(file.name, fileHash);
    if (!shouldUpload) {
      message.success('文件上传成功 (实际上服务器已经文件了，不需要上传，这里只是给客户看的假象)');
      return;
    }
    fileContainerRef.current.chunkData = fileChunkList.map((item, index) => ({
      chunk: item.file,
      hash: `${fileHash}-${index}`,
      fileHash,
    }));
    fileContainerRef.current.fileHash = fileHash;
    await uploadChunks(uploadedList);
  }
  /** 暂停上传 */
  const pauseUpload = () => {
    const { requestXhrList } = fileContainerRef.current;
    requestXhrList.forEach((xhr: any) => xhr?.abort()); // 取消请求
    fileContainerRef.current.requestXhrList = [];
  }
  /** 恢复上传 */
  const resumeUpload = async () => {
    const { file, fileHash } = fileContainerRef.current;
    if (!file) return;
    const { uploadedList } = await verifyUpload(file.name, fileHash);
    await uploadChunks(uploadedList);
  }
  /** 删除服务器端存放切片的目录 */
  const deleteChunkDir = async () => {
    const res: any = await request({
      url: "http://localhost:8100/delete",
      method: 'post',
    });
    const data = JSON.parse(res?.data);
    message.success(data.message);
  }

  return (
    <div>
      <input type="file" onChange={changeFile} />
      <div>计算文件内容 hash 的进度：<Progress percent={hashPercent} style={{ width: '400px' }} /></div>
      <div>上传文件的进度：<Progress percent={uploadPercent} style={{ width: '400px' }} /></div>
      <Button onClick={uploadFile}>上传</Button>
      <Button onClick={pauseUpload}>暂停上传</Button>
      <Button type='primary' onClick={resumeUpload}>恢复上传</Button>
      <Button onClick={deleteChunkDir}>删除</Button>
    </div>
  );
}

export default Index;
