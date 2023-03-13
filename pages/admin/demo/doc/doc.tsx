import React from 'react';
import { SITE_INFO } from '@/configs'
import { DocumentEditor } from "@onlyoffice/document-editor-react";



/**
 * @author xu.pengfei
 * @date 2023/3/13 11:14
 */
export default function doc() {

  const onDocumentReady = function (event:any) {
    console.log("Document is loaded", event);
  };

  return (
    <div className="fa-full-content fa-flex-row fa-p12">
      <DocumentEditor
        id="docxEditor"
        documentServerUrl={SITE_INFO.ONLYOFFICE_SERVER}
        config={{
          "document": {
            "fileType": "docx",
            "key": "testdocx00001",
            "title": "Example Document Title.docx",
            "url": "/file/doc/test.docx"
          },
          "documentType": "word",
          "editorConfig": {
            "callbackUrl": "https://example.com/url-to-callback.ashx"
          }
        }}
        events_onDocumentReady={onDocumentReady}
      />
    </div>
  )
}
