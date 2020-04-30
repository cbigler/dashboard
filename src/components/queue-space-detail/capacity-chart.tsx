import React from 'react';


const CapacityChart: React.FunctionComponent<{
  outerRadius: number,
  outerBorderWidth: number,
  percentFull: number,
  color: string,
}> = ({
  outerRadius,
  outerBorderWidth,
  percentFull,
  color,
}) => {
  return (
    <div style={{
      width: outerRadius,
      height: outerRadius,
      marginRight: 12,
      borderRadius: '50%',
      border: `${outerBorderWidth}px solid ${color}`,
    }}
    >
      <div style={{
        width: outerRadius - outerBorderWidth * 2,
        height: outerRadius - outerBorderWidth * 2,
        position: 'relative',
        left: outerBorderWidth,
        top: outerBorderWidth,
        borderRadius: '50%',
        overflow: 'hidden',
      }}
      >
        <div style={{
          backgroundColor: color,
          width: '100%',
          height: '100%',
          position: 'relative',
          top: `${100 - percentFull}%`,
        }}></div>
      </div>
    </div>
  );
};

export default CapacityChart;