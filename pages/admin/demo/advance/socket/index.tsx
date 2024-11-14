import React from 'react';
import { Card } from 'antd';
import WebSocketSimple from './cube/websocket/WebSocketSimple';


/**
 * @author xu.pengfei
 * @date 2022/12/6 13:55
 */
export default function DemoAdvanceSocket() {

  return (
    <div className="fa-full-content fa-bg-white fa-p12 fa-flex-column">
      <Card title="socket连接简单示例" className="fa-mb12">
        <WebSocketSimple token="111" />
      </Card>
    </div>
  );
}
