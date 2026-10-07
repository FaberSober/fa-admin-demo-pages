import { BellOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Descriptions, Form, Input, message, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';

interface NotificationFormValues {
  title: string;
  body: string;
}

type NotificationPermissionState = NotificationPermission | 'unsupported' | undefined;
type WorkerState = 'checking' | 'registering' | 'ready' | 'unsupported' | 'insecure' | 'error';

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : '未知错误';
}

export default function BrowserNotificationDemoPage() {
  const [form] = Form.useForm<NotificationFormValues>();
  const [permission, setPermission] = useState<NotificationPermissionState>();
  const [workerState, setWorkerState] = useState<WorkerState>('checking');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [sending, setSending] = useState(false);

  const notificationSupported = typeof window !== 'undefined' && 'Notification' in window;
  const serviceWorkerSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const secureContext = typeof window !== 'undefined' && window.isSecureContext;

  useEffect(() => {
    let active = true;

    async function registerServiceWorker() {
      if (!notificationSupported) {
        setPermission('unsupported');
        setWorkerState('unsupported');
        return;
      }

      setPermission(Notification.permission);

      if (!serviceWorkerSupported) {
        setWorkerState('unsupported');
        return;
      }

      if (!secureContext) {
        setWorkerState('insecure');
        return;
      }

      setWorkerState('registering');
      try {
        const workerRegistration = await navigator.serviceWorker.register('/admin/browser-notification-sw.js', { scope: '/admin/' });
        await navigator.serviceWorker.ready;
        if (!active) return;
        setRegistration(workerRegistration);
        setWorkerState('ready');
      } catch (error) {
        if (!active) return;
        setWorkerState('error');
        message.error('Service Worker 注册失败：' + getErrorMessage(error));
      }
    }

    void registerServiceWorker();
    return () => {
      active = false;
    };
  }, [notificationSupported, secureContext, serviceWorkerSupported]);

  async function requestPermission() {
    if (!notificationSupported || !secureContext) return;

    setRequestingPermission(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        message.success('通知权限已允许');
      } else if (result === 'denied') {
        message.warning('通知权限已拒绝，请到 Chrome 站点设置中手动恢复');
      } else {
        message.info('尚未获得通知权限');
      }
    } catch (error) {
      message.error('请求通知权限失败：' + getErrorMessage(error));
    } finally {
      setRequestingPermission(false);
    }
  }

  function refreshPermission() {
    if (notificationSupported) setPermission(Notification.permission);
  }

  async function sendNotification(values: NotificationFormValues) {
    if (!registration || permission !== 'granted') return;

    setSending(true);
    try {
      await registration.showNotification(values.title.trim(), {
        body: values.body.trim(),
        tag: 'browser-notification-' + Date.now(),
      });
      message.success('通知已提交给浏览器显示');
    } catch (error) {
      message.error('发送通知失败：' + getErrorMessage(error));
    } finally {
      setSending(false);
    }
  }

  const permissionLabel = !notificationSupported
    ? '不支持'
    : permission === 'granted'
      ? '已允许'
      : permission === 'denied'
        ? '已拒绝'
        : permission === 'default'
          ? '尚未授权'
          : '检查中';
  const permissionColor = permission === 'granted' ? 'success' : permission === 'denied' ? 'error' : 'default';
  const workerLabel = {
    checking: '检查中',
    registering: '注册中',
    ready: '已就绪',
    unsupported: '不支持',
    insecure: '需要安全上下文',
    error: '注册失败',
  }[workerState];
  const workerColor = workerState === 'ready' ? 'success' : workerState === 'error' || workerState === 'insecure' ? 'error' : 'default';

  return (
    <div className="fa-full-content-p12" style={{ overflow: 'auto' }}>
      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        <Card title="浏览器系统通知 Demo" extra={<Tag color={workerColor}>Service Worker：{workerLabel}</Tag>}>
          <Alert
            showIcon
            type="info"
            title="此 Demo 会发送操作系统级通知"
            description="通知样式由 Chrome 和操作系统决定。生产环境需要 HTTPS；本地开发请使用 localhost。"
          />
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, lg: 3 }}
            style={{ marginTop: 16 }}
            items={[
              { key: 'context', label: '安全上下文', children: secureContext ? '是' : '否' },
              {
                key: 'notification',
                label: 'Notifications API',
                children: notificationSupported ? '支持' : '不支持',
              },
              {
                key: 'serviceWorker',
                label: 'Service Worker API',
                children: serviceWorkerSupported ? '支持' : '不支持',
              },
              {
                key: 'permission',
                label: '通知权限',
                children: <Tag color={permissionColor}>{permissionLabel}</Tag>,
              },
            ]}
          />
          <Space wrap>
            <Button
              type="primary"
              icon={<BellOutlined />}
              loading={requestingPermission}
              disabled={!notificationSupported || !secureContext}
              onClick={requestPermission}
            >
              请求通知权限
            </Button>
            <Button icon={<ReloadOutlined />} disabled={!notificationSupported} onClick={refreshPermission}>
              刷新权限状态
            </Button>
          </Space>
        </Card>

        {permission === 'denied' && (
          <Alert
            showIcon
            type="warning"
            title="通知权限已被拒绝"
            description="浏览器不会再次自动弹出授权框。请在 Chrome 的站点设置中允许通知，再点击“刷新权限状态”。"
          />
        )}

        {workerState === 'insecure' && (
          <Alert showIcon type="error" title="当前页面不是安全上下文" description="Service Worker 和浏览器通知需要 HTTPS；本地开发可使用 localhost。" />
        )}

        {workerState === 'unsupported' && (
          <Alert showIcon type="warning" title="当前浏览器不支持所需 API" description="发送系统通知需要 Notifications API 和 Service Worker API。" />
        )}

        {workerState === 'error' && (
          <Alert showIcon type="error" title="Service Worker 注册失败" description="请确认 /admin/browser-notification-sw.js 可访问后刷新页面重试。" />
        )}

        <Card title="发送本地测试通知">
          <Form<NotificationFormValues>
            form={form}
            layout="vertical"
            initialValues={{
              title: '浏览器通知测试',
              body: '这是一条由当前页面触发的系统通知。',
            }}
            onFinish={sendNotification}
          >
            <Form.Item
              name="title"
              label="标题"
              rules={[
                { required: true, whitespace: true, message: '请输入通知标题' },
                { max: 50, message: '标题不能超过 50 个字符' },
              ]}
            >
              <Input maxLength={50} showCount placeholder="通知标题" />
            </Form.Item>
            <Form.Item
              name="body"
              label="正文"
              rules={[
                { required: true, whitespace: true, message: '请输入通知正文' },
                { max: 200, message: '正文不能超过 200 个字符' },
              ]}
            >
              <Input.TextArea rows={3} maxLength={200} showCount placeholder="通知正文" />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={sending} disabled={!registration || permission !== 'granted'}>
              发送系统通知
            </Button>
            {workerState !== 'ready' && (
              <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
                Service Worker 就绪后即可发送。
              </Typography.Text>
            )}
          </Form>
        </Card>
      </Space>
    </div>
  );
}
