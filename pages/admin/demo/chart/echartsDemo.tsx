import React, { useEffect } from 'react';
import { Card } from "antd";
import * as echarts from 'echarts';
import { EchartsBar, EchartsBase, EchartsPie } from "@/components";


/**
 * @author xu.pengfei
 * @date 2023/2/2 09:36
 */
export default function echartsDemo() {

  useEffect(() => {
    // 基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(document.getElementById('echarts-demo1')!);
    // 绘制图表
    myChart.setOption({
      title: {
        text: 'ECharts 入门示例'
      },
      tooltip: {},
      xAxis: {
        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
      },
      yAxis: {},
      series: [
        {
          name: '销量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
        }
      ]
    });
  }, [])

  return (
    <div className="fa-full-content fa-p12">
      <Card title="ECharts 入门示例" className="fa-mb12">
        <div id="echarts-demo1" style={{width: 500, height: 300}} />
      </Card>

      <Card title="ECharts 封装示例" className="fa-mb12" bodyStyle={{display: 'flex', flexWrap: "wrap"}}>
        <EchartsBar
          title="Bar"
          subTitle="Bar Chart"
          data={[
            { value: 1048, name: 'Search Engine' },
            { value: 735, name: 'Direct' },
            { value: 580, name: 'Email' },
            { value: 484, name: 'Union Ads' },
            { value: 300, name: 'Video Ads' }
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
            { value: 1048, name: 'Search Engine' },
            { value: 735, name: 'Direct' },
            { value: 580, name: 'Email' },
            { value: 484, name: 'Union Ads' },
            { value: 300, name: 'Video Ads' }
          ]}
          dataTitle="销量"
          style={{width: 500, height: 300}}
        />
      </Card>

      <Card title="ECharts 折线图" className="fa-mb12">
        <EchartsBase
          option={{
            grid: { top: 8, right: 8, bottom: 24, left: 36 },
            xAxis: {
              type: 'category',
              data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            },
            yAxis: {
              type: 'value',
            },
            series: [
              {
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line',
                smooth: true,
              },
            ],
            tooltip: {
              trigger: 'axis',
            },
          }}
          style={{width: 500, height: 300}}
        />
      </Card>

    </div>
  )
}
