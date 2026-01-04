import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RDBSource } from 'district-data';
import { useNavigate } from 'react-router-dom';

const VITE_APP_MAPBOX_KEY = import.meta.env.VITE_APP_MAPBOX_KEY;

type factoryInfo = {
  id: number,
  name: string,
  longitude: number,
  latitude: number,
  type: 'WIND' | 'SUN'
};

const DatavMapBoxWith3DModelDemo = () => {
  const navigate = useNavigate()

  const mapContainerRef = useRef(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [countryData, setCountryData] = useState<any>(null);
  const [provinceData, setProvinceData] = useState<any>(null);

  const [factoryArr, setFactoryArr] = useState<factoryInfo[]>([]);
  const [windFacGeojson, setWindFacGeojson] = useState<any>(null);
  const [pvFacGeojson, setPvFacGeojson] = useState<any>(null);

  useEffect(() => {
    const source = new RDBSource({});
    source.getData({ level: 'country' }).then((data) => {
      setCountryData(data);
    });
    source.getData({ level: 'province' }).then((data) => {
      setProvinceData(data);
    });
  }, []);

  useEffect(() => {
    const facData: factoryInfo[] = [
      { id: 1, name: '风力场站1', longitude: 92.08, latitude: 42.74, type: 'WIND' },
      { id: 6, name: '风力场站2', longitude: 119.5, latitude: 26.5, type: 'WIND' },
      { id: 4, name: '光伏电站1', longitude: 93.08, latitude: 40.7, type: 'SUN' },
      { id: 5, name: '光伏电站2', longitude: 94.08, latitude: 39.7, type: 'SUN' },
      { id: 7, name: '光伏电站3', longitude: 115.08, latitude: 28.7, type: 'SUN' },
    ];

    const convertToGeoJson = (factories: factoryInfo[]) => {
      return {
        type: 'FeatureCollection',
        features: factories.map(f => ({
          id: f.id,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [f.longitude, f.latitude]
          },
          properties: {
            name: f.name
          }
        }))
      }
    };

    setWindFacGeojson(convertToGeoJson(facData.filter(f => f.type === 'WIND')));
    setPvFacGeojson(convertToGeoJson(facData.filter(f => f.type === 'SUN')));
    setFactoryArr(facData);
  }, []);


  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapboxgl.accessToken = VITE_APP_MAPBOX_KEY;

    const style = {
      version: 8,
      imports: [
        {
          id: 'basemap',
          url: 'mapbox://styles/mapbox/dark-v11',
        }
      ],
      sources: {
        // 3D模型位置数据源
        'wind-fan-source': {
          type: 'geojson',
          data: windFacGeojson
        },
        'solar-panel-source': {
          type: 'geojson',
          data: pvFacGeojson
        },
        // 国家边界数据源
        'country-source': {
          type: 'geojson',
          data: countryData
        },
        // 省份边界数据源
        'province-source': {
          type: 'geojson',
          data: provinceData
        }
      },
      models: {
        // 风机，太阳能板模型
        'wind-fan': '/file/datavModels/wind_fan.glb',
        'solar-panel': '/file/datavModels/solar_panel.glb'
      },
      layers: [
        // 国家边界图层
        {
          id: 'country-fill',
          type: 'fill',
          source: 'country-source',
          paint: {
            'fill-color': '#2DF3ED',
            'fill-opacity': 0.1,
          }
        },
        {
          id: 'country-outline',
          type: 'line',
          source: 'country-source',
          paint: {
            'line-color': '#2DF3ED',
            'line-width': 2,
          }
        },
        // 省份边界图层
        {
          id: 'province-outline',
          type: 'line',
          source: 'province-source',
          paint: {
            'line-color': '#2AD6DD',
            'line-width': 0.5,
          }
        },
        {
          id: 'province-label',
          type: 'symbol',
          source: 'province-source',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 10,
            'text-offset': [0, 0],
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#918e8e',
            'text-halo-color': '#000',
            'text-halo-width': 0.8,
          }
        },
        // 3D模型图层
        {
          type: 'model',
          source: 'wind-fan-source',
          paint: {
            'model-scale': [50000, 50000, 50000],
            'model-rotation': [0, 0, 0]
          },
          id: 'wind-fan-models',
          layout: {
            'model-id': 'wind-fan'
          }
        },
        {
          type: 'model',
          source: 'solar-panel-source',
          paint: {
            'model-scale': [30000, 30000, 30000],
            'model-rotation': [0, 0, 0]
          },
          id: 'solar-panel-models',
          layout: {
            'model-id': 'solar-panel'
          }
        },
      ]
    } as any;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      projection: 'globe',
      style: style,
      center: [108, 31],
      zoom: 3.4,
      bearing: -10,
      pitch: 40
    });

    // 清理函数
    return () => {
      // 清理 markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 添加 Markers 和 Popup
  useEffect(() => {
    if (!mapRef.current || !factoryArr.length) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    factoryArr.forEach((fac) => {
      const icon = fac.type === 'WIND'
        ? '/file/image/datav/map/icon1.png'
        : '/file/image/datav/map/icon2.png';

      const el = document.createElement('div');
      el.style.cssText = `
        background-image: url(${icon});
        background-size: cover;
        width: 17px;
        height: 25px;
        cursor: pointer;
      `;

      // 脉冲动画元素
      const pulseEl = document.createElement('div');
      pulseEl.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(0, 240, 255, 0.4);
        animation: pulse 2s infinite;
        pointer-events: none;
      `;

      el.appendChild(pulseEl);

      // Popup格式
      const popupContent = document.createElement('div');
      popupContent.style.cssText = 'padding: 10px; min-width: 150px;';
      popupContent.innerHTML = `
          <h4 style="margin: 0 0 8px 0; cursor: pointer;" class="factory-title">${fac.name}</h4>
          <p style="margin: 0; font-size: 12px;">经度: ${fac.longitude.toFixed(2)}</p>
          <p style="margin: 0; font-size: 12px;">纬度: ${fac.latitude.toFixed(2)}</p>
        `;
      // 添加标题点击事件
      const titleEl = popupContent.querySelector('.factory-title');
      if (titleEl) {
        titleEl.addEventListener('click', () => {
          handleJumpToFactory(fac);
        });
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([fac.longitude, fac.latitude])
        .setPopup(
          new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            anchor: 'top',
          }).setDOMContent(popupContent)
        )
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });

    // 添加脉冲动画的 CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0.8;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.2);
          opacity: 0.4;
        }
        100% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0.8;
        }
      }
    `;
    if (!document.querySelector('style[data-pulse-animation]')) {
      style.setAttribute('data-pulse-animation', 'true');
      document.head.appendChild(style);
    }
  }, [factoryArr]);

  // 数据更新
  useEffect(() => {
    updateMapSource(windFacGeojson, 'wind-fan-source');
  }, [windFacGeojson]);

  useEffect(() => {
    updateMapSource(pvFacGeojson, 'solar-panel-source');
  }, [pvFacGeojson]);

  useEffect(() => {
    updateMapSource(countryData, 'country-source');
  }, [countryData]);

  useEffect(() => {
    updateMapSource(provinceData, 'province-source');
  }, [provinceData]);

  function handleJumpToFactory(fac: factoryInfo) {
    navigate(`/in/gn/datav/factory/${fac.id}`)
  }

  const updateMapSource = (newData: any, sourceName: string) => {
    if (!mapRef.current || !newData) return;

    const updateSource = () => {
      const source = mapRef.current.getSource(sourceName);
      if (source) {
        source.setData(newData);
      }
    };

    mapRef.current.on('load', () => updateSource());

    if (mapRef.current.isStyleLoaded()) {
      updateSource();
    }

    //console.log('update: ' + sourceName);
  }

  return (
    <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default DatavMapBoxWith3DModelDemo;