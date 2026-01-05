import { useEffect, memo } from 'react';
import { useMap } from 'react-map-gl/mapbox';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import mapboxgl from 'mapbox-gl';

interface ThreeCustomLayer extends mapboxgl.CustomLayerInterface {
  camera: THREE.Camera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  model?: THREE.Group | THREE.Object3D;
  map?: mapboxgl.Map;
}

interface ThreeDModelProps {
  id: string;
  modelUrl: string;
  coordinates: [number, number];
  altitude?: number;
  scale?: number;
  rotation?: [number, number, number];
}

function ThreeDModelComponent({ id, modelUrl, coordinates, altitude = 0, scale = 1, rotation = [0, 0, 0] }: ThreeDModelProps) {
  const mapRef = useMap();

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
      coordinates,
      altitude
    );

    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: rotation[0],
      rotateY: rotation[1],
      rotateZ: rotation[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * scale
    };

    const customLayer: ThreeCustomLayer = {
      id: id,
      type: 'custom',
      renderingMode: '3d',
      camera: new THREE.Camera(),
      scene: new THREE.Scene(),
      renderer: null as any,

      onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
        // 添加平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0);
        directionalLight.position.set(100, 100, 100).normalize();
        this.scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 3.8);
        directionalLight2.position.set(-100, -100, -100).normalize();
        this.scene.add(directionalLight2);

        // 加载模型
        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          (gltf) => {
            this.model = gltf.scene || gltf.scenes[0];
            this.scene.add(this.model);
            map.triggerRepaint();
          },
          undefined,
          undefined
        );

        this.map = map;
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true
        });

        this.renderer.autoClear = false;
      },

      render(gl: WebGLRenderingContext, matrix: number[]) {
        if (!this.model) return;

        // 地图比例尺过小时不渲染模型
        const currentZoom = this.map!.getZoom();
        if (currentZoom < 4) {
          return;
        }

        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );

        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map!.triggerRepaint();
      }
    };

    const handleLoad = () => {
      if (!map.getLayer(id)) {
        map.addLayer(customLayer as any);
      } else {
        map.removeLayer(id);
        map.addLayer(customLayer as any);
      }
    };

    if (map.isStyleLoaded()) {
      handleLoad();
    } else {
      map.on('load', handleLoad);
    }

    return () => {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
    };
  });

  return null;
}

export default memo(ThreeDModelComponent, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.modelUrl === nextProps.modelUrl &&
    prevProps.coordinates[0] === nextProps.coordinates[0] &&
    prevProps.coordinates[1] === nextProps.coordinates[1] &&
    prevProps.altitude === nextProps.altitude &&
    prevProps.scale === nextProps.scale &&
    (!prevProps.rotation || !nextProps.rotation || prevProps.rotation[0] === nextProps.rotation[0]) &&
    (!prevProps.rotation || !nextProps.rotation || prevProps.rotation[1] === nextProps.rotation[1]) &&
    (!prevProps.rotation || !nextProps.rotation || prevProps.rotation[2] === nextProps.rotation[2]) 
  );
});