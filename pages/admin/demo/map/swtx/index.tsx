import React, { useState, useEffect, useRef } from 'react';

// 模拟轨迹数据生成函数
const generateTrackData = (points = 50) => {
  return Array.from({ length: points }, (_, i) => ({
    id: i,
    lng: 116.3 + (i * 0.01) + (Math.random() - 0.5) * 0.02,
    lat: 39.9 + (i * 0.008) + (Math.random() - 0.5) * 0.02,
    speed: 30 + Math.random() * 40,
    time: new Date(Date.now() - (points - i) * 10000).toISOString()
  }));
};

const SimpleTrackingDemo = () => {
  // 地图与轨迹状态
  const mapRef = useRef(null);
  const mapContainer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [trackData, setTrackData] = useState([]);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  // 定时器引用
  const playbackTimer = useRef(null);

  // 初始化地图
  useEffect(() => {
    // 加载地图SDK
    const loadMapScript = () => {
      if (window.SMap) {
        initMap();
        return;
      }
      const script = document.createElement('script');
      //ak秘钥
      script.src = 'https://map.bdstar.com/api/js?v=3.0&ak=sf9e8fa15733897f0faa943c28def94fa4';
      script.onload = initMap;
      script.onerror = () => alert('地图加载失败，请检查AK配置');
      document.body.appendChild(script);

      return () => document.body.removeChild(script);
    };

    // 初始化地图实例
    const initMap = () => {
      if (!mapContainer.current || !window.SMap) return;

      const map = new window.SMap(mapContainer.current, {
        center: new window.SMap.LngLat(116.4, 39.9),
        zoom: 12
      });

      // 添加地图图层
      const layer = new window.SMap.TileLayer.Road();
      map.addLayer(layer);

      mapRef.current = map;
      setMapLoaded(true);

      // 生成并加载轨迹数据
      const data = generateTrackData(80);
      setTrackData(data);
      setCurrentPoint(data[0]);
      drawTrackLine(data);
    };

    const cleanup = loadMapScript();
    return cleanup;
  }, []);

  // 绘制轨迹线
  const drawTrackLine = (points) => {
    if (!mapRef.current || points.length < 2) return;

    // 转换坐标点
    const path = points.map(p => new window.SMap.LngLat(p.lng, p.lat));

    // 创建轨迹线
    const line = new window.SMap.Polyline(path, {
      style: new window.SMap.PolylineStyle({
        strokeColor: '#3498db',
        strokeWidth: 4,
        strokeOpacity: 0.8
      })
    });

    mapRef.current.addOverlay(line);
    mapRef.current.setViewport(path); // 调整视野以显示全部轨迹
  };

  // 更新当前位置标记
  const updateCurrentMarker = (point) => {
    if (!mapRef.current || !point) return;

    // 清除现有标记
    if (window.currentMarker) {
      mapRef.current.removeOverlay(window.currentMarker);
    }

    // 创建新标记
    const marker = new window.SMap.Marker(
      new window.SMap.LngLat(point.lng, point.lat),
      {
        icon: new window.SMap.Icon(
          `<div style="width:24px;height:24px;background:#e74c3c;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white">
            <i class="fa fa-car"></i>
          </div>`,
          new window.SMap.Size(24, 24),
          new window.SMap.Pixel(-12, -12)
        )
      }
    );

    mapRef.current.addOverlay(marker);
    window.currentMarker = marker;
    mapRef.current.setCenter(new window.SMap.LngLat(point.lng, point.lat));
  };

  // 轨迹回放控制
  const togglePlayback = () => {
    if (!trackData.length) return;

    if (isPlaying) {
      // 暂停回放
      setIsPlaying(false);
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
      }
    } else {
      // 开始回放
      setIsPlaying(true);
      playbackTimer.current = setInterval(() => {
        setProgress(prev => {
          // 到达终点时停止
          if (prev >= trackData.length - 1) {
            setIsPlaying(false);
            clearInterval(playbackTimer.current);
            return trackData.length - 1;
          }

          const next = prev + 1;
          const point = trackData[next];
          setCurrentPoint(point);
          updateCurrentMarker(point);
          return next;
        });
      }, 1000 / speed); // 速度控制
    }
  };

  // 重置回放
  const resetPlayback = () => {
    setIsPlaying(false);
    if (playbackTimer.current) {
      clearInterval(playbackTimer.current);
    }
    setProgress(0);
    if (trackData.length) {
      setCurrentPoint(trackData[0]);
      updateCurrentMarker(trackData[0]);
    }
  };

  // 进度条控制
  const handleProgressChange = (e) => {
    const value = parseInt(e.target.value);
    setProgress(value);
    const point = trackData[value];
    setCurrentPoint(point);
    updateCurrentMarker(point);
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 标题栏 */}
      <div style={{ padding: '1rem', background: '#2c3e50', color: 'white' }}>
        <h2 style={{ margin: 0 }}>轨迹追踪与回放演示</h2>
      </div>

      {/* 地图容器 */}
      <div ref={mapContainer} style={{ flex: 1, width: '100%' }}>
        {!mapLoaded && (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5'
          }}>
            地图加载中...
          </div>
        )}
      </div>

      {/* 控制栏 */}
      <div style={{
        padding: '1rem',
        background: 'white',
        borderTop: '1px solid #eee'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>回放控制</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={togglePlayback}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                background: '#3498db',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {isPlaying ? '暂停' : '播放'}
            </button>
            <button
              onClick={resetPlayback}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                background: '#e74c3c',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              重置
            </button>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1rem' }}>
              <span style={{ marginRight: '0.5rem' }}>速度: {speed}x</span>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                style={{ width: '100px' }}
              />
            </div>
          </div>

          {/* 进度条 */}
          <div>
            <input
              type="range"
              min="0"
              max={trackData.length - 1 || 0}
              value={progress}
              onChange={handleProgressChange}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
              <span>进度: {progress + 1}/{trackData.length}</span>
              {currentPoint && (
                <span>
                  位置: {currentPoint.lng.toFixed(6)},{currentPoint.lat.toFixed(6)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div style={{ fontSize: '0.9rem', color: '#666', paddingTop: '0.5rem', borderTop: '1px dashed #eee' }}>
          <p>功能: 轨迹连接显示、轨迹回放(播放/暂停/重置)、速度调节、实时位置追踪</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTrackingDemo;
