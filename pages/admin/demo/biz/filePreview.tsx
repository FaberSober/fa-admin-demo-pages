import React, { useContext, useState } from 'react';
import { ConfigLayoutContext, UserLayoutContext } from "@features/fa-admin-pages/layout";
import { Space } from "antd";
import { FaCipher, FaFlexRestLayout, fileSaveApi, UploadFileLocal } from "@fa/ui";
import { Admin } from "@features/fa-admin-pages/types";


/**
 * file preview use kkFileView
 * @author xu.pengfei
 * @date 2024/11/24 10:48
 */
export default function FilePreview() {
  const {systemConfig} = useContext(ConfigLayoutContext)
  const {user} = useContext(UserLayoutContext)
  const [file, setFile] = useState<Admin.FileSave>();

  let previewUrl = undefined;
  if (file) {
    const url = window.location.origin + fileSaveApi.genLocalGetFile(file.id) + '?fullfilename=' + file.originalFilename  + '&watermarkTxt=' + encodeURIComponent(user.name + '/' + user.username)
    console.log('url', url)
    previewUrl = systemConfig.kkFileViewUrl + '/onlinePreview?url=' + encodeURIComponent(FaCipher.encryptByBase64(url));
  }

  return (
    <div className="fa-full-content-p12 fa-flex-column">
      <Space className="fa-mb12">
        <UploadFileLocal
          // value={fileId}
          onChange={(v) => {
            if (v) {
              fileSaveApi.getById(v).then(res => setFile(res.data))
            }
          }}
        />
      </Space>

      <FaFlexRestLayout>
        <iframe src={previewUrl} className="fa-full fa-iframe fa-scroll-hidden" />
      </FaFlexRestLayout>
    </div>
  )
}
