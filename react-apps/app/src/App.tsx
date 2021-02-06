import React from 'react';
import OrbitInteractions from 'orbit-interactions';

interface Props {}

import './index.css';

const App = (props: Props) => {
  return (
    <div className="orbit-container">
      <OrbitInteractions interactionElement={document.body} />
    </div>
  );
};

export default App;
