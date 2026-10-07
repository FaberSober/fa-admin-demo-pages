import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { ArithmeticCaptcha, ImageSelectCaptcha, type ImageSelectCaptchaItem, SliderPuzzleCaptcha, TextImageCaptcha } from '@features/fa-admin-pages/components';
import { Alert, Button, Card, Col, Form, Input, message, Row, Space, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useState } from 'react';

const textAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const sliderMaxOffset = 272;

interface TextChallenge {
  imageUrl: string;
  answer: string;
}

interface ArithmeticChallenge {
  imageUrl: string;
  answer: string;
}

interface ImageChallenge {
  items: ImageSelectCaptchaItem[];
  answer: string[];
}

interface SliderChallenge {
  backgroundUrl: string;
  pieceUrl: string;
  targetOffset: number;
}

function createSvgDataUrl(svg: string) {
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function createTextChallenge(): TextChallenge {
  const answer = Array.from({ length: 4 }, () => textAlphabet[Math.floor(Math.random() * textAlphabet.length)]).join('');
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="132" height="40" viewBox="0 0 132 40">' +
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e0f2fe"/><stop offset="1" stop-color="#fef3c7"/></linearGradient></defs>' +
    '<rect width="132" height="40" rx="6" fill="url(#bg)"/>' +
    '<path d="M4 30L125 8M8 9L120 33" stroke="#94a3b8" stroke-width="1.4" opacity=".65"/>' +
    '<circle cx="18" cy="14" r="2" fill="#818cf8"/><circle cx="111" cy="27" r="2" fill="#f97316"/>' +
    '<text x="66" y="28" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="5" fill="#263247">' +
    answer +
    '</text></svg>';
  return { imageUrl: createSvgDataUrl(svg), answer };
}

function createArithmeticChallenge(): ArithmeticChallenge {
  let left = Math.floor(Math.random() * 8) + 2;
  let right = Math.floor(Math.random() * 8) + 2;
  const add = Math.random() >= 0.5;
  if (!add && right > left) {
    [left, right] = [right, left];
  }
  const question = left + (add ? ' + ' : ' − ') + right + ' = ?';
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="40" viewBox="0 0 180 40">' +
    '<defs><linearGradient id="math-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eff6ff"/><stop offset="1" stop-color="#f5f3ff"/></linearGradient></defs>' +
    '<rect width="180" height="40" rx="6" fill="url(#math-bg)"/>' +
    '<path d="M5 32L174 8M12 7L166 33" stroke="#94a3b8" stroke-width="1" opacity=".3"/>' +
    '<circle cx="20" cy="12" r="1.5" fill="#818cf8" opacity=".65"/><circle cx="158" cy="29" r="2" fill="#38bdf8" opacity=".6"/>' +
    '<text x="90" y="27" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="2" fill="#263247">' +
    question +
    '</text></svg>';
  return { imageUrl: createSvgDataUrl(svg), answer: String(add ? left + right : left - right) };
}

const imageChallengeItems: ImageSelectCaptchaItem[] = [
  { id: 'apple', alt: '苹果', content: '🍎' },
  { id: 'banana', alt: '香蕉', content: '🍌' },
  { id: 'cherries', alt: '樱桃', content: '🍒' },
  { id: 'airplane', alt: '飞机', content: '✈️' },
  { id: 'bicycle', alt: '自行车', content: '🚲' },
  { id: 'book', alt: '书本', content: '📘' },
];

function createImageChallenge(): ImageChallenge {
  const items = [...imageChallengeItems];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return { items, answer: ['apple', 'banana', 'cherries'] };
}

function createSliderChallenge(): SliderChallenge {
  const targetOffset = 138 + Math.floor(Math.random() * 120);
  const targetPath =
    'M ' + targetOffset + ' 26 h 13 c 0 10 14 10 14 0 h 21 v 13 c -10 0 -10 14 0 14 v 21 h -13 c 0 -10 -14 -10 -14 0 h -21 v -13 c 10 0 10 -14 0 -14 z';
  const backgroundSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="132" viewBox="0 0 320 132">' +
    '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#dbeafe"/><stop offset="1" stop-color="#bfdbfe"/></linearGradient></defs>' +
    '<rect width="320" height="132" fill="url(#sky)"/>' +
    '<circle cx="265" cy="31" r="18" fill="#fbbf24"/>' +
    '<path d="M0 91L62 38l45 48 42-34 79 80H0z" fill="#60a5fa"/>' +
    '<path d="M100 91l51-54 43 46 33-26 93 75H89z" fill="#2563eb" opacity=".8"/>' +
    '<path d="M0 112c55-18 107-10 153 4s111 12 167-5v21H0z" fill="#0f766e"/>' +
    '<path d="' +
    targetPath +
    '" fill="#ffffff" fill-opacity=".62" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/></svg>';
  const pieceSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">' +
    '<defs><linearGradient id="piece" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#dbeafe"/></linearGradient></defs>' +
    '<path d="M0 0h13c0 10 14 10 14 0h21v13c-10 0-10 14 0 14v21H35c0-10-14-10-14 0H0V35c10 0 10-14 0-14z" fill="url(#piece)" stroke="#fff" stroke-width="2"/>' +
    '<circle cx="24" cy="24" r="5" fill="#60a5fa" opacity=".8"/></svg>';
  return {
    backgroundUrl: createSvgDataUrl(backgroundSvg),
    pieceUrl: createSvgDataUrl(pieceSvg),
    targetOffset,
  };
}

function CaptchaDemoCard({ title, description, extra, children }: { title: string; description: string; extra: ReactNode; children: ReactNode }) {
  return (
    <Card title={title} extra={extra} className="fa-captcha-demo-card">
      <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      {children}
    </Card>
  );
}

interface CaptchaLoginFormValues {
  account: string;
  password: string;
  captcha: unknown;
}

function CaptchaLoginForm({
  title,
  description,
  initialCaptchaValue,
  onRefreshChallenge,
  validateCaptcha,
  children,
}: {
  title: string;
  description: string;
  initialCaptchaValue?: string | string[] | number;
  onRefreshChallenge: () => void;
  validateCaptcha: (value: unknown) => boolean;
  children: ReactNode;
}) {
  const [form] = Form.useForm<CaptchaLoginFormValues>();

  function refreshCaptcha() {
    onRefreshChallenge();
    form.resetFields(['captcha']);
  }

  function handleFinish(values: CaptchaLoginFormValues) {
    if (validateCaptcha(values.captcha)) {
      message.success('模拟登录验证通过');
    } else {
      message.error('验证码错误，已刷新题目');
      refreshCaptcha();
    }
  }

  return (
    <Card title={title} extra={<Button aria-label={`刷新${title}`} icon={<ReloadOutlined />} onClick={refreshCaptcha} />} className="fa-captcha-demo-card">
      <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      <Form className="fa-captcha-login-form" form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="账号" name="account" rules={[{ required: true, message: '请输入账号' }]}>
          <Input autoComplete="username" placeholder="请输入账号" size="large" />
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password autoComplete="current-password" placeholder="请输入密码" size="large" />
        </Form.Item>
        <Form.Item initialValue={initialCaptchaValue} label="验证码" name="captcha" rules={[{ required: true, message: '请完成验证码' }]}>
          {children}
        </Form.Item>
        <Button block htmlType="submit" size="large" type="primary">
          登录（演示）
        </Button>
      </Form>
    </Card>
  );
}

function TextCaptchaLoginFormDemo() {
  const [challenge, setChallenge] = useState(createTextChallenge);
  return (
    <CaptchaLoginForm
      title="字符图片验证码表单"
      description="字符图片验证码作为表单字段，输入框与题图保持同高。"
      onRefreshChallenge={() => setChallenge(createTextChallenge())}
      validateCaptcha={(value) => typeof value === 'string' && value.trim().toUpperCase() === challenge.answer}
    >
      <TextImageCaptcha size="large" imageUrl={challenge.imageUrl} />
    </CaptchaLoginForm>
  );
}

function ArithmeticCaptchaLoginFormDemo() {
  const [challenge, setChallenge] = useState(createArithmeticChallenge);
  return (
    <CaptchaLoginForm
      title="算术验证码表单"
      description="算术题图片作为表单字段，提交时校验算式结果。"
      onRefreshChallenge={() => setChallenge(createArithmeticChallenge())}
      validateCaptcha={(value) => typeof value === 'string' && value.trim() === challenge.answer}
    >
      <ArithmeticCaptcha size="large" imageUrl={challenge.imageUrl} />
    </CaptchaLoginForm>
  );
}

function ImageSelectCaptchaLoginFormDemo() {
  const [challenge, setChallenge] = useState(createImageChallenge);
  return (
    <CaptchaLoginForm
      title="图片点选验证码表单"
      description="点选结果作为表单字段，需选中所有水果后提交。"
      initialCaptchaValue={[]}
      onRefreshChallenge={() => setChallenge(createImageChallenge())}
      validateCaptcha={(value) => {
        if (!Array.isArray(value)) return false;
        const selected = [...value].sort();
        const expected = [...challenge.answer].sort();
        return selected.length === expected.length && selected.every((id, index) => id === expected[index]);
      }}
    >
      <ImageSelectCaptcha instruction="请选择所有水果" items={challenge.items} />
    </CaptchaLoginForm>
  );
}

function SliderCaptchaLoginFormDemo() {
  const [challenge, setChallenge] = useState(createSliderChallenge);
  return (
    <CaptchaLoginForm
      title="滑块拼图验证码表单"
      description="拖动拼图块完成挑战，提交时校验拼图位置。"
      initialCaptchaValue={0}
      onRefreshChallenge={() => setChallenge(createSliderChallenge())}
      validateCaptcha={(value) => typeof value === 'number' && Math.abs(value - challenge.targetOffset) <= 6}
    >
      <SliderPuzzleCaptcha backgroundUrl={challenge.backgroundUrl} pieceUrl={challenge.pieceUrl} maxOffset={sliderMaxOffset} />
    </CaptchaLoginForm>
  );
}

export default function CaptchaDemo() {
  const [textChallenge, setTextChallenge] = useState(createTextChallenge);
  const [textValue, setTextValue] = useState('');
  const [arithmeticChallenge, setArithmeticChallenge] = useState(createArithmeticChallenge);
  const [arithmeticValue, setArithmeticValue] = useState('');
  const [imageChallenge, setImageChallenge] = useState(createImageChallenge);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [sliderChallenge, setSliderChallenge] = useState(createSliderChallenge);
  const [sliderValue, setSliderValue] = useState(0);

  function refreshText() {
    setTextChallenge(createTextChallenge());
    setTextValue('');
  }

  function refreshArithmetic() {
    setArithmeticChallenge(createArithmeticChallenge());
    setArithmeticValue('');
  }

  function refreshImages() {
    setImageChallenge(createImageChallenge());
    setSelectedImages([]);
  }

  function refreshSlider() {
    setSliderChallenge(createSliderChallenge());
    setSliderValue(0);
  }

  function showResult(isValid: boolean, refresh: () => void) {
    if (isValid) {
      message.success('验证通过');
      return;
    }
    message.error('验证未通过，已刷新题目');
    refresh();
  }

  function verifyText() {
    showResult(textValue.trim().toUpperCase() === textChallenge.answer, refreshText);
  }

  function verifyArithmetic() {
    showResult(arithmeticValue.trim() === arithmeticChallenge.answer, refreshArithmetic);
  }

  function verifyImages() {
    const selected = [...selectedImages].sort();
    const expected = [...imageChallenge.answer].sort();
    showResult(selected.length === expected.length && selected.every((id, index) => id === expected[index]), refreshImages);
  }

  function verifySlider() {
    showResult(Math.abs(sliderValue - sliderChallenge.targetOffset) <= 6, refreshSlider);
  }

  return (
    <div className="fa-full-content-p12">
      <Alert
        className="fa-mb12"
        title="这些组件负责验证码的展示和交互；本 Demo 使用本地模拟题目与校验。生产业务请由服务端生成并校验验证码。"
        type="info"
        showIcon
      />
      <Typography.Title level={4} className="fa-captcha-section-title">
        验证码组件展示
      </Typography.Title>
      <Typography.Paragraph type="secondary" className="fa-captcha-section-description">
        查看各验证码组件的独立展示与交互；表单集成示例展示它们在业务表单中的使用方式。
      </Typography.Paragraph>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <CaptchaDemoCard
            title="字符图片验证码"
            description="显示字符验证码图片，调用方控制题目刷新并校验输入。"
            extra={<Button aria-label="刷新字符验证码" icon={<ReloadOutlined />} onClick={refreshText} />}
          >
            <TextImageCaptcha imageUrl={textChallenge.imageUrl} value={textValue} onChange={setTextValue} />
            <Button className="fa-mt12" icon={<CheckOutlined />} type="primary" onClick={verifyText}>
              验证
            </Button>
          </CaptchaDemoCard>
        </Col>
        <Col xs={24} xl={12}>
          <CaptchaDemoCard
            title="算术验证码"
            description="将随机算式绘制为图片，组件收集答案，调用方负责刷新与校验。"
            extra={<Button aria-label="刷新算术验证码" icon={<ReloadOutlined />} onClick={refreshArithmetic} />}
          >
            <ArithmeticCaptcha imageUrl={arithmeticChallenge.imageUrl} value={arithmeticValue} onChange={setArithmeticValue} />
            <Button className="fa-mt12" icon={<CheckOutlined />} type="primary" onClick={verifyArithmetic}>
              验证
            </Button>
          </CaptchaDemoCard>
        </Col>
        <Col xs={24} xl={12}>
          <CaptchaDemoCard
            title="图片点选验证码"
            description="按提示点选所有符合条件的图片，组件通过选项 ID 报告结果。"
            extra={<Button aria-label="刷新图片点选验证码" icon={<ReloadOutlined />} onClick={refreshImages} />}
          >
            <ImageSelectCaptcha instruction="请选择所有水果" items={imageChallenge.items} value={selectedImages} onChange={setSelectedImages} />
            <Button className="fa-mt12" icon={<CheckOutlined />} type="primary" onClick={verifyImages}>
              验证
            </Button>
          </CaptchaDemoCard>
        </Col>
        <Col xs={24} xl={12}>
          <CaptchaDemoCard
            title="滑块拼图验证码"
            description="拖动滑块移动拼图块；支持键盘方向键，调用方判断位置是否匹配。"
            extra={<Button aria-label="刷新滑块验证码" icon={<ReloadOutlined />} onClick={refreshSlider} />}
          >
            <SliderPuzzleCaptcha
              backgroundUrl={sliderChallenge.backgroundUrl}
              pieceUrl={sliderChallenge.pieceUrl}
              maxOffset={sliderMaxOffset}
              value={sliderValue}
              onChange={setSliderValue}
            />
            <Space className="fa-mt12">
              <Button icon={<CheckOutlined />} type="primary" onClick={verifySlider}>
                验证
              </Button>
              <Typography.Text type="secondary">对齐缺口后提交</Typography.Text>
            </Space>
          </CaptchaDemoCard>
        </Col>
      </Row>
      <Typography.Title level={4} className="fa-captcha-section-title fa-captcha-section-title--spaced">
        登录表单集成示例
      </Typography.Title>
      <Typography.Paragraph type="secondary" className="fa-captcha-section-description">
        每种验证码各有一张独立表单，包含账号、密码、验证码字段与模拟提交校验。
      </Typography.Paragraph>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <TextCaptchaLoginFormDemo />
        </Col>
        <Col xs={24} xl={12}>
          <ArithmeticCaptchaLoginFormDemo />
        </Col>
        <Col xs={24} xl={12}>
          <ImageSelectCaptchaLoginFormDemo />
        </Col>
        <Col xs={24} xl={12}>
          <SliderCaptchaLoginFormDemo />
        </Col>
      </Row>
    </div>
  );
}
