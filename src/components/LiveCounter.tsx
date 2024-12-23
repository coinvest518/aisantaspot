import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const LiveCounter: React.FC = () => {
  const [counter, setCounter] = useState<number | null>(null);
  const [localCounter, setLocalCounter] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const incrementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCounter = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('pot')
        .select('current_amount')
        .eq('id', 1)
        .single();

      if (error) throw error;

      setCounter(data.current_amount);
    } catch (err) {
      console.error('Error fetching counter:', err);
      setError('Failed to fetch the counter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSupabasePot = async () => {
    if (counter === null) return;

    try {
      const { error } = await supabase
        .from('pot')
        .update({ current_amount: counter + localCounter })
        .eq('id', 1);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating pot:', err);
    }
  };

  useEffect(() => {
    // Load the counter from localStorage on mount
    const storedCounter = localStorage.getItem('localCounter');
    if (storedCounter) {
      setLocalCounter(parseInt(storedCounter, 10));
    }

    fetchCounter();

    // Set up a real-time listener for updates
    const channel = supabase
      .channel('custom-update-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pot', filter: 'id=eq.1' },
        (payload) => {
          setCounter(payload.new.current_amount);
          setLocalCounter(0);
          localStorage.setItem('localCounter', '0');
          setTimeLeft(30);
        }
      )
      .subscribe();

    // Set up local increment interval
    incrementIntervalRef.current = setInterval(() => {
      setLocalCounter((prev) => {
        const newLocalCounter = prev + 1;
        localStorage.setItem('localCounter', newLocalCounter.toString());
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
        return newLocalCounter;
      });

      // Update Supabase periodically
      updateSupabasePot();

      // Reset countdown
      setTimeLeft(30);
    }, 30000);

    // Set up countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => {
      channel.unsubscribe();
      if (incrementIntervalRef.current) {
        clearInterval(incrementIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Format number with dollar sign and commas
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate total displayed amount
  const displayAmount = counter !== null ? counter + localCounter : null;

  return (
    <div className="p-4 bg-gradient-to-r from-green-400 to-blue-500 shadow-2xl rounded-2xl text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">Prize Pool</h2>
      {isLoading ? (
        <p className="text-white">Loading...</p>
      ) : error ? (
        <p className="text-red-200">{error}</p>
      ) : (
        <>
          <div 
            className={`text-5xl font-extrabold text-white transition-transform duration-500 ${
              isAnimating ? 'scale-110 animate-pulse' : ''
            }`}
          >
            {displayAmount !== null ? formatCurrency(displayAmount) : 'Loading'}
          </div>
          <div className="mt-2 text-sm text-white">
            <span>Base Amount: {formatCurrency(counter || 0)}</span>
            <span className="ml-4">Local Increment: ${localCounter}</span>
          </div>
          <div className="mt-4 text-sm text-white opacity-75">
            Next $1 donation increment in {timeLeft} seconds
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 mt-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000" 
              style={{width: `${(30 - timeLeft) / 30 * 100}%`}}
            ></div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveCounter;