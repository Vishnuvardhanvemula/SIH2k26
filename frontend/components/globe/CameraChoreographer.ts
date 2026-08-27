/**
 * CameraChoreographer — non-visual class owning the Surface→Cutaway→Dive
 * camera easing sequence (~1.2s). Respects prefers-reduced-motion.
 */
export type CameraMode = 'surface' | 'cutaway' | 'dive';

interface CameraConfig {
  lon: number;
  lat: number;
  altitudeSurface?: number;
  altitudeCutaway?: number;
  altitudeDive?: number;
}

export class CameraChoreographer {
  private viewer: unknown;
  private reducedMotion: boolean;

  constructor(viewer: unknown) {
    this.viewer = viewer;
    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  async transitionTo(
    mode: CameraMode,
    config: CameraConfig = { lon: 80, lat: 10 }
  ): Promise<void> {
    const { lon, lat } = config;
    const duration = this.reducedMotion ? 0 : 1.2;

    return import('cesium').then((Cesium) => {
      const viewer = this.viewer as {
        camera: {
          flyTo: (opts: unknown) => void;
          setView: (opts: unknown) => void;
        };
        scene: { fog: { density: number }; requestRender: () => void };
      };

      switch (mode) {
        case 'surface':
          if (this.reducedMotion) {
            viewer.camera.setView({
              destination: Cesium.Cartesian3.fromDegrees(lon, lat, 6000000),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-90),
                roll: 0,
              },
            });
          } else {
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(lon, lat, 6000000),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-90),
                roll: 0,
              },
              duration,
              easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
            });
          }
          viewer.scene.fog.density = 0.0001;
          break;

        case 'cutaway':
          if (this.reducedMotion) {
            viewer.camera.setView({
              destination: Cesium.Cartesian3.fromDegrees(lon, lat - 5, 2000000),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0,
              },
            });
          } else {
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(lon, lat - 5, 2000000),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0,
              },
              duration,
              easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
            });
          }
          viewer.scene.fog.density = 0.0003;
          break;

        case 'dive': {
          const altitude = 700_000;
          const pitchRad = Cesium.Math.toRadians(-50);
          const groundDist = altitude / Math.tan(Math.abs(pitchRad));
          const latOffset = groundDist / 111320;
          const cameraLat = lat - latOffset;

          if (this.reducedMotion) {
            viewer.camera.setView({
              destination: Cesium.Cartesian3.fromDegrees(lon, cameraLat, altitude), 
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: pitchRad,
                roll: 0,
              },
            });
          } else {
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(lon, cameraLat, altitude),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: pitchRad,
                roll: 0,
              },
              duration,
              easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
            });
          }
          viewer.scene.fog.density = 0.0002;
          break;
        }
      }

      viewer.scene.requestRender?.();
    });
  }

  flyToFloat(lat: number, lon: number, altitudeM?: number): void {
    const duration = this.reducedMotion ? 0 : 1.5;
    const altitude = altitudeM ?? 1_200_000;

    import('cesium').then((Cesium) => {
      // Calculate how far South to place the camera so it looks exactly at (lat, lon)
      // With a -45 degree pitch, the ground distance to the focal point equals the altitude.
      // 1 degree of latitude is roughly 111,320 meters.
      const latOffset = altitude / 111320;
      const cameraLat = lat - latOffset;

      const viewer = this.viewer as {
        camera: { flyTo: (opts: unknown) => void };
      };
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, cameraLat, altitude),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0,
        },
        duration,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      });
    });
  }

  resetToIndianOcean(): void {
    import('cesium').then((Cesium) => {
      const viewer = this.viewer as {
        camera: { flyTo: (opts: unknown) => void };
      };
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(80, 10, 8000000),
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
        duration: this.reducedMotion ? 0 : 1.5,
      });
    });
  }
}
