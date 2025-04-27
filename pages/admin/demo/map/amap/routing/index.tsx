import React from 'react';
import {Map, MapTypeControl, Marker} from '@uiw/react-amap';
import { Button, Space } from "antd";
import { FaResizeHorizontal } from "@fa/ui";

/**
 * amap routing manage
 * @author xu.pengfei
 * @date 2025/4/27 10:16
 */
export default function AMapRouting() {
  return (
    <div className="fa-full-content fa-bg-white">
      <Map style={{height: '100%', width: '100%'}} />

      <div style={{ position: 'absolute', top: 12, left: 12, bottom: 12 }}>
        <div id="fa-route-list" style={{ width: 300, height: '100%' }} className="fa-bg-white fa-radius">

        </div>
        <FaResizeHorizontal domId="fa-route-list" position="right" minWidth={200} />
      </div>

      <Space style={{position: 'absolute', top: 12, right: 12}}>
        <Button>Road</Button>
      </Space>
    </div>
  )
}
