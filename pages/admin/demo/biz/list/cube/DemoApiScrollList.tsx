import { Fa, useTableQueryParams } from '@fa/ui';
import { InfiniteScroll } from '@features/fa-admin-pages/components';
import { logApiApi } from '@features/fa-admin-pages/services';
import { Admin } from '@features/fa-admin-pages/types';
import { Divider, List, Skeleton } from 'antd';
import React, { useEffect, useId, useState } from 'react'


export default function DemoApiScrollList() {

  const id = useId()
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Fa.Pagination>();
  const [data, setData] = useState<Admin.LogApi[]>([]);
  const [page, setPage] = useState(1);

  function loadMoreData() {
    if (loading) {
      return;
    }
    setLoading(true);
    logApiApi.page({
      query: {},
      current: page,
      pageSize: 20,
      sorter: 'id DESC'
    }).then(res => {
      setData([ ...data, ...res.data.rows ]);
      setPage(page + 1);
      setPagination(res.data.pagination);
      setLoading(false)
    }).catch(() => setLoading(false));
  }

  useEffect(() => {
    loadMoreData();
  }, []);

  return (
    <div className='fa-full-content'>
      <div
        id={id}
        style={{
          height: 400,
          overflow: 'auto',
          padding: '0 16px',
          border: '1px solid rgba(140, 140, 140, 0.35)',
        }}
      >
        <InfiniteScroll
          dataLength={data.length}
          next={loadMoreData}
          hasMore={pagination ? pagination.hasNextPage : true}
          loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
          endMessage={<Divider plain>数据加载完成～</Divider>}
          scrollableTarget={id}
        >
          <List
            dataSource={data}
            renderItem={(item) => (
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
        </InfiniteScroll>
      </div>
    </div>
  )
}
