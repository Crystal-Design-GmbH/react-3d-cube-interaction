import React, { useRef, useState } from 'react';
import OrbitInteractions, {
  CubeControlApi,
  CubeRotation,
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

  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState<number>(0);

  const cubeApiRef = useRef<CubeControlApi>(null);

  return (
    <div className={mainContainer} ref={containerRef}>
      <div>
        <p>X: {rot.rotX}°</p>
        <p>Y: {rot.rotY}°</p>
        <p>Horizontal: {rot.horizontal}°</p>
        <p>Vetical: {rot.vertical}°</p>
        <p>Zoom: {zoom}</p>
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
      </div>
      <div className={orbitContainer}>
        <OrbitInteractions
          onRotationChange={setRot}
          // onZoomChange={setZoom}
          interactionElement={document.body}
          classnames={{
            cubeFaceLeft,
            cubeFaceRight,
          }}
          size="120px"
          initialRotation={{
            rotY: 20,
            rotX: -20,
          }}
          ref={cubeApiRef}
          autoHide={2000}
        />
      </div>
    </div>
  );
};

export default App;
