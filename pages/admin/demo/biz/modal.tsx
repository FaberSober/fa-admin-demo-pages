import { DragModal } from '@fa/ui';
import { Button, Card, Modal, message } from 'antd';
import { useState } from 'react';

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
    </div>
  );
}
