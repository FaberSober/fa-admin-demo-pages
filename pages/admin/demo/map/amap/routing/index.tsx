import React, { useEffect, useRef, useState } from 'react';
import {Map, MapTypeControl, Marker} from '@uiw/react-amap';
import { Button, Input, message, Space, Tag } from "antd";
import { FaUtils, FaResizeHorizontal } from "@fa/ui";
import { isNil } from "lodash";
import { PlusOutlined } from "@ant-design/icons";

const routeStr = "南京市中车浦镇车辆有限公司--浦珠北路--浦珠中路-浦镇大街--沿山大道--G312--浦口收费站--G2503南京绕城高速--G36宁洛高速-G40沪陕高速--六合东收费站--（南京长江四桥）--G2503南京绕城高速----G42沪蓉高速-G2京沪高速---S17苏台高速--S58沪常高速--天池山收费站---西阳山路----普陀山路--苏州中车轨道交通车辆有限公司"
const routeList = routeStr.split(/[--]+/)
console.log('routeList', routeList)

const roadsArr:Road[] = routeList.map((item, index) => {
  if (index === 0) {
    return {
      id: index, name: item, type: 'start',
      loc: {lat: 32.122728, lng: 118.709028},
    };
  } else if (index === routeList.length - 1) {
    return {
      id: index, name: item, type: 'end',
      loc: {lat: 31.357078, lng: 120.418357},
    };
  }
  return {
    id: index, name: item, type: 'road'
  };
})

interface Pos {
  lng: number;
  lat: number;
}

interface Road {
  id: number;
  type: 'start'|'road'|'end';
  name: string;
  loc?: Pos; // end
  path?: Pos[];
}

interface SearchPOI {
  id: string;
  name: string;
  lng: number;
  lat: number;
}

/**
 * amap routing manage
 * @author xu.pengfei
 * @date 2025/4/27 10:16
 */
