import React from 'react';


export interface Hello2Props {
}

export function Hello2() {
  return (
    <div>
      <div>Hello2</div>
      <div>This Component hide title</div>
    </div>
  );
}

Hello2.displayName = "Hello2";
Hello2.title = "组件Hello2";
Hello2.showTitle = false; // 是否展示Card的Title
Hello2.permission = ""; // 需要的权限
Hello2.w = 4; // 宽度
Hello2.h = 6; // 高度
