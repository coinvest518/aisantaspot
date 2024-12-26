import { useEffect, useState } from 'react';

const DrawTimer = () => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const calculateTimeLeft = () => {
    // Set the next draw date to January 1st, 2025
    const drawDate = new Date('2025-01-01T00:00:00Z');
    const now = new Date();
    const difference = drawDate.getTime() - now.getTime();

    // If the draw date has passed, set next draw to January 20th, 2025
    if (difference < 0) {
      const fallbackDate = new Date('2025-01-20T00:00:00Z');
      const fallbackDifference = fallbackDate.getTime() - now.getTime();

      return {
        days: Math.floor(fallbackDifference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((fallbackDifference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((fallbackDifference / 1000 / 60) % 60),
        seconds: Math.floor((fallbackDifference / 1000) % 60)
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-center mb-4">Next Pot Draw In:</h3>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{timeLeft.days}</div>
          <div className="text-sm text-gray-600">Days</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{timeLeft.hours}</div>
          <div className="text-sm text-gray-600">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{timeLeft.minutes}</div>
          <div className="text-sm text-gray-600">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{timeLeft.seconds}</div>
          <div className="text-sm text-gray-600">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default DrawTimer;