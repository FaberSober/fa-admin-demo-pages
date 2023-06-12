import React, {useState} from 'react';
import {Button, Space} from "antd";


/**
 * @author xu.pengfei
 * @date 2023/5/29 11:32
 */
export default function SocketTask() {
  const [data, setData] = useState()

  function start() {

  }

  function pause() {

  }

  function stop() {

  }

  return (
    <div>
      <Space className="fa-mb12">
        <Button onClick={start}>开启任务</Button>
        <Button onClick={pause}>暂停任务</Button>
        <Button onClick={stop}>停止任务</Button>
      </Space>

      <div>
        TODO
      </div>
    </div>
  )
}
