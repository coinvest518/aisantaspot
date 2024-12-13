import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";

const LiveCounter = () => {
  const [potAmount, setPotAmount] = useState(9764893);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPotAmount(prev => prev + Math.floor(Math.random() * 100));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-white/90 rounded-lg p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-center mb-4">Live Pot Amount</h3>
      <div className="text-4xl font-bold text-center text-primary mb-4">
        ${potAmount.toLocaleString()}
      </div>
      <Progress value={75} className="h-2" />
      <p className="text-sm text-center mt-2 text-gray-600">
        Growing every minute! Join now to participate
      </p>
    </div>
  );
};

export default LiveCounter;