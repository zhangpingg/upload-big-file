import { useRef, useState } from 'react';
import { Form, Input, Button } from 'antd';
import 'antd/dist/antd.css';

// 表单（输入框+文件） FormData
const Index = () => {
  const [form] = Form.useForm();

  const submit = () => {
    const params = form.getFieldsValue(true);
    console.log(params);
  }

  return (
    <Form form={form}>
      <Form.Item
        label="名称"
        name="name"
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="年龄"
        name="age"
      >
        <Input />
      </Form.Item>
      <Button type='primary' onClick={submit}>提交</Button>
    </Form>
  );
};

export default Index;