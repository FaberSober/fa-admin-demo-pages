import { useRef, useState } from 'react';
import type { PreparedCryptoRequest, FieldCryptoPreparation } from '@fa/core/crypto';
import { FaJsonView, useApiLoading } from '@fa/ui';
import { Alert, Button, Card, Descriptions, Input, Space, Tag, Typography } from 'antd';
import { isAxiosError } from 'axios';
import { cryptoDemoApi } from '@features/fa-admin-demo-pages/services';

export default function CryptoDemoPage() {
  const [text, setText] = useState('你好，FA Admin 🔐\n跨端加密测试');
  const [preparation, setPreparation] = useState<FieldCryptoPreparation>();
  const [envelope, setEnvelope] = useState<PreparedCryptoRequest>();
  const [result, setResult] = useState<{ ok: boolean; title: string; detail: string }>();
  const [encrypting, setEncrypting] = useState(false);
  const running = useRef(false);
  const requesting = useApiLoading([
    '/api/base/security/crypto/public-key', '/api/base/security/crypto/prepare', cryptoDemoApi.getUrl('roundtrip'),
  ]);
  const busy = requesting || encrypting;
  const bytes = new TextEncoder().encode(text).length;

  async function run(title: string, action: () => Promise<void>) {
    if (running.current) return;
    running.current = true;
    setResult(undefined);
    try {
      await action();
    } catch (error) {
      const detail = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message ?? error.message
        : error instanceof Error ? error.message : '请求失败，请检查服务配置及权限';
      setResult({ ok: false, title: `${title}失败`, detail });
    } finally {
      running.current = false;
    }
  }

  function generate() {
    void run('生成密文', async () => {
      setEnvelope(undefined);
      setPreparation(undefined);
      setEncrypting(true);
      try {
        const encrypted = await cryptoDemoApi.prepare(text);
        setPreparation(encrypted.preparation);
        setEnvelope(encrypted);
        setResult({ ok: true, title: '密文已生成', detail: '点击“提交后台解密”验证。重复生成会使用新的随机密钥和 IV。' });
      } finally {
        setEncrypting(false);
      }
    });
  }

  function submit(tamper: boolean, replay = false) {
    if (!envelope) return;
    const title = tamper ? '篡改提交' : replay ? '原样重放' : '后台解密';
    void run(title, async () => {
      let payload = envelope;
      if (tamper) {
        const parts = String(envelope.body.text).split('.');
        parts[2] = (parts[2].startsWith('A') ? 'B' : 'A') + parts[2].slice(1);
        payload = { ...envelope, body: { ...envelope.body, text: parts.join('.') } };
      }
      const response = await cryptoDemoApi.roundtrip(payload);
      setResult({ ok: true, title: `${title}成功`, detail: response.data.text + `\nage=${response.data.age}（明文原样返回）` });
    });
  }

  return <div className="fa-full-content-p12" style={{ overflow: 'auto' }}>
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Card title="通用加密解密 Demo">
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          <Alert type="info" showIcon title="仅输入普通测试文本，请勿输入真实密码或其他敏感信息"
            description="先生成密文，再交给后台解密。防重放状态由后台配置决定，页面无法关闭保护。" />
          <label htmlFor="crypto-demo-text">测试文本（仅此字段加密，UTF-8 最多 4096 字节）</label>
          <Input.TextArea id="crypto-demo-text" value={text} rows={4} disabled={busy}
            onChange={event => { setText(event.target.value); setEnvelope(undefined); setPreparation(undefined); setResult(undefined); }} />
          <Typography.Text type={bytes > 4096 ? 'danger' : 'secondary'}>{bytes} / 4096 字节</Typography.Text>
          <Space wrap>
            <Button type="primary" loading={busy} disabled={bytes > 4096} onClick={generate}>生成新密文</Button>
            <Button disabled={busy || !envelope} onClick={() => submit(false)}>提交后台解密</Button>
            <Button disabled={busy || !envelope} onClick={() => submit(false, true)}>原样重放</Button>
            <Button danger disabled={busy || !envelope} onClick={() => submit(true)}>篡改后提交</Button>
          </Space>
          <Descriptions size="small" column={{ xs: 1, sm: 2 }} items={[
            { key: 'replay', label: '后端防重放', children: preparation
              ? <Tag color={preparation.replayEnabled ? 'green' : 'orange'}>{preparation.replayEnabled ? '开启' : '关闭'}</Tag> : '尚未读取' },
            { key: 'kid', label: '密钥标识', children: preparation?.kid ?? '—' },
            { key: 'expires', label: '挑战到期时间', children: preparation?.expiresAt
              ? new Date(Number(preparation.expiresAt)).toLocaleString() : '无挑战' },
          ]} />
          {preparation && <Typography.Paragraph type="secondary">
            {preparation.replayEnabled
              ? '开启时：首次提交成功后，重放应被拒绝；生成新密文后等待挑战到期，再首次提交也应被拒绝。'
              : '关闭时：原样重放可以成功，不提供挑战过期保护；篡改密文仍应被拒绝。'}
          </Typography.Paragraph>}
          {result && <div role="status" aria-live="polite"><Alert showIcon type={result.ok ? 'success' : 'error'}
            title={result.title} description={<span style={{ whiteSpace: 'pre-wrap' }}>{result.detail || '（空文本）'}</span>} /></div>}
        </Space>
      </Card>
      <Card title="业务 JSON（age 保持明文）"><FaJsonView data={envelope?.body ?? null} defaultExpandDepth={1} /></Card>
      <Card title="请求 Header"><FaJsonView data={envelope?.headers ?? null} defaultExpandDepth={1} /></Card>
    </Space>
  </div>;
}
