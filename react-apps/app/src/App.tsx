import React, { useState } from 'react';
import OrbitInteractions, { CubeRotation } from 'react-3d-cube-interaction';

interface Props {}

import { cubeFaceLeft, cubeFaceRight, orbitContainer } from './app.module.css';

const App = ({}: Props) => {
  const [rot, setRot] = useState<CubeRotation>({
    rotX: 0,
    rotY: 0,
    horizontal: 0,
    vertical: 0,
  });

  const [zoom, setZoom] = useState<number>(0);

  return (
    <div>
      <div>
        <p>X: {rot.rotX}°</p>
        <p>Y: {rot.rotY}°</p>
        <p>Horizontal: {rot.horizontal}°</p>
        <p>Vetical: {rot.vertical}°</p>
        <p>Zoom: {zoom}</p>
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
        />
      </div>
    </div>
  );
};

export default App;
