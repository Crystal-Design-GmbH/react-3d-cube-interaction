import React from 'react';
import OrbitInteractions from 'orbit-interactions';

interface Props {}

import './index.css';

const App = ({}: Props) => {
  return (
    <div className="orbit-container">
      <OrbitInteractions
        onRotationChange={(newRot) => {
          console.log('rotation change', newRot);
        }}
        onZoomChange={(newZoom) => {
          console.log('zoom change', newZoom);
        }}
        interactionElement={document.body}
      />
    </div>
  );
};

export default App;
