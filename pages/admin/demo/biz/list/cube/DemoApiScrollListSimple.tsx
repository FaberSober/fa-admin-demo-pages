import React from 'react';
import { List } from 'antd';
import { FaApiScrollList } from '@features/fa-admin-pages/components';
import { logApiApi } from '@features/fa-admin-pages/services';
import { Admin } from '@features/fa-admin-pages/types';

/**
 * 使用FaApiScrollList组件简化实现的API滚动列表示例
 * @author xu.pengfei
 * @date 2025-08-28 21:53:05
 */
export default function DemoApiScrollListSimple() {
  return (
    <div className='fa-full-content'>
      <FaApiScrollList
        apiPage={logApiApi.page}
        renderItem={(item: Admin.LogApi) => (
          <List.Item key={item.id}>
            <List.Item.Meta
              title={item.biz + " / " + item.opr}
              description={item.crtName + " / " + item.crtTime}
            />
            <div>
              {item.url}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}
