import React, { useState } from 'react';
import { Space } from "antd";
import { FaFlexRestLayout, UploadFileLocal } from "@fa/ui";
import { FilePreview } from "@features/fa-admin-pages/components";


/**
 * file preview use kkFileView
 * @author xu.pengfei
 * @date 2024/11/24 10:48
 */
export default function FilePreviewDemo() {
  const [fileId, setFileId] = useState<string>();

  return (
    <div className="fa-full-content-p12 fa-flex-column">
      <Space className="fa-mb12">
        <UploadFileLocal value={fileId} onChange={(v) => setFileId(v)}/>
      </Space>

      <FaFlexRestLayout>
        {fileId && <FilePreview fileId={fileId}/>}
      </FaFlexRestLayout>
    </div>
  )
}
