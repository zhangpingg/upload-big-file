import { useRef, useState } from 'react';
import SparkMD5 from 'spark-md5';

const Index = () => {
  const changeFile = (e: any) => {
    // 创建md5实例（因为创建是ArrayBuffer，所以下面接收的也是这种）
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);  // 把Blob转换成ArrayBuffer
    reader.onload = (e: any) => {
      spark.append(e.target.result)
      const hash = spark.end();   // 文件内容的hash（5ee062942e1c969f1215859aff653268）
    }
  };

  return (
    <div>
      <input type="file" onChange={changeFile} />
    </div>
  );
};

export default Index;