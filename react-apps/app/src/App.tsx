import React, { useState } from 'react';
import OrbitInteractions, { ControlElementRotation } from 'orbit-interactions';

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
          size="100px"
        />
      </div>
    </div>
  );
};

export default App;
