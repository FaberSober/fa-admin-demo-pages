import React from 'react';


export interface HelloProps {
}

export function Hello() {
  return (
    <div>
      <div>Hello</div>
      <div>This Component has title</div>
    </div>
  );
}

Hello.displayName = "Hello";
Hello.title = "组件Hello";
Hello.showTitle = true; // 是否展示Card的Title
Hello.permission = ""; // 需要的权限
Hello.w = 4; // 宽度
Hello.h = 6; // 高度
