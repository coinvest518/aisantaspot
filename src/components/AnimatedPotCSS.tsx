import { motion } from 'framer-motion';
// Import your image directly
import christmasPot from '/images/christmas-pot.png'; // Make sure this path is correct relative to your public directory

const AnimatedPotCSS = () => {
  return (
    <motion.div
      className="relative w-64 h-64"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0"
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
        {/* Regular img tag for Vite */}
        <img
          src={christmasPot}
          alt="Animated Pot"
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </motion.div>
      
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

      {/* Glow effect behind the image */}
      <div 
        className="absolute inset-0 blur-xl opacity-30"
        style={{
          background: 'radial-gradient(circle at center, #ffd700 0%, transparent 70%)',
          zIndex: -1
        }}
      />
    </motion.div>
  );
};

export default AnimatedPotCSS;