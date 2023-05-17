import { useState } from 'react';
import { Form, Input, Button } from 'antd';
import request from "umi-request";

// 表单（输入框+文件） FormData
const Index = () => {
  const [form] = Form.useForm();
  const [file, setFile] = useState('');

  const changeFile = (e: any) => {
    setFile(e.target.files[0]);
  }
  const submit = async () => {
    const params = form.getFieldsValue(true);
    const formData = new FormData();
    formData.append('name', params.name);
    formData.append('age', params.age);
    formData.append('picName', 'pic');
    formData.append('pic', file);
    console.log(formData);
    const res = await request('http://localhost:9001/submitForm', {
      method: 'post',
      data: formData
    })
    console.log(res);
  }

  return (
    <Form form={form}>
      <Form.Item label="名称" name="name">
        <Input />
      </Form.Item>
      <Form.Item label="年龄" name="age">
        <Input />
      </Form.Item>
      <Form.Item label="年龄">
        <Input type="file" onChange={changeFile} />
      </Form.Item>
      <Button type='primary' onClick={submit}>提交</Button>
    </Form>
  );
};

export default Index;