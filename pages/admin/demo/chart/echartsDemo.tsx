import React from 'react';
import {Card} from "antd";
import {EchartsBar, EchartsPie} from "@/components";
import EchartsDynamicDemo from "./cube/EchartsDynamicDemo";
import EchartsBasicDemo from "./cube/EchartsBasicDemo";
import EchartsSimpleDemo from "@features/fa-admin-demo-pages/pages/admin/demo/chart/cube/EchartsSimpleDemo";


/**
 * @author xu.pengfei
 * @date 2023/2/2 09:36
 */
export default function echartsDemo() {

  return (
    <div className="fa-full-content fa-p12">
      <Card title="ECharts 入门示例" className="fa-mb12">
        <EchartsBasicDemo/>
      </Card>

      <Card title="ECharts 封装示例" className="fa-mb12" bodyStyle={{display: 'flex', flexWrap: "wrap"}}>
        <EchartsBar
          title="Bar"
          subTitle="Bar Chart"
          data={[
            {value: 1048, name: 'Search Engine'},
            {value: 735, name: 'Direct'},
            {value: 580, name: 'Email'},
            {value: 484, name: 'Union Ads'},
            {value: 300, name: 'Video Ads'}
          ]}
          dataTitle="销量"
          style={{width: 500, height: 300}}
          barSeriesOption={{
            barWidth: 30,
          }}
        />

        <EchartsPie
          title="Pie"
          subTitle="Pie Chart"
          data={[
            {value: 1048, name: 'Search Engine'},
            {value: 735, name: 'Direct'},
            {value: 580, name: 'Email'},
            {value: 484, name: 'Union Ads'},
            {value: 300, name: 'Video Ads'}
          ]}
          dataTitle="销量"
          style={{width: 500, height: 300}}
        />
      </Card>

      <Card title="ECharts 折线图" className="fa-mb12">
        <EchartsSimpleDemo />
      </Card>

      <Card title="ECharts 动态表格" className="fa-mb12">
        <EchartsDynamicDemo/>
      </Card>

    </div>
  )
}
