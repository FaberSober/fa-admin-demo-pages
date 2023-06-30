import React from 'react';
import { BaseSearchSelect, BaseSearchSelectProps } from '@fa/ui';
import { studentApi } from '@/services';
import { Dm } from '@/types';

export interface IProps extends Omit<BaseSearchSelectProps<Dm.Student, number>, 'serviceApi'> {}

/**
 * @author xu.pengfei
 * @date 2020/12/28
 */
export default function StudentSearchSelect(props: IProps) {
  return (
    <BaseSearchSelect
      valueKey="id"
      labelKey="name"
      serviceApi={{
        search: (searchValue) => studentApi.page({ current: 1, pageSize: 20, query: { name: searchValue } }),
        getById: (value) => studentApi.getById(value),
        findList: (ids) => studentApi.list({ 'id#$in': [...ids] }),
      }}
      placeholder="请输入学生名称进行搜索"
      {...props}
    />
  );
}
