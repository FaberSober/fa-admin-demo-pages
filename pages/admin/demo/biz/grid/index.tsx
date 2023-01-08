import React from 'react';
import { Card } from "antd";
import FaGridLayout from "./cube/FaGridLayout";
import { Layout } from "react-grid-layout";


/**
 * https://github.com/react-grid-layout/react-grid-layout/blob/master/test/examples/1-basic.jsx
 * @author xu.pengfei
 * @date 2023/1/8 15:25
 */
export default function index() {

  function onLayoutChange(layout: Layout[]) {
    console.log('onLayoutChange', layout)
  }

  return (
    <div className="fa-full-content fa-bg-white fa-p12">
      <Card title="基本示例" className="fa-mb12">
        <FaGridLayout
          layout={[
            {i: '1', x: 0, y: 0, w: 1, h: 1},
            {i: '2', x: 1, y: 0, w: 1, h: 1},
            {i: '3', x: 2, y: 0, w: 1, h: 1},
            {i: '4', x: 3, y: 0, w: 1, h: 1},
          ]}
          onLayoutChange={onLayoutChange}
          rowHeight={100}
          cols={4}
        />
      </Card>
    </div>
  )
}