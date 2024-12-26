// src/components/RewardPot.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import christmasPot from '/images/christmas-pot.png'; // Update this path to match your image location

// Simple 2D Fallback Component
const FallbackGift = () => (
  <div className="w-64 h-64 flex items-center justify-center">
    <span className="text-8xl">🎁</span>
  </div>
);

// 2D Gift Component
const GiftScene = ({ isOpening }: { isOpening: boolean }) => (
  <motion.div
    className="relative w-64 h-64"
    animate={{
      scale: [1, 1.05, 1],
      rotateY: [0, 360],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <img
      src={christmasPot}
      alt="Christmas Pot"
      className="w-full h-full object-contain drop-shadow-2xl"
    />
    
    {/* Sparkles */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-yellow-300 rounded-full"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
        }}
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
      />
    ))}

    {/* Glow effect */}
    <div 
      className="absolute inset-0 blur-xl opacity-30"
      style={{
        background: 'radial-gradient(circle at center, #ffd700 0%, transparent 70%)',
        zIndex: -1
      }}
    />
  </motion.div>
);

interface RewardPotProps {
  isNewUser?: boolean;
  onClose?: () => void;
}

const RewardPot = ({ isNewUser = true, onClose }: RewardPotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewardAmount] = useState(() => Math.floor(Math.random() * (500 - 100 + 1) + 100));
  const { width, height } = useWindowSize();
  const [isOpening, setIsOpening] = useState(false);

  const handlePotClick = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsOpen(true);
      setShowConfetti(true);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {!isOpen ? (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePotClick}
          >
            <GiftScene isOpening={isOpening} />
            
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                top: '184px',
                left: '40%',
                transform: 'translateX(-50%)',
              }}
            >
              <span className="text-2xl">👆</span>
            </motion.div>
            
            <p className="text-black text-center mt-4 text-xl font-bold">
              Tap to open your gift!
            </p>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {showConfetti && (
            <ReactConfetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.2}
              colors={['#ffd700', '#ff0000', '#ffffff', '#00ff00']}
            />
          )}
          <motion.div
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              <span className="text-6xl mb-4 block">🎉</span>
            </motion.div>
            <h2 className="text-3xl font-bold mb-4 text-red-500">
              Congratulations!
            </h2>
            <p className="text-xl mb-6">
              You've won a bonus of
            </p>
            <motion.div
              className="text-4xl font-bold text-green-500 mb-6"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              ${rewardAmount}
            </motion.div>
            <motion.button
              className="bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
            >
              Claim Reward
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardPot;