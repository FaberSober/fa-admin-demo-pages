import React, { useContext, useState } from 'react';
import { get } from 'lodash';
import { Button, DatePicker, Form, Input } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ApiEffectLayoutContext, BaseBoolRadio, type CommonModalProps, DictDataSelector, DictEnumApiSelector, DragModal, FaHref, FaUtils } from '@fa/ui';
import { studentApi } from '@/services';
import type { Demo } from '@/types';

/**
 * Demo-学生表实体新增、编辑弹框
 */
export default function StudentModal({ children, title, record, fetchFinish, addBtn, editBtn, ...props }: CommonModalProps<Demo.Student>) {
  const { loadingEffect } = useContext(ApiEffectLayoutContext);
  const [form] = Form.useForm();

  const [open, setOpen] = useState(false);

  /** 新增Item */
  function invokeInsertTask(params: any) {
    studentApi.save(params).then((res) => {
      FaUtils.showResponse(res, '新增学生');
      setOpen(false);
      if (fetchFinish) fetchFinish();
    });
  }

  /** 更新Item */
  function invokeUpdateTask(params: any) {
    studentApi.update(params.id, params).then((res) => {
      FaUtils.showResponse(res, '更新学生');
      setOpen(false);
      if (fetchFinish) fetchFinish();
    });
  }

  /** 提交表单 */
  function onFinish(fieldsValue: any) {
    const values = {
      ...fieldsValue,
      birthday: FaUtils.getDateStr000(fieldsValue.birthday),
    };
    if (record) {
      invokeUpdateTask({ ...record, ...values });
    } else {
      invokeInsertTask({ ...values, tags: [], info: { info1: '', info2: '' } });
    }
  }

  function getInitialValues() {
    return {
      name: get(record, 'name'),
      age: get(record, 'age'),
      sex: get(record, 'sex'),
      email: get(record, 'email'),
      birthday: FaUtils.getInitialKeyTimeValue(record, 'birthday'),
      valid: get(record, 'valid'),
      dict1: get(record, 'dict1'),
      dict2: get(record, 'dict2'),
      dict3: get(record, 'dict3'),
    };
  }

  function showModal() {
    setOpen(true);
    form.setFieldsValue(getInitialValues());
  }

  const loading = loadingEffect[studentApi.getUrl('save')] || loadingEffect[studentApi.getUrl('update')];
  return (
    <span>
      <span onClick={showModal}>
        {children}
        {addBtn && (
          <Button icon={<PlusOutlined />} type="primary">
            新增
          </Button>
        )}
        {editBtn && <FaHref icon={<EditOutlined />} text="编辑" />}
      </span>
      <DragModal
        title={title}
        open={open}
        onOk={() => form.submit()}
        confirmLoading={loading}
        onCancel={() => setOpen(false)}
        width={700}
        {...props}
      >
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="name" label="学生名" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input />
          </Form.Item>
          <Form.Item name="age" label="年龄" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input />
          </Form.Item>
          <Form.Item name="sex" label="性别" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <DictEnumApiSelector enumName="SexEnum" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input />
          </Form.Item>
          <Form.Item name="birthday" label="生日" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="valid" label="账户是否有效" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <BaseBoolRadio />
          </Form.Item>
          <Form.Item name="dict1" label="字典值1" rules={[{ required: true }]} tooltip='使用字典值（选择列表）base_dict_test_options'>
            <DictDataSelector dictLabel='base_dict_test_options' placeholder="请输入字典值1" />
          </Form.Item>
          <Form.Item name="dict2" label="字典值2" rules={[{ required: true }]} tooltip='使用字典值（关联列表）base_dict_test_link_options'>
            <DictDataSelector dictLabel='base_dict_test_link_options' placeholder="请输入字典值2" />
          </Form.Item>
          <Form.Item name="dict3" label="字典值3" rules={[{ required: true }]} tooltip='使用字典值（关联树）base_dict_test_link_tree'>
            <DictDataSelector dictLabel='base_dict_test_link_tree' placeholder="请输入字典值3" />
          </Form.Item>
        </Form>
      </DragModal>
    </span>
  );
}
