import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Descriptions, Form, Input, InputNumber, Select, Space, Table, Tabs, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { telemetry, TelemetryErrorBoundary, type TelemetryEventType } from '@features/fa-admin-pages/telemetry';

interface EventValues {
  eventType: TelemetryEventType;
  eventCode: string;
  bizId?: string;
  result: string;
  duration?: number;
  properties: string;
}

interface Operation {
  id: number;
  time: string;
  scenario: string;
  detail: string;
  code: string;
}

function parseProperties(value: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('扩展属性必须是 JSON 对象');
  return parsed as Record<string, unknown>;
}

function CrashDemo({ crash, runId }: { crash: boolean; runId: string }) {
  if (crash) throw new Error(`TelemetryDemo React render failure [${runId}]`);
  return <Alert type="success" title="局部演示组件运行正常" />;
}

export default function TelemetryDemoPage() {
  const [form] = Form.useForm<EventValues>();
  const [runId] = useState(() => `demo-${Date.now().toString(36)}`);
  const [snapshot, setSnapshot] = useState(() => telemetry.isInitialized() ? telemetry.getBasePayload() : undefined);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [count, setCount] = useState<number | null>(3);
  const [crash, setCrash] = useState(false);
  const [boundaryKey, setBoundaryKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sequence = useRef(0);
  const ready = Boolean(snapshot);
  const context = { module: 'telemetry-demo', demoRunId: runId };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function record(scenario: string, detail: unknown, code: string) {
    const operation = { id: ++sequence.current, time: new Date().toLocaleTimeString(), scenario, detail: JSON.stringify(detail, null, 2), code };
    setOperations((previous) => [operation, ...previous].slice(0, 50));
  }

  function sendEvent(values: EventValues) {
    if (!telemetry.isInitialized()) return;
    const options = {
      eventType: values.eventType, module: 'telemetry-demo', bizType: 'DEMO', bizId: values.bizId,
      result: values.result, duration: values.duration,
      properties: { ...parseProperties(values.properties), ...context },
    };
    telemetry.track(values.eventCode, options);
    record('事件：已触发调用', options, `telemetry.track(${JSON.stringify(values.eventCode)}, ${JSON.stringify(options, null, 2)});`);
  }

  function captureBatch(different: boolean) {
    if (!telemetry.isInitialized() || count === null || !Number.isInteger(count) || count < 1 || count > 10) return;
    const sharedError = new Error('TelemetryDemo repeated failure');
    for (let i = 0; i < count; i++) {
      const error = different ? new Error(`TelemetryDemo ${String.fromCharCode(65 + i)} failure`) : sharedError;
      telemetry.captureException(error, context);
    }
    record(different ? '不同异常：已触发调用' : '同类异常：已触发调用', { ...context, count },
      different ? 'telemetry.captureException(new Error("TelemetryDemo A failure"), context); // 每次使用不同字母的消息'
        : 'const error = new Error("TelemetryDemo repeated failure");\nfor (let i = 0; i < count; i++) telemetry.captureException(error, context);');
  }

  const events = <Form form={form} layout="vertical" onFinish={sendEvent} disabled={!ready}
    initialValues={{ eventType: 'BUSINESS', eventCode: 'demo.telemetry.order', result: 'SUCCESS', duration: 100, properties: '{"source":"demo"}' }}>
    <Space wrap align="start">
      <Form.Item name="eventType" label="事件类型" rules={[{ required: true }]}><Select style={{ width: 170 }} options={['LOGIN', 'PAGE_VIEW', 'ACTION', 'BUSINESS'].map(value => ({ value, label: value }))} /></Form.Item>
      <Form.Item name="eventCode" label="事件编码" rules={[{ required: true, pattern: /^demo\.telemetry\.[\w.-]+$/, message: '请使用 demo.telemetry. 前缀及字母、数字、点或横线' }, { max: 128 }]}><Input style={{ width: 260 }} maxLength={128} /></Form.Item>
      <Form.Item name="bizId" label="业务标识" rules={[{ max: 128 }]}><Input maxLength={128} /></Form.Item>
      <Form.Item name="result" label="业务结果" rules={[{ required: true }]}><Select style={{ width: 130 }} options={['SUCCESS', 'FAIL'].map(value => ({ value, label: value }))} /></Form.Item>
      <Form.Item name="duration" label="耗时（毫秒）" rules={[{ type: 'number', min: 0 }]}><InputNumber min={0} /></Form.Item>
    </Space>
    <Form.Item name="properties" label="扩展属性 JSON" rules={[{ required: true }, { validator: async (_, value: string) => { try { parseProperties(value); } catch { throw new Error('请输入有效的 JSON 对象，例如 {"source":"demo"}'); } } }]}>
      <Input.TextArea rows={4} maxLength={8000} />
    </Form.Item>
    <Space wrap>
      <Button type="primary" htmlType="submit">触发事件上报</Button>
      <Button onClick={() => { telemetry.page(context); record('浏览：已触发调用', context, `telemetry.page(${JSON.stringify(context)});`); }}>演示 page()</Button>
      <Button onClick={() => { const options = { eventType: 'LOGIN' as const, module: 'telemetry-demo', result: 'SUCCESS', properties: context }; telemetry.track('demo.telemetry.login', options); record('模拟登录事件：已触发调用', options, `telemetry.track('demo.telemetry.login', ${JSON.stringify(options)});`); }}>模拟登录事件</Button>
    </Space>
    <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>模拟登录仅发送事件，不改变登录状态。page() 使用 SDK 固定编码 page.view，通过 properties.demoRunId 识别本次测试。</Typography.Paragraph>
  </Form>;

  const errors = <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
    <Alert type="info" showIcon title="按钮会产生真实异常数据" description="全局异常由 SDK 的 error / unhandledrejection 监听器捕获，控制台可能显示错误；开发模式可能显示错误覆盖层。可在异常详情中查看此前事件形成的 breadcrumbs。" />
    <Space wrap>
      <Button danger disabled={!ready} onClick={() => {
        const message = `TelemetryDemo主动触发异常 [${runId}]`;
        record('主动异常：已触发', { demoRunId: runId, message }, `throw new Error(${JSON.stringify(message)});`);
        throw new Error(message);
      }}>主动触发异常</Button>
      <Button disabled={!ready} onClick={() => { telemetry.captureException(new Error('TelemetryDemo manual failure'), context); record('手动异常：已触发调用', context, `telemetry.captureException(new Error('TelemetryDemo manual failure'), ${JSON.stringify(context)});`); }}>手动捕获异常</Button>
      <Button disabled={!ready} onClick={() => { record('运行时异常：已安排触发', { demoRunId: runId }, 'setTimeout(() => { throw new Error(message); }, 0);'); timers.current.push(setTimeout(() => { throw new Error(`TelemetryDemo runtime failure [${runId}]`); }, 0)); }}>触发异步运行时异常</Button>
      <Button disabled={!ready} onClick={() => { record('Promise 异常：已触发', { demoRunId: runId }, 'void Promise.reject(new Error(message));'); void Promise.reject(new Error(`TelemetryDemo promise rejection [${runId}]`)); }}>触发未处理 Promise</Button>
    </Space>
    <Space wrap>
      <span>聚合测试数量（1～10）</span><InputNumber aria-label="聚合测试数量" min={1} max={10} precision={0} value={count} onChange={setCount} />
      <Button disabled={!ready || count === null} onClick={() => captureBatch(false)}>重复同类异常</Button>
      <Button disabled={!ready || count === null} onClick={() => captureBatch(true)}>触发不同异常</Button>
    </Space>
    <Typography.Text type="secondary">同类异常复用同一个 Error 对象，预期归入同一 Issue；不同异常使用不同字母消息，预期分为多个 Issue。已有相同测试数据时，应比较事件数量增量。</Typography.Text>
    <Card size="small" title="React 异常边界">
      <Space style={{ marginBottom: 12 }}>
        <Button disabled={!ready || crash} onClick={() => { record('React 异常：已请求触发', { demoRunId: runId }, '<TelemetryErrorBoundary fallback={fallback}><CrashDemo /></TelemetryErrorBoundary>'); setCrash(true); }}>触发局部渲染异常</Button>
        <Button onClick={() => { setCrash(false); setBoundaryKey(key => key + 1); }}>恢复组件</Button>
      </Space>
      <TelemetryErrorBoundary key={boundaryKey} fallback={<Alert type="error" title="局部异常已由 TelemetryErrorBoundary 捕获，点击恢复组件继续测试" />}>
        <CrashDemo crash={crash} runId={runId} />
      </TelemetryErrorBoundary>
    </Card>
  </Space>;

  return <div className="fa-full-content-p12" style={{ overflow: 'auto' }}>
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Card title="Telemetry 交互测试台" extra={<Tag color={ready ? 'green' : 'orange'}>{ready ? 'SDK 已初始化' : 'SDK 未初始化'}</Tag>}>
        <Alert showIcon type="info" title="操作记录只表示触发调用，不代表上报成功或数据已落库" description="使用当前应用和登录身份发送真实测试数据；请确保应用已配置且允许上报。结果需到 Telemetry 管理页面核对。" />
        <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 3 }} style={{ marginTop: 16 }} items={[
          { key: 'run', label: '本次 demoRunId', children: <Typography.Text copyable>{runId}</Typography.Text> },
          { key: 'app', label: '应用标识', children: snapshot?.appKey || '未配置' },
          { key: 'environment', label: '环境 / 客户端', children: snapshot ? `${snapshot.environment} / ${snapshot.clientType}` : '—' },
          { key: 'release', label: '版本', children: snapshot?.release || '—' },
          { key: 'session', label: '会话', children: snapshot?.sessionId || '—' },
          { key: 'user', label: '用户 / 租户', children: `${snapshot?.userId || '匿名'} / ${snapshot?.tenantId || '无'}` },
        ]} />
        <Button onClick={() => setSnapshot(telemetry.isInitialized() ? telemetry.getBasePayload() : undefined)}>刷新状态</Button>
      </Card>
      <Card><Tabs items={[
        { key: 'events', label: '事件上报', children: events },
        { key: 'errors', label: '异常与聚合', children: errors },
        { key: 'context', label: '上下文与请求头', children: <><Typography.Paragraph>只读展示当前 SDK 状态，不重新初始化，也不更改登录身份。</Typography.Paragraph><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{JSON.stringify({ payload: snapshot, headers: ready ? telemetry.getRequestHeaders() : {} }, null, 2)}</pre></> },
      ]} /></Card>
      <Card title="结果验证">
        <Space wrap>{[['dashboard', '统计看板'], ['issue', '异常 Issue'], ['event', '异常事件'], ['stat-event', '业务事件']].map(([path, name]) => <Link key={path} to={`/admin/system/telemetry/${path}`}>{name}</Link>)}</Space>
        <Typography.Paragraph style={{ marginTop: 12 }}>按触发时间、当前用户和 demo.telemetry.* 事件编码查找；在详情的 properties / context 中核对 demoRunId。全局及 React 异常将 demoRunId 放在消息中。管理页面需要对应菜单权限。</Typography.Paragraph>
        <Typography.Paragraph type="secondary">建议依次触发业务事件 → 手动异常 → 查看 breadcrumbs → 重复同类异常并比较 Issue 计数。后台异步处理可能有延迟，每日聚合依赖定时任务，按钮操作不会立即完成每日统计。</Typography.Paragraph>
      </Card>
      <Card title="本地操作记录（最近 50 条）" extra={<Button onClick={() => setOperations([])}>清空本地记录</Button>}>
        <Table<Operation> size="small" rowKey="id" dataSource={operations} pagination={{ pageSize: 5 }} columns={[
          { title: '时间', dataIndex: 'time', width: 130 }, { title: '场景', dataIndex: 'scenario' },
        ]} expandable={{ expandedRowRender: row => <><Typography.Text strong>输入参数</Typography.Text><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{row.detail}</pre><Typography.Text strong>调用示例</Typography.Text><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{row.code}</pre></> }} />
      </Card>
    </Space>
  </div>;
}
