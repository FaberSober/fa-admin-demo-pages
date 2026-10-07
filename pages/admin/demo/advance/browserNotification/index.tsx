import { BellOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { browserPushApi } from '@features/fa-admin-demo-pages/services';
import { Alert, Button, Card, Descriptions, Form, Input, message, Space, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';

interface NotificationFormValues {
  title: string;
  body: string;
}

type NotificationPermissionState = NotificationPermission | 'unsupported' | undefined;
type WorkerState = 'checking' | 'registering' | 'ready' | 'unsupported' | 'insecure' | 'error';
type PushSubscriptionState = 'checking' | 'unsupported' | 'local-missing' | 'synced' | 'sync-required' | 'error';

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : '未知错误';
}

function decodeVapidPublicKey(value: string): ArrayBuffer {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
  return bytes.buffer;
}

export default function BrowserNotificationDemoPage() {
  const [form] = Form.useForm<NotificationFormValues>();
  const [permission, setPermission] = useState<NotificationPermissionState>();
  const [workerState, setWorkerState] = useState<WorkerState>('checking');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingTestPush, setSendingTestPush] = useState(false);
  const [browserSubscription, setBrowserSubscription] = useState<PushSubscription | null>(null);
  const [pushSubscriptionState, setPushSubscriptionState] = useState<PushSubscriptionState>('checking');
  const [subscribing, setSubscribing] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);

  const notificationSupported = typeof window !== 'undefined' && 'Notification' in window;
  const serviceWorkerSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const pushSupported = typeof window !== 'undefined' && 'PushManager' in window;
  const secureContext = typeof window !== 'undefined' && window.isSecureContext;

  const refreshPushSubscription = useCallback(
    async (workerRegistration: ServiceWorkerRegistration) => {
      if (!pushSupported) {
        setPushSubscriptionState('unsupported');
        return;
      }

      try {
        const subscription = await workerRegistration.pushManager.getSubscription();
        setBrowserSubscription(subscription);
        if (!subscription) {
          setPushSubscriptionState('local-missing');
          return;
        }

        setPushSubscriptionState('checking');
        const result = await browserPushApi.subscriptionStatus(subscription.endpoint);
        setPushSubscriptionState(result.data?.subscribed ? 'synced' : 'sync-required');
      } catch {
        setPushSubscriptionState('error');
      }
    },
    [pushSupported],
  );

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

  useEffect(() => {
    if (registration) void refreshPushSubscription(registration);
  }, [registration, refreshPushSubscription]);

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

  async function subscribeBrowserPush() {
    if (!registration || !notificationSupported || !pushSupported || !secureContext) return;

    setSubscribing(true);
    try {
      let currentPermission = Notification.permission;
      if (currentPermission === 'default') {
        currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);
      }
      if (currentPermission !== 'granted') {
        throw new Error(currentPermission === 'denied' ? '通知权限已拒绝，请先在 Chrome 站点设置中允许通知' : '未获得通知权限');
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const keyResult = await browserPushApi.vapidPublicKey();
        const publicKey = keyResult.data?.publicKey?.trim();
        if (!publicKey) throw new Error('服务端未配置 Web Push VAPID 公钥');
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidPublicKey(publicKey),
        });
      }

      const subscriptionJson = subscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh;
      const auth = subscriptionJson.keys?.auth;
      if (!subscriptionJson.endpoint || !p256dh || !auth) throw new Error('浏览器返回的推送订阅信息不完整');

      await browserPushApi.registerSubscription({
        endpoint: subscriptionJson.endpoint,
        keys: { p256dh, auth },
      });
      message.success('当前浏览器已订阅并同步到服务端');
      await refreshPushSubscription(registration);
    } catch (error) {
      message.error('订阅浏览器推送失败：' + getErrorMessage(error));
      await refreshPushSubscription(registration);
    } finally {
      setSubscribing(false);
    }
  }

  async function unsubscribeBrowserPush() {
    if (!registration) return;

    setUnsubscribing(true);
    try {
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        await refreshPushSubscription(registration);
        message.info('当前浏览器尚未订阅');
        return;
      }

      const subscriptionJson = subscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh;
      const auth = subscriptionJson.keys?.auth;
      if (!subscriptionJson.endpoint || !p256dh || !auth) throw new Error('浏览器返回的推送订阅信息不完整');

      const subscriptionPayload = {
        endpoint: subscriptionJson.endpoint,
        keys: { p256dh, auth },
      };
      await browserPushApi.unregisterSubscription(subscriptionPayload.endpoint);
      try {
        const unsubscribed = await subscription.unsubscribe();
        if (!unsubscribed) throw new Error('浏览器未能取消本地订阅');
      } catch (error) {
        try {
          await browserPushApi.registerSubscription(subscriptionPayload);
        } catch {
          throw new Error('本地取消失败，且服务端订阅恢复失败；请重新订阅以同步状态');
        }
        throw error;
      }

      setBrowserSubscription(null);
      setPushSubscriptionState('local-missing');
      message.success('当前浏览器已取消订阅');
    } catch (error) {
      message.error('取消浏览器推送订阅失败：' + getErrorMessage(error));
      await refreshPushSubscription(registration);
    } finally {
      setUnsubscribing(false);
    }
  }

  async function sendNotification(values: NotificationFormValues) {
    if (!registration || permission !== 'granted') return;

    setSending(true);
    try {
      await registration.showNotification(values.title.trim(), {
        body: values.body.trim(),
        tag: 'browser-notification-' + Date.now(),
        data: { url: '/admin/demo/advance/browserNotification' },
      });
      message.success('通知已提交给浏览器显示');
    } catch (error) {
      message.error('发送通知失败：' + getErrorMessage(error));
    } finally {
      setSending(false);
    }
  }

  async function sendServerTestPush() {
    const values = await form.validateFields().catch(() => undefined);
    if (!values) return;

    setSendingTestPush(true);
    try {
      const result = await browserPushApi.sendTestPush({
        title: values.title.trim(),
        body: values.body.trim(),
      });
      const delivery = result.data;
      if (!delivery) throw new Error('服务端未返回推送结果');

      if (delivery.failedCount === 0) {
        message.success('服务端已接受 ' + delivery.acceptedCount + ' 个浏览器订阅的推送');
      } else if (delivery.acceptedCount > 0) {
        message.warning('服务端接受 ' + delivery.acceptedCount + ' 个，失败 ' + delivery.failedCount + ' 个');
      } else {
        message.error('服务端未能接受推送，请检查私钥配置和订阅状态');
      }
    } catch (error) {
      message.error('发送服务端推送失败：' + getErrorMessage(error));
    } finally {
      setSendingTestPush(false);
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
  const pushSubscriptionLabel = {
    checking: '检查中',
    unsupported: '不支持',
    'local-missing': '未订阅',
    synced: '已同步到服务端',
    'sync-required': '本地已订阅，待同步',
    error: '服务端状态读取失败',
  }[pushSubscriptionState];
  const pushSubscriptionColor = pushSubscriptionState === 'synced' ? 'success' : pushSubscriptionState === 'error' ? 'error' : 'default';

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

        <Card title="浏览器推送订阅">
          <Alert
            showIcon
            type="info"
            title="订阅当前浏览器并绑定到当前登录用户"
            description="订阅后可向当前登录用户的浏览器发送服务端测试推送；即使关闭接收页面，Service Worker 仍可显示通知。新建订阅需要服务端配置 fa.push.webpush.vapid-public-key。"
          />
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2 }}
            style={{ marginTop: 16 }}
            items={[
              { key: 'push', label: 'Push API', children: pushSupported ? '支持' : '不支持' },
              {
                key: 'subscription',
                label: '当前浏览器订阅',
                children: <Tag color={pushSubscriptionColor}>{pushSubscriptionLabel}</Tag>,
              },
            ]}
          />
          <Space wrap>
            <Button
              type="primary"
              icon={<BellOutlined />}
              loading={subscribing}
              disabled={!registration || !notificationSupported || !pushSupported || !secureContext || permission === 'denied'}
              onClick={subscribeBrowserPush}
            >
              {browserSubscription ? '同步此浏览器订阅' : '订阅此浏览器'}
            </Button>
            <Button danger loading={unsubscribing} disabled={!registration || !pushSupported || !browserSubscription} onClick={unsubscribeBrowserPush}>
              取消订阅
            </Button>
            <Button
              icon={<ReloadOutlined />}
              disabled={!registration || !pushSupported}
              onClick={() => registration && void refreshPushSubscription(registration)}
            >
              刷新订阅状态
            </Button>
          </Space>
        </Card>

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
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={sending} disabled={!registration || permission !== 'granted'}>
                发送本地通知
              </Button>
              <Button htmlType="button" icon={<SendOutlined />} loading={sendingTestPush} onClick={() => void sendServerTestPush()}>
                发送服务端推送
              </Button>
            </Space>
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
