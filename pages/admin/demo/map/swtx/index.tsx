import React, { useState, useEffect, useRef, useMemo } from 'react';

// 全局标记：确保SDK只加载一次
let isSdkLoaded = false;
let globalMapInstance: any = null; // 全局地图实例

// 地图配置接口
interface MapConfig {
  baseUrl: string;
  accessToken: string;
  solution: string;
  styleUrl: string;
  center: [number, number];
  zoom: number; // 提高初始缩放级别
}

// 点数据接口
interface PointData {
  id: string;
  coordinates: [number, number];
  name: string;
}

// 轨迹数据接口
interface TrackData {
  id: string;
  coordinates: [number, number][];
  name: string;
}

const Index: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const debugLogRef = useRef<string[]>([]);

  // 地图基础配置
  const mapConfig = useMemo<MapConfig>(() => ({
    baseUrl: 'https://znjt.suzhou.gov.cn',
    accessToken: '25cc55a69ea7422182d00d6b7c0ffa93',
    solution: '2365',
    styleUrl: 'https://znjt.suzhou.gov.cn/service/solu/style/id/2365',
    center: [120.61, 31.69],
    zoom: 12, // 核心修改：提高初始缩放级别，让地图加载时更大
  }), []);

  // 模拟点数据
  const pointData: PointData[] = [
    { id: 'p1', coordinates: [120.61, 31.69], name: '起点' },
    { id: 'p2', coordinates: [120.7, 31.72], name: '途经点A' },
    { id: 'p3', coordinates: [120.78, 31.75], name: '途经点B' },
    { id: 'p4', coordinates: [120.85, 31.8], name: '终点' }
  ];

  // 模拟轨迹数据
  const trackData: TrackData = {
    id: 't1',
    coordinates: [
      [120.61, 31.69],
      [120.65, 31.7],
      [120.7, 31.72],
      [120.74, 31.73],
      [120.78, 31.75],
      [120.82, 31.78],
      [120.85, 31.8]
    ],
    name: '测试轨迹'
  };

  // 添加调试日志
  const addDebugLog = (log: string) => {
    const logMsg = `[${new Date().toLocaleTimeString()}] ${log}`;
    debugLogRef.current.push(logMsg);
    debugLogRef.current = debugLogRef.current.slice(-10);
    console.log(logMsg);
  };

  // 添加点标记
  const addPoints = () => {
    if (!globalMapInstance) return;

    // 清除已有点图层
    if (globalMapInstance.getSource('points-source')) {
      globalMapInstance.removeLayer('points-layer');
      globalMapInstance.removeSource('points-source');
    }

    // 创建点数据源
    globalMapInstance.addSource('points-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: pointData.map(point => ({
          type: 'Feature',
          id: point.id,
          geometry: { type: 'Point', coordinates: point.coordinates },
          properties: { name: point.name }
        }))
      }
    });

    // 添加点图层
    globalMapInstance.addLayer({
      id: 'points-layer',
      type: 'circle',
      source: 'points-source',
      paint: {
        'circle-radius': 8,
        'circle-color': '#FF5722',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    addDebugLog(`已添加${pointData.length}个点标记`);
  };

  // 添加轨迹线
  const addTrack = () => {
    if (!globalMapInstance) return;

    // 清除已有轨迹图层
    if (globalMapInstance.getSource('track-source')) {
      globalMapInstance.removeLayer('track-layer');
      globalMapInstance.removeSource('track-source');
    }

    // 创建轨迹数据源
    globalMapInstance.addSource('track-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          id: trackData.id,
          geometry: { type: 'LineString', coordinates: trackData.coordinates },
          properties: { name: trackData.name }
        }]
      }
    });

    // 添加轨迹图层
    globalMapInstance.addLayer({
      id: 'track-layer',
      type: 'line',
      source: 'track-source',
      paint: {
        'line-width': 4,
        'line-color': '#4285F4',
        'line-opacity': 0.8
      }
    });

    addDebugLog(`已添加轨迹：${trackData.name}`);
  };

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current) {
      setError('未找到地图容器');
      setIsLoading(false);
      return;
    }

    // 复用已有实例
    if (isSdkLoaded && globalMapInstance) {
      globalMapInstance.setContainer(mapRef.current);
      setIsLoading(false);
      // 复用实例时也自动加载点和轨迹
      addPoints();
      addTrack();
      return;
    }

    // 加载SDK
    addDebugLog('加载地图SDK');
    const scriptId = 'minemap-sdk-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `${mapConfig.baseUrl}/minemapapi/v2.0.0/minemap.js`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // SDK加载成功处理
    const handleSdkLoad = () => {
      const minemap = (window as any).minemap;
      if (!minemap) {
        setError('SDK加载不完整');
        setIsLoading(false);
        return;
      }

      try {
        // 配置全局参数
        minemap.domainUrl = mapConfig.baseUrl;
        minemap.dataDomainUrl = mapConfig.baseUrl;
        minemap.spriteUrl = `${mapConfig.baseUrl}/minemapapi/v2.0.0/sprite/sprite`;
        minemap.serviceUrl = `${mapConfig.baseUrl}/service/`;
        minemap.accessToken = mapConfig.accessToken;
        minemap.solution = mapConfig.solution;

        // 创建地图实例
        if (!globalMapInstance) {
          globalMapInstance = new minemap.Map({
            container: mapRef.current,
            style: mapConfig.styleUrl,
            center: mapConfig.center,
            zoom: mapConfig.zoom, // 使用配置中的高缩放级别
            pitch: 0,
            attributionControl: false,
          });

          // 地图加载完成后自动添加点和轨迹
          globalMapInstance.on('load', () => {
            addDebugLog('地图加载完成，自动添加点和轨迹');
            isSdkLoaded = true;
            setIsLoading(false);
            // 地图加载完成后立即调用添加点和轨迹的方法
            addPoints();
            addTrack();
          });

          // 错误处理
          globalMapInstance.on('error', (err: any) => {
            setError(`地图错误：${err.message}`);
            setIsLoading(false);
          });
        }

      } catch (err) {
        setError(`初始化失败：${(err as Error).message}`);
        setIsLoading(false);
      }
    };

    // 绑定加载事件
    if (script.readyState) {
      script.onreadystatechange = () => {
        if (script.readyState === 'loaded' || script.readyState === 'complete') {
          script.onreadystatechange = null;
          handleSdkLoad();
        }
      };
    } else {
      script.onload = handleSdkLoad;
    }

    // 加载失败处理
    script.onerror = () => {
      setError(`SDK加载失败：${script.src}`);
      setIsLoading(false);
    };

    // 组件卸载清理
    return () => {
      if (globalMapInstance) {
        globalMapInstance.remove();
        globalMapInstance = null;
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      isSdkLoaded = false;
      debugLogRef.current = [];
    };

  }, [mapConfig]);

  // 显示调试日志
  const showDebugLogs = () => {
    alert(`调试日志：\n\n${debugLogRef.current.join('\n')}`);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
    }}>
      {/* 加载中提示 */}
      {isLoading && !error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ width: '40px', height: '40px', margin: '0 auto', border: '4px solid #4285F4', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p>地图加载中...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          color: '#fff',
          backgroundColor: 'rgba(255,0,0,0.9)',
          padding: '12px 16px',
          borderRadius: '4px',
        }}>
          {error}
          <button onClick={showDebugLogs} style={{ marginTop: '8px' }}>查看日志</button>
        </div>
      )}

      {/* 地图容器：确保初始就占满全屏 */}
      <div
        ref={mapRef}
        id="map-container"
        style={{
          width: '100%',
          height: '100%',
          display: 'block', // 始终显示容器，避免加载时尺寸异常
        }}
      ></div>

      {/* 功能按钮 */}
      {!isLoading && !error && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <button
            onClick={addPoints}
            style={{ padding: '8px 12px', cursor: 'pointer' }}
          >
            重新添加点标记
          </button>
          <button
            onClick={addTrack}
            style={{ padding: '8px 12px', cursor: 'pointer' }}
          >
            重新添加轨迹
          </button>
          <button
            onClick={showDebugLogs}
            style={{ padding: '8px 12px', cursor: 'pointer' }}
          >
            调试日志
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
