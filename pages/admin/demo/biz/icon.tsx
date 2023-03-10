import React, { useState } from 'react';
import { FaIcon } from '@fa/icons';
import { Card, Space } from 'antd';
import { IconSelect } from "@/components";

/**
 * @author xu.pengfei
 * @date 2022/9/24 20:56
 */
export default function icon() {
  const [value, setValue] = useState<string>();

  return (
    <div className="fa-full-content fa-bg-white fa-p12" style={{ fontSize: '30px' }}>
      <Card title="使用<FaIcon />" className="fa-mb12">
        <Space>
          <FaIcon icon="fa-solid fa-check-square" size="2xl" />
          <FaIcon icon="fa-solid fa-check-square" size="2xl" />
          <FaIcon icon="fa-solid fa-circle" size="2xl" />
          <FaIcon icon="fa-solid fa-rocket" size="2xl" />
        </Space>
      </Card>

      <Card title="选择图标" className="fa-mb12">
        <IconSelect value={value} onChange={setValue} />

        <p>
          图标代码：<code>&lt;FaIcon icon="fa-solid fa-{value}" /&gt;</code>
        </p>
      </Card>
    </div>
  );
}