export default function AMapRouting() {
  const [roads, setRoads] = useState<Road[]>(roadsArr)
  const [roadEditing, setRoadEditing] = useState<Road>()
  const [search, setSearch] = useState<string|undefined>()
  const [searchResults, setSearchResults] = useState<SearchPOI[]>([])
  const [planing, setPlaning] = useState(false)

  const mapRef = useRef<any>();
  useEffect(() => {
    console.log('mapRef:', mapRef)
  }, []);

  // 使用geocoder做地理/逆地理编码
  function handleAddressToPos(searchName: string) {
    setSearch(searchName)
    const placeSearch = new AMap.PlaceSearch({
      pageSize: 20, //单页显示结果条数
      pageIndex: 1, //页码
      // city: "010", //兴趣点城市
      // citylimit: true, //是否强制限制在设置的城市内搜索
      // map: map, //展现结果的地图实例
      // panel: "my-panel", //参数值为你页面定义容器的 id 值<div id="my-panel"></div>，结果列表将在此容器中进行展示。
      autoFitView: true, //是否自动调整地图视野使绘制的 Marker 点都处于视口的可见范围
    });
    placeSearch.search(searchName, (status:any, result:any) => {
      console.log('placeSearch', 'status', status, 'result', result)
      if (status === "complete") {
        //status：complete 表示查询成功，no_data 为查询无结果，error 代表查询错误
        //查询成功时，result 即为对应的驾车导航信息
        if (result && result.info === 'OK') {
          const sr = result.poiList.pois.map((i:any) => {
            return {
              id: i.id,
              name: i.name,
              lng: i.location.lng,
              lat: i.location.lat,
            }
          })
          setSearchResults(sr)
          if (sr && sr[0]) {
            mapRef.current.map.panTo([sr[0].lng, sr[0].lat])
          }
        } else {
          setSearchResults([])
        }
      } else {
        setSearchResults([])
        console.log("查询地点数据失败：" + result);
        message.error("查询地点数据失败：" + result);
      }
    });
  }

  function handleClick(item: Road) {
    setRoadEditing(item)
    handleAddressToPos(item.name)
  }

  function handleLocRoadItem(item: Road) {
    if (isNil(item.loc)) {
      return;
    }
    mapRef.current.map.panTo([item.loc.lng, item.loc.lat])
  }

  function handleClickSearchResult(item: SearchPOI) {
    mapRef.current.map.panTo([item.lng, item.lat])
  }

  function handleSelSearchResult(item: SearchPOI) {
    mapRef.current.map.panTo([item.lng, item.lat])
    if (isNil(roadEditing)) {
      message.error("未选中左侧路径")
      return;
    }
    const roadsNew = roads.map(r => {
      if (r.id === roadEditing.id) {
        return { ...r, loc: { lng: item.lng, lat: item.lat } }
      }
      return r;
    })
    setRoads(roadsNew)
  }

  function handlePlan() {
    const start = roads[0]
    const end = roads[roads.length - 1]
    if (isNil(start.loc)) {
      message.error("未设置起点坐标")
      return;
    }
    if (isNil(end.loc)) {
      message.error("未设置终点坐标")
      return;
    }
    setPlaning(true)
    const driving = new AMap.Driving({
      map: mapRef.current.map,
      panel: "fa-driving-panel", //参数值为你页面定义容器的 id 值<div id="my-panel"></div>
    });
    // const points = [
    //   // [start.loc.lng, start.loc.lat], //起始点坐标
    //   // [end.loc.lng, end.loc.lat], //终点坐标
    //   { keyword: '北京市地震局（公交站）',city:'北京' },
    //   { keyword: '亦庄文化园（地铁站）',city:'北京' }
    // ]
    const startPoint = new AMap.LngLat(start.loc.lng, start.loc.lat)
    const endPoint = new AMap.LngLat(end.loc.lng, end.loc.lat)
    //获取起终点规划线路
    driving.search(startPoint, endPoint, {waypoints: []}, function (status: any, result: any) {
      setPlaning(false)
      console.log('search', 'status', status, 'result', result)
      if (status === "complete") {
        //status：complete 表示查询成功，no_data 为查询无结果，error 代表查询错误
        //查询成功时，result 即为对应的驾车导航信息
        console.log(result);
      } else {
        console.log("获取驾车数据失败：" + result);
        message.error("获取驾车数据失败：" + result);
      }
    });
  }

  return (
    <div className="fa-full-content fa-bg-white">
      <Map ref={mapRef} style={{height: '100%', width: '100%'}}>
        {roads.filter(i => i.loc).map(i => {
          const prefix = i.type === 'start' ? '起点' :
                          i.type === 'end' ? '终点' : '途径'
          return (
            <Marker
              key={i.id}
              visible
              title={i.name}
              position={new AMap.LngLat(i.loc.lng, i.loc.lat)}
              label={{
                // 设置文本标注偏移量
                // offset: new AMap.Pixel(20, 20),
                // 设置文本标注内容
                content: `<div class="info">${prefix}：${i.name}</div>`,
                // 设置文本标注方位
                direction: 'top'
              }}
            />
          )
        })}
        {searchResults.map(i => (
          <Marker
            key={i.id}
            visible
            title={i.name}
            position={new AMap.LngLat(i.lng, i.lat)}
            label={{
              // 设置文本标注偏移量
              // offset: new AMap.Pixel(20, 20),
              // 设置文本标注内容
              content: `<div class="info">${i.name}</div>`,
              // 设置文本标注方位
              direction: 'top'
            }}
          />
        ))}
      </Map>

      <div style={{ position: 'absolute', top: 12, left: 12, bottom: 12 }}>
        <div id="fa-route-list" style={{ width: 300, height: '100%' }} className="fa-bg-white fa-radius">
          <Space className="fa-p4">
            <Button onClick={handlePlan} loading={planing}>规划路径</Button>
          </Space>

          {roads.map(i => {
            const editing = roadEditing?.id === i.id
            let isLoc = !isNil(i.loc)
            return (
              <div
                key={i.id}
                className="fa-flex-row-center fa-hover"
                style={{
                  background: editing ? 'lightgreen' : 'transparent',
                  paddingRight: 4,
                }}
                onClick={() => handleClick(i)}
              >
                {i.type === 'start' && <div style={{ padding: 6, width: 60 }} className="fa-flex-column-center">
                  <Tag color="#2db7f5" style={{margin: 0}}>起点</Tag>
                </div>}
                {i.type === 'road' && <div style={{ padding: 6, width: 60 }} className="fa-text-center">｜</div>}
                {i.type === 'end' && <div style={{ padding: 6, width: 60 }} className="fa-flex-column-center">
                  <Tag color="#f50" style={{margin: 0}}>终点</Tag>
                </div>}
                <div className="fa-flex-1">{i.name}</div>
                <div onClick={FaUtils.preventEvent}>
                  {isLoc && <Button shape="circle" icon={<PlusOutlined />} size="small" onClick={() => handleLocRoadItem(i)} />}
                </div>
              </div>
            )
          })}
        </div>
        <FaResizeHorizontal domId="fa-route-list" position="right" minWidth={200} />
      </div>

      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <div id="fa-search-result" style={{width: 300, minHeight: 400}} className="fa-bg-white fa-radius">
          <div className="fa-text-center fa-p4">
            <Input.Search
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              onClear={() => setSearchResults([])}
            />
          </div>
          <div className="fa-flex-column">
            {searchResults.map(i => {
              return (
                <div key={i.id} className="fa-flex-row-center fa-hover">
                  <div className="fa-flex-1 fa-p4" onClick={() => handleClickSearchResult(i)}>{i.name}</div>
                  <Button type="text" size="small" onClick={() => handleSelSearchResult(i)}>选中</Button>
                </div>
              )
            })}
          </div>

          <div id="fa-driving-panel"></div>
        </div>
        <FaResizeHorizontal domId="fa-search-result" position="left" minWidth={200} />
      </div>
      {/*<Space style={{position: 'absolute', top: 12, right: 12}}>*/}
      {/*  <Button>Road</Button>*/}
      {/*</Space>*/}
    </div>
  )
}
