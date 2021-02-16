import React, { useState } from 'react';
import OrbitInteractions, { ControlElementRotation } from 'react-3d-cube';

interface Props {}

import { cubeFaceLeft, cubeFaceRight, orbitContainer } from './app.module.css';

const App = ({}: Props) => {
  const [rot, setRot] = useState<ControlElementRotation>({
    rotX: 0,
    rotY: 0,
  });

  const [zoom, setZoom] = useState<number>(0);

  return (
    <div>
      <div>
        <p>X: {rot.rotX}°</p>
        <p>Y: {rot.rotY}°</p>
        <p>Zoom: {zoom}</p>
      </div>
      <div className={orbitContainer}>
        <OrbitInteractions
          onRotationChange={setRot}
          onZoomChange={setZoom}
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
