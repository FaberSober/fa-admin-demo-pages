import React from 'react';
import {Button, Space} from "antd";

/**
 * @author xu.pengfei
 * @date 2023/5/29 11:32
 */
export default function SocketTask() {
  return (
    <div>
      <Space className="fa-mb12">
        <Button>开启任务</Button>
        <Button>暂停任务</Button>
        <Button>停止任务</Button>
      </Space>

      <div>
        TODO
      </div>
    </div>
  )
}
