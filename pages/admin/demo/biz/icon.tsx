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
        <p>可以自定义大小：</p>
        <Space>
          <FaIcon icon="fa-solid fa-rocket" />
          <FaIcon icon="fa-solid fa-rocket" size="xl" />
          <FaIcon icon="fa-solid fa-rocket" size="2xl" />
        </Space>
        <p>可以自定义修改颜色：</p>
        <Space>
          <FaIcon icon="fa-solid fa-rocket" size="2xl" style={{ color: '#f50' }} />
          <FaIcon icon="fa-solid fa-rocket" size="2xl" style={{ color: 'rgb(45, 183, 245)' }} />
          <FaIcon icon="fa-solid fa-rocket" size="2xl" style={{ color: 'hsl(102, 53%, 61%)' }} />
          <FaIcon icon="fa-solid fa-rocket" size="2xl" style={{ color: 'hwb(205 6% 9%)' }} />
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
