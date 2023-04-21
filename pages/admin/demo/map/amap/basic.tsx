import React, {useState} from 'react';
import {Map, Marker} from '@uiw/react-amap';
import {Card} from "antd";
import AMapAutoComplete from "@features/fa-admin-pages/components/map/AMapAutoComplete";


/**
 * 高德地图
 * @author xu.pengfei
 * @date 2023/4/21 11:01
 */
export default function basic() {
  const [pos, setPos] = useState<any>()

  return (
    <div className="fa-full-content fa-bg-white fa-p12">
      <Card title="基础地图展示" className="fa-mb12">
        <Map style={{height: 200}}/>
      </Card>

      <Card title="地图坐标拾取" className="fa-mb12">
        <Map
          style={{height: 200}}
          onClick={(event) => {
            console.log('点击事件！', event);
            setPos([event.lnglat.lng, event.lnglat.lat])
          }}
        >
          {pos && <Marker position={new AMap.LngLat(pos[0], pos[1])}/>}
        </Map>
        <div>
          点击拾取坐标：lng: {pos && pos[0]}, lat: {pos && pos[1]}
        </div>
      </Card>

      <Card title="AutoComplete 输入提示" className="fa-mb12">
        <AMapAutoComplete/>
      </Card>
    </div>
  )
}
