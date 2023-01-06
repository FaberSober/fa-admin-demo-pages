import React from 'react';
import { Button } from "@fa/ui";
import { Card } from "antd";

/**
 * @author xu.pengfei
 * @date 2023/1/6 14:20
 */
export default function tailwindcss() {
  return (
    <div className="fa-full-content fa-bg-white fa-p12">
      <Card title="使用tailwindcss构建的button组件" className="fa-mb12">
        <div>
          <Button style={{ width: 300 }} />
        </div>
      </Card>
    </div>
  )
}