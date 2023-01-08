import React from 'react';
import RGL, { Layout, ReactGridLayoutProps, WidthProvider } from "react-grid-layout";
import 'react-grid-layout/css/styles.css'
import '../index.scss'


const ReactGridLayout = WidthProvider(RGL);

export interface FaGridLayoutProps extends ReactGridLayoutProps {
  layout: Layout[];
}

/**
 * @author xu.pengfei
 * @date 2023/1/8 20:42
 */
export default function FaGridLayout({ layout, ...props }: FaGridLayoutProps) {
  return (
    <ReactGridLayout
      layout={layout}
      {...props}
    >
      {layout.map(i => (
        <div key={i.i}>
          <span className="text">{i.i}</span>
        </div>
      ))}
    </ReactGridLayout>
  )
}