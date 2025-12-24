import { Card } from 'antd';
import React from 'react';
import MapBoxBasicDemo from '../amap/basic/cube/MapBoxBasicDemo';

/**
 * @author xu.pengfei
 * @date 2025-12-24 11:16:18
 */
export default function MapBoxDemoPage() {
  return (
    <div className="fa-full-content fa-bg-white fa-p12 fa-scroll-auto-y">
      <Card title="基础地图展示" className="fa-mb12">
        <MapBoxBasicDemo />
      </Card>

    </div>
  );
}
