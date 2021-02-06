import React from 'react';
import OrbitInteractions from 'orbit-interactions';

interface Props {}

import { cubeFaceLeft, cubeFaceRight, orbitContainer } from './app.module.css';

const App = ({}: Props) => {
  return (
    <div className={orbitContainer}>
      <OrbitInteractions
        onRotationChange={(newRot) => {
          console.log('rotation change', newRot);
        }}
        onZoomChange={(newZoom) => {
          console.log('zoom change', newZoom);
        }}
        interactionElement={document.body}
        classnames={{
          cubeFaceLeft,
          cubeFaceRight,
        }}
      />
    </div>
  );
};

export default App;
