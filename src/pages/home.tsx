import { Button } from 'antd';
import { history } from 'umi';

const Home = () => {

  const jumpPage = (page: string) => {
    history.push(`/${page}`);
  }

  return (
    <div>
      <Button onClick={() => jumpPage('formSmallFile')}>原始表单上传</Button>
      <Button onClick={() => jumpPage('uploadBigFile')}>大文件上传</Button>
    </div>
  )
};

export default Home;
