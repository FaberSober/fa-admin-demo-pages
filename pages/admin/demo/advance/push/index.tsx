import { ReloadOutlined, SearchOutlined, SendOutlined } from '@ant-design/icons';
import type { Fa } from '@fa/ui';
import type { PushTest } from '@/types';
import { pushTestApi } from '@/services';
import dayjs from 'dayjs';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;
const MAX_DEVICES = 5;
const RESERVED_EXTRA_KEYS = ['type', 'testId', 'link', 'route'];

type DevicePagination = Pick<Fa.Pagination, 'current' | 'pageSize' | 'total'>;

interface TestPreview extends PushTest.MessageForm {
  extra?: Record<string, unknown>;
}

function formatDate(value?: string | number) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—';
}

function parseExtraJson(value?: string): Record<string, unknown> | undefined {
  if (!value?.trim()) return undefined;
  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('扩展 JSON 必须是对象');
  }
  const extra = parsed as Record<string, unknown>;
  const reservedKey = RESERVED_EXTRA_KEYS.find((key) => Object.hasOwn(extra, key));
  if (reservedKey) throw new Error(`扩展 JSON 不能包含保留字段 ${reservedKey}`);
  return extra;
}

function statusLabel(status: string) {
  switch (status) {
    case 'pending':
      return { text: '处理中', color: 'processing' };
    case 'accepted':
      return { text: 'Provider 已受理', color: 'blue' };
    case 'ignored':
      return { text: 'Provider 已忽略', color: 'default' };
    case 'failed':
      return { text: '发送失败', color: 'error' };
    case 'received':
      return { text: '客户端已接收', color: 'success' };
    case 'clicked':
      return { text: '用户已点击', color: 'success' };
    default:
      return { text: status || '未知', color: 'default' };
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function UniPushTestConsole() {
  const [filterForm] = Form.useForm<PushTest.DeviceQuery>();
  const [messageForm] = Form.useForm<PushTest.MessageForm>();
  const [devices, setDevices] = useState<PushTest.Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<PushTest.Device[]>([]);
  const [multiDevice, setMultiDevice] = useState(false);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [pagination, setPagination] = useState<DevicePagination>({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [preview, setPreview] = useState<TestPreview>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testRun, setTestRun] = useState<PushTest.Run>();
  const [runDevices, setRunDevices] = useState<PushTest.Device[]>([]);

  const loadDevices = useCallback(
    async (current = 1, pageSize = DEFAULT_PAGE_SIZE, query = filterForm.getFieldsValue()) => {
      const requestQuery: PushTest.DeviceQuery = {
        userId: query.userId?.trim() || undefined,
        platform: query.platform?.trim() || undefined,
        appId: query.appId?.trim() || undefined,
        environment: query.environment?.trim() || undefined,
        enabled: query.enabled,
      };
      setDeviceLoading(true);
      try {
        const res = await pushTestApi.page({ current, pageSize, query: requestQuery });
        setDevices(res.data.rows ?? []);
        setPagination({
          current: res.data.pagination.current,
          pageSize: res.data.pagination.pageSize,
          total: res.data.pagination.total,
        });
      } catch (error) {
        message.error(getErrorMessage(error, '设备列表加载失败'));
      } finally {
        setDeviceLoading(false);
      }
    },
    [filterForm],
  );

  useEffect(() => {
    void loadDevices(1, DEFAULT_PAGE_SIZE, { enabled: true });
  }, [loadDevices]);

  const selectedIds = useMemo(() => selectedDevices.map((device) => device.id), [selectedDevices]);

  const rowSelection: TableProps<PushTest.Device>['rowSelection'] = {
    type: multiDevice ? 'checkbox' : 'radio',
    selectedRowKeys: selectedIds,
    preserveSelectedRowKeys: true,
    getCheckboxProps: (record) => ({
      disabled:
        !record.selectable ||
        (multiDevice && selectedDevices.length >= MAX_DEVICES && !selectedIds.includes(record.id)),
    }),
    onChange: (_keys, rows) => {
      setSelectedDevices(multiDevice ? rows.slice(0, MAX_DEVICES) : rows.slice(-1));
    },
  };

  const deviceColumns: TableColumnsType<PushTest.Device> = [
    {
      title: '用户',
      key: 'user',
      width: 170,
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.name || record.username || record.userId}</Typography.Text>
          <Typography.Text type="secondary">{record.username || record.userId}</Typography.Text>
        </Space>
      ),
    },
    { title: '平台', dataIndex: 'platform', width: 88, render: (value: string) => <Tag>{value || '—'}</Tag> },
    { title: '环境', dataIndex: 'environment', width: 100 },
    {
      title: 'App ID',
      dataIndex: 'appId',
      width: 180,
      ellipsis: true,
      render: (value: string) => <Typography.Text code>{value || '—'}</Typography.Text>,
    },
    {
      title: 'Client ID',
      dataIndex: 'clientIdMasked',
      width: 130,
      render: (value?: string) => <Typography.Text code>{value || '—'}</Typography.Text>,
    },
    {
      title: '状态',
      dataIndex: 'selectable',
      width: 90,
      render: (selectable: boolean) =>
        selectable ? <Tag color="success">可发送</Tag> : <Tag>不可选</Tag>,
    },
    {
      title: '最近上报',
      dataIndex: 'lastSeenTime',
      width: 155,
      render: (value?: string) => formatDate(value),
    },
  ];

  const resultColumns: TableColumnsType<PushTest.DeviceResult> = [
    { title: '设备 ID', dataIndex: 'deviceId', width: 100 },
    {
      title: '用户 / 设备',
      key: 'device',
      render: (_value, result) => {
        const device = runDevices.find((item) => item.id === result.deviceId);
        return device ? `${device.name || device.username || device.userId} · ${device.platform}` : '设备信息不可用';
      },
    },
    {
      title: '发送状态',
      dataIndex: 'status',
      width: 160,
      render: (status: string) => {
        const info = statusLabel(status);
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: 'Provider 状态',
      dataIndex: 'providerStatus',
      width: 180,
      render: (value?: string) => value ? <Typography.Text code>{value}</Typography.Text> : '—',
    },
    { title: '说明', dataIndex: 'message', ellipsis: true, render: (value?: string) => value || '—' },
    { title: '更新时间', dataIndex: 'updatedAt', width: 160, render: (value?: number) => formatDate(value) },
  ];

  function handlePreview(values: PushTest.MessageForm) {
    let extra: Record<string, unknown> | undefined;
    try {
      extra = parseExtraJson(values.extraJson);
    } catch (error) {
      message.error(getErrorMessage(error, '扩展 JSON 格式无效'));
      return;
    }
    setPreview({ ...values, link: values.link?.trim() || '', extra });
    setPreviewOpen(true);
  }

  async function handleSend() {
    if (!preview || selectedDevices.length === 0) return;
    setSending(true);
    try {
      const res = await pushTestApi.sendTest({
        deviceIds: selectedDevices.map((device) => device.id),
        title: preview.title.trim(),
        content: preview.content.trim(),
        forceNotification: preview.forceNotification ?? false,
        link: preview.link,
        extra: preview.extra,
      });
      setTestRun(res.data);
      setRunDevices([...selectedDevices]);
      setPreviewOpen(false);
      message.success('测试推送已提交，发送结果已更新');
    } catch (error) {
      message.error(getErrorMessage(error, '测试推送发送失败'));
    } finally {
      setSending(false);
    }
  }

  async function refreshTestStatus() {
    if (!testRun) return;
    setStatusLoading(true);
    try {
      const res = await pushTestApi.testStatus(testRun.testId);
      setTestRun(res.data);
      message.success('测试状态已刷新');
    } catch (error) {
      message.error(getErrorMessage(error, '测试状态查询失败'));
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <div className="fa-full-content-p12 fa-flex-column fa-gap12 fa-content">
      <div className="fa-flex-row-center fa-p8">
        <div className="fa-h3">UniPush 测试台</div>
      </div>

      <Alert
        type="info"
        showIcon
        message="仅向已登记的 UniPush 设备发送测试通知"
        description="Provider 已受理只表示推送服务接受了请求，不代表设备已经收到通知。单次最多选择 5 台设备。"
      />

      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={14}>
          <Card
            title="目标设备"
            extra={
              <Space>
                <Typography.Text type="secondary">{multiDevice ? '多设备' : '单设备'}</Typography.Text>
                <Switch
                  aria-label="切换多设备测试模式"
                  checked={multiDevice}
                  checkedChildren="多选"
                  unCheckedChildren="单选"
                  onChange={(checked) => {
                    setMultiDevice(checked);
                    if (!checked) setSelectedDevices((current) => current.slice(0, 1));
                  }}
                />
                <Tag color={selectedDevices.length ? 'blue' : 'default'}>
                  已选 {selectedDevices.length}/{multiDevice ? MAX_DEVICES : 1}
                </Tag>
              </Space>
            }
          >
            <Form<PushTest.DeviceQuery>
              form={filterForm}
              layout="vertical"
              initialValues={{ enabled: true }}
              onFinish={(values) => void loadDevices(1, pagination.pageSize, values)}
            >
              <Row gutter={8}>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="userId" label="用户 ID">
                    <Input allowClear placeholder="精确筛选用户 ID" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="platform" label="平台">
                    <Input allowClear placeholder="如 android、ios" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="appId" label="App ID">
                    <Input allowClear placeholder="UniPush App ID" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="environment" label="环境">
                    <Input allowClear placeholder="如 test、production" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item name="enabled" label="设备状态">
                    <Select
                      allowClear
                      options={[
                        { label: '仅启用设备', value: true },
                        { label: '仅停用设备', value: false },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Form.Item label=" ">
                    <Space>
                      <Button htmlType="submit" icon={<SearchOutlined />} loading={deviceLoading}>
                        查询
                      </Button>
                      <Button
                        onClick={() => {
                          filterForm.resetFields();
                          void loadDevices(1, pagination.pageSize, { enabled: true });
                        }}
                      >
                        重置
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Table<PushTest.Device>
              rowKey="id"
              size="small"
              columns={deviceColumns}
              dataSource={devices}
              loading={deviceLoading}
              rowSelection={rowSelection}
              scroll={{ x: 900 }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
                showTotal: (total) => `共 ${total} 台`,
              }}
              onChange={(nextPagination) =>
                void loadDevices(nextPagination.current ?? 1, nextPagination.pageSize ?? DEFAULT_PAGE_SIZE)
              }
              locale={{ emptyText: '暂无符合条件的推送设备' }}
            />

            <Divider plain>已选设备</Divider>
            {selectedDevices.length ? (
              <Space wrap>
                {selectedDevices.map((device) => (
                  <Tag
                    key={device.id}
                    closable
                    onClose={(event) => {
                      event.preventDefault();
                      setSelectedDevices((current) => current.filter((item) => item.id !== device.id));
                    }}
                  >
                    {device.name || device.username || device.userId} · {device.platform} · {device.environment}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Typography.Text type="secondary">请从设备列表中选择一个目标设备。</Typography.Text>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card title="测试消息">
            <Form<PushTest.MessageForm>
              form={messageForm}
              layout="vertical"
              initialValues={{ forceNotification: false }}
              onFinish={(values) => void handlePreview(values)}
            >
              <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, whitespace: true, message: '请输入推送标题' }, { max: 50, message: '标题不能超过 50 个字符' }]}
              >
                <Input maxLength={50} showCount placeholder="测试推送标题" />
              </Form.Item>
              <Form.Item
                name="content"
                label="内容"
                rules={[{ required: true, whitespace: true, message: '请输入推送内容' }, { max: 256, message: '内容不能超过 256 个字符' }]}
              >
                <Input.TextArea rows={4} maxLength={256} showCount placeholder="填写设备端要显示的通知内容" />
              </Form.Item>
              <Form.Item
                name="link"
                label="应用内链接"
                rules={[
                  { max: 1024, message: '应用内链接不能超过 1024 个字符' },
                  {
                    validator: async (_rule, value: string | undefined) => {
                      const link = value?.trim().toLowerCase() ?? '';
                      if (link.startsWith('//') || link.includes('://') || link.startsWith('javascript:') || link.startsWith('data:')) {
                        throw new Error('请填写应用内路由，不能填写外部 URL');
                      }
                    },
                  },
                ]}
                extra="填写 App 内已有页面路由；留空时由客户端按默认行为处理。"
              >
                <Input maxLength={1024} showCount placeholder="例如 pages/index/index" />
              </Form.Item>
              <Form.Item
                name="forceNotification"
                label="强制显示通知栏消息"
                valuePropName="checked"
                extra="开启后，应用在线时也会自动创建通知栏消息；关闭时沿用 UniPush 默认行为。"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              <Form.Item
                name="extraJson"
                label="扩展 JSON（可选）"
                rules={[
                  {
                    validator: async (_rule, value: string | undefined) => {
                      try {
                        parseExtraJson(value);
                      } catch (error) {
                        throw new Error(getErrorMessage(error, '扩展 JSON 格式无效'));
                      }
                    },
                  },
                ]}
                extra="必须是 JSON 对象；type、testId、link、route 为系统保留字段。"
              >
                <Input.TextArea rows={5} placeholder={'{\n  "source": "admin-test"\n}'} />
              </Form.Item>
              <Button
                type="primary"
                icon={<SendOutlined />}
                disabled={selectedDevices.length === 0}
                onClick={() => messageForm.submit()}
              >
                预览并发送
              </Button>
            </Form>
          </Card>
        </Col>

        {testRun && (
          <Col span={24}>
            <Card
              title="本次测试结果"
              extra={
                <Button icon={<ReloadOutlined />} loading={statusLoading} onClick={() => void refreshTestStatus()}>
                  刷新状态
                </Button>
              }
            >
              <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 3 }} className="fa-mb12">
                <Descriptions.Item label="测试编号">
                  <Typography.Text copyable code>{testRun.testId}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">{formatDate(testRun.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="记录保留">24 小时</Descriptions.Item>
              </Descriptions>
              <Alert
                className="fa-mb12"
                type="warning"
                showIcon
                message="Provider 受理不等于设备送达"
                description="客户端接收和点击回执需移动端回调功能接入后才能显示；本页面当前展示服务端逐设备发送状态。"
              />
              <Table<PushTest.DeviceResult>
                rowKey="deviceId"
                size="small"
                columns={resultColumns}
                dataSource={testRun.devices}
                pagination={false}
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>
        )}
      </Row>

      <Modal
        title="发送前确认"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        onOk={() => void handleSend()}
        okText="确认发送"
        cancelText="返回修改"
        confirmLoading={sending}
        destroyOnHidden
      >
        {preview && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              type="warning"
              showIcon
              message={`即将向 ${selectedDevices.length} 台设备发送即时测试通知`}
              description="请确认目标设备和消息内容。发送后通知可能立即出现在用户设备上。"
            />
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="目标设备">
                <Space wrap>
                  {selectedDevices.map((device) => (
                    <Tag key={device.id}>
                      {device.name || device.username || device.userId} · {device.platform}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="标题">{preview.title}</Descriptions.Item>
              <Descriptions.Item label="内容">{preview.content}</Descriptions.Item>
              <Descriptions.Item label="应用内链接">{preview.link || '—'}</Descriptions.Item>
              <Descriptions.Item label="强制显示通知栏消息">{preview.forceNotification ? '开启' : '关闭'}</Descriptions.Item>
              {preview.extra && (
                <Descriptions.Item label="扩展数据">
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                    {JSON.stringify(preview.extra, null, 2)}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Space>
        )}
      </Modal>
    </div>
  );
}
