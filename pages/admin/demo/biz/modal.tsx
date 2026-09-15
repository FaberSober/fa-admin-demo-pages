import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DragModal, FaFullContentModal } from '@fa/ui';
import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, message, Select, Space, Switch } from 'antd';
import { useCallback, useState } from 'react';

function FullContentFormModal() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleClose = useCallback(() => {
    setOpen(false);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(() => {
    form.submit();
  }, [form]);

  const handleFinish = useCallback(
    (values: Record<string, unknown>) => {
      message.success(`已提交：${String(values.name || '未命名项目')}`);
      handleClose();
    },
    [handleClose],
  );

  return (
    <FaFullContentModal
      title="覆盖 .fa-main 的大面积表单"
      triggerDom={
        <Button type="primary" icon={<PlusOutlined />}>
          打开大面积表单
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
      onOk={handleSubmit}
      onCancel={handleClose}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Card title="基础信息" className="fa-mb12">
          <div className="fa-grid3 fa-gap12">
            <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
              <Input placeholder="请输入项目名称" />
            </Form.Item>
            <Form.Item name="code" label="项目编码" rules={[{ required: true, message: '请输入项目编码' }]}>
              <Input placeholder="请输入项目编码" />
            </Form.Item>
            <Form.Item name="owner" label="负责人" rules={[{ required: true, message: '请选择负责人' }]}>
              <Select
                placeholder="请选择负责人"
                options={[
                  { label: '张三', value: 'zhangsan' },
                  { label: '李四', value: 'lisi' },
                  { label: '王五', value: 'wangwu' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="priority"
              label="优先级"
              rules={[{ required: true, type: 'number', transform: (value) => Number(value), message: '请输入优先级' }]}
            >
              <InputNumber min={1} max={99} placeholder="请输入优先级" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="startDate" label="开始日期" rules={[{ required: true, message: '请选择开始日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="项目状态" initialValue="draft">
              <Select
                options={[
                  { label: '草稿', value: 'draft' },
                  { label: '进行中', value: 'running' },
                  { label: '已完成', value: 'done' },
                ]}
              />
            </Form.Item>
          </div>
        </Card>

        <Card title="执行步骤" className="fa-mb12">
          <Form.List name="steps" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Space key={field.key} align="start" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'name']}
                      label={`步骤 ${index + 1}`}
                      rules={[{ required: true, message: '请输入步骤名称' }]}
                      style={{ width: 280 }}
                    >
                      <Input placeholder="例如：需求确认" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'owner']}
                      label="执行人"
                      rules={[{ required: true, message: '请输入执行人' }]}
                      style={{ width: 280 }}
                    >
                      <Input placeholder="请输入执行人" />
                    </Form.Item>
                    <Form.Item label=" " colon={false} style={{ marginBottom: 0 }}>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} aria-label={`删除步骤 ${index + 1}`} />
                    </Form.Item>
                  </Space>
                ))}
                <Button type="dashed" block onClick={() => add()} icon={<PlusOutlined />}>
                  添加步骤
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="补充说明">
          <Form.Item name="remark" label="项目说明">
            <Input.TextArea rows={5} placeholder="请输入项目背景、交付标准或其他说明" />
          </Form.Item>
          <Form.Item name="enabled" label="立即启用" valuePropName="checked" initialValue>
            <Switch />
          </Form.Item>
        </Card>
      </Form>
    </FaFullContentModal>
  );
}

export default function ModalDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [dragModalOpen, setDragModalOpen] = useState(false);

  return (
    <div className="fa-full-content-p12">
      <Card title="antd Modal" className="fa-mb12">
        <Button type="primary" onClick={() => setModalOpen(true)}>
          打开 Modal
        </Button>
        <Modal title="antd Modal 示例" open={modalOpen} onOk={() => setModalOpen(false)} onCancel={() => setModalOpen(false)}>
          <p>这是 antd 提供的基础对话框。</p>
        </Modal>
      </Card>

      <Card title="antd message" className="fa-mb12">
        <Button onClick={() => message.success('操作成功')}>显示成功提示</Button>
      </Card>

      <Card title="DragModal" className="fa-mb12">
        <Button type="primary" onClick={() => setDragModalOpen(true)}>
          打开 DragModal
        </Button>
        <DragModal title="DragModal 示例" open={dragModalOpen} onOk={() => setDragModalOpen(false)} onCancel={() => setDragModalOpen(false)}>
          <p>拖动标题栏可以移动弹窗，也可以切换全屏。</p>
        </DragModal>
      </Card>

      <Card title="覆盖 .fa-main 的大面积弹框" className="fa-mb12">
        <p>通过 React Portal 将弹框挂载到 MenuLayout 的 .fa-main 主体区域，适合承载复杂表单。</p>
        <FullContentFormModal />
      </Card>
    </div>
  );
}
