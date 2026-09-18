import { FaJsonEdit, FaJsonView } from "@fa/ui";
import { Card, Typography } from "antd";
import { useState } from "react";

const INITIAL_JSON = JSON.stringify(
  {
    name: "FaJsonEdit",
    enabled: true,
    version: 1,
    description: "第一行\n第二行\n第三行",
    tags: ["json", "editor"],
    author: {
      name: "FA Admin",
      homepage: "https://github.com/faber1996/fa-antd-admin",
    },
  },
  null,
  2
);

export default function JsonEditDemo() {
  const [jsonText, setJsonText] = useState(INITIAL_JSON);

  return (
    <div className="fa-full-content-p12 fa-flex-column fa-gap12">
      <Typography.Text type="secondary">
        左侧支持图形化编辑和源文本编辑，右侧实时使用 FaJsonView 展示当前
        JSON；源文本非法时右侧会显示解析错误。
      </Typography.Text>

      <div className="fa-grid2 fa-gap12">
        <Card title="FaJsonEdit - JSON 编辑" className="fa-full">
          <FaJsonEdit value={jsonText} onChange={setJsonText} maxHeight={520} />
        </Card>
        <Card title="FaJsonView - JSON 展示" className="fa-full">
          <FaJsonView data={jsonText} defaultExpandDepth={2} maxHeight={520} />
        </Card>
      </div>
    </div>
  );
}
