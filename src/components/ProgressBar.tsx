// components/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="bg-blue-600 h-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;