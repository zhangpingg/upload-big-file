import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    const obj = new Buffer('abcd');
    console.log(obj);            // <Buffer 61 62 63 64> 二进制数据
    console.log(String(obj))     // abcd
  }, [])

  return (<div>11</div>)
}

export default Index;
