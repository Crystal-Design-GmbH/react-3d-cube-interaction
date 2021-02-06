import React from 'react';

interface Props {}

import './index.css';

const SimpleCube = (props: Props) => {
  return (
    <div className="scene">
      <div className="cube is-spinning">
        <div className="cube__face cube__face--front">front</div>
        <div className="cube__face cube__face--back">back</div>
        <div className="cube__face cube__face--right">right</div>
        <div className="cube__face cube__face--left">left</div>
        <div className="cube__face cube__face--top">top</div>
        <div className="cube__face cube__face--bottom">bottom</div>
      </div>
    </div>
  );
};

export default SimpleCube;
