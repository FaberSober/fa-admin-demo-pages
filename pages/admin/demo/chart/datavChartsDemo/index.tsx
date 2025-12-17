import { Card } from 'antd';
import React from 'react';
import DatavChinaMapDemo from './cube/map/DatavChinaMapDemo';

/**
 * @author xu.pengfei
 * @date 2025-12-17 10:06:08
 */
export default function DatavChartsDemo() {
  return (
    <div className="fa-full-content fa-p12">
      <Card title="柱状图" className="fa-mb12">
      </Card>
      <Card title="地图" className="fa-mb12">
        <div style={{ width: 800, height: 400 }}>
          <DatavChinaMapDemo />
        </div>
      </Card>
    </div>
  );
}
