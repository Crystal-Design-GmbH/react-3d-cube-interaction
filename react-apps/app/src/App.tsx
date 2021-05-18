import React, { useRef, useState } from 'react';
import OrbitInteractions, {
  CubeControlApi,
  CubeRotation,
  CubeZoom,
} from 'react-3d-cube-interaction';

interface Props {}

import {
  cubeFaceLeft,
  cubeFaceRight,
  orbitContainer,
  mainContainer,
} from './app.module.css';

const App = ({}: Props) => {
  const [rot, setRot] = useState<CubeRotation>({
    rotX: 0,
    rotY: 0,
    horizontal: 0,
    vertical: 0,
  });

  const [containerElem, setContainerElem] = useState<HTMLDivElement>();

  const [zoom, setZoom] = useState<CubeZoom>();

  function onZoomChange(newZoom: CubeZoom) {
    setZoom(newZoom);
  }

  const cubeApiRef = useRef<CubeControlApi>(null);

  return (
    <div
      className={mainContainer}
      ref={(ref) => {
        if (ref) {
          setContainerElem(ref);
        }
      }}
    >
      <div>
        <p>X: {rot.rotX}°</p>
        <p>Y: {rot.rotY}°</p>
        <p>Horizontal: {rot.horizontal}°</p>
        <p>Vetical: {rot.vertical}°</p>
        <p>Zoom: {zoom?.absoluteZoom}</p>
        <p>Zoom center: {JSON.stringify(zoom?.zoomCenter)}</p>
        <button
          onClick={() => {
            cubeApiRef.current?.rotateTo({
              rotX: 0,
              rotY: 0,
              smooth: true,
            });
          }}
        >
          Rotate to 0°
        </button>
        <button
          onClick={() => {
            cubeApiRef.current?.rotateTo({
              rotX: 0,
              rotY: 45,
              smooth: true,
            });
          }}
        >
          Rotate to 0°/45°
        </button>
        <button
          onClick={() => {
            cubeApiRef.current?.rotateTo({
              rotX: 45,
              rotY: 45,
              smooth: true,
            });
          }}
        >
          Rotate to 45°/45°
        </button>
        <button
          onClick={() => {
            cubeApiRef.current?.setZoom(1);
          }}
        >
          Set zoom to 1
        </button>
      </div>
      <div className={orbitContainer}>
        <OrbitInteractions
          onRotationChange={setRot}
          onZoomChange={onZoomChange}
          interactionElement={containerElem}
          zoomFactorResetDelay={500}
          classnames={{
            cubeFaceLeft,
            cubeFaceRight,
          }}
          size="80px"
          initialRotation={{
            horizontal: 20,
            vertical: 20,
          }}
          ref={cubeApiRef}
          autoHide={2000}
          maxCssScale={2}
          minCssScale={0.5}
        />
      </div>
    </div>
  );
};

export default App;
