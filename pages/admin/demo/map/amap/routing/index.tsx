import React, { useState } from 'react';
import {Map, MapTypeControl, Marker} from '@uiw/react-amap';
import { Button, Space, Tag } from "antd";
import { FaUtils, FaResizeHorizontal } from "@fa/ui";

const routeStr = "南京市中车浦镇车辆有限公司--浦珠北路--浦珠中路-浦镇大街--沿山大道--G312--浦口收费站--G2503南京绕城高速--G36宁洛高速-G40沪陕高速--六合东收费站--（南京长江四桥）--G2503南京绕城高速----G42沪蓉高速-G2京沪高速---S17苏台高速--S58沪常高速--天池山收费站---西阳山路----普陀山路--苏州中车轨道交通车辆有限公司"
const routeList = routeStr.split(/[--]+/)
console.log('routeList', routeList)

const roadsArr:Road[] = routeList.map((item, index) => {
  if (index === 0) {
    return { id: index, name: item, type: 'start' };
  } else if (index === routeList.length - 1) {
    return { id: index, name: item, type: 'end' };
  }
  return { id: index, name: item, type: 'road' };
})

interface Road {
  id: number;
  type: 'start'|'road'|'end';
  name: string;
}

/**
 * amap routing manage
 * @author xu.pengfei
 * @date 2025/4/27 10:16
 */
export default function AMapRouting() {
  const [roads, setRoads] = useState<Road[]>(roadsArr)

  return (
    <div className="fa-full-content fa-bg-white">
      <Map style={{height: '100%', width: '100%'}} />

      <div style={{ position: 'absolute', top: 12, left: 12, bottom: 12 }}>
        <div id="fa-route-list" style={{ width: 300, height: '100%' }} className="fa-bg-white fa-radius">
          {roads.map(i => {
            return (
              <div key={i.id} className="fa-flex-row-center fa-hover">
                {i.type === 'start' && <div style={{ padding: 6, width: 60 }} className="fa-flex-column-center">
                  <Tag color="#2db7f5" style={{margin: 0}}>起点</Tag>
                </div>}
                {i.type === 'road' && <div style={{ padding: 6, width: 60 }} className="fa-text-center">｜</div>}
                {i.type === 'end' && <div style={{ padding: 6, width: 60 }} className="fa-flex-column-center">
                  <Tag color="#f50" style={{margin: 0}}>终点</Tag>
                </div>}
                <div>{i.name}</div>
              </div>
            )
          })}
        </div>
        <FaResizeHorizontal domId="fa-route-list" position="right" minWidth={200} />
      </div>

      {/*<Space style={{position: 'absolute', top: 12, right: 12}}>*/}
      {/*  <Button>Road</Button>*/}
      {/*</Space>*/}
    </div>
  )
}
