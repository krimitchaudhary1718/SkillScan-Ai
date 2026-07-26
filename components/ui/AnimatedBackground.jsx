'use client';

import { motion } from 'framer-motion';

/**
 * AnimatedBackground - Floating gradient orbs that create a dynamic,
 * futuristic atmosphere behind page content.
 * 
 * Uses Framer Motion for smooth infinite animations with varying
 * durations and trajectories for each orb.
 */

// Configuration for each floating orb - positions, colors, sizes, and animation timing
const orbs = [
  {
    id: 1,
    size: 500,
    color: 'bg-purple-600',
    initialX: -10,
    initialY: -10,
    animateX: ['-10%', '15%', '-5%', '-10%'],
    animateY: ['-10%', '20%', '-15%', '-10%'],
    duration: 25,
    opacity: 0.15,
  },
  {
    id: 2,
    size: 400,
    color: 'bg-blue-600',
    initialX: 80,
    initialY: 10,
    animateX: ['80%', '60%', '85%', '80%'],
    animateY: ['10%', '30%', '5%', '10%'],
    duration: 20,
    opacity: 0.12,
  },
  {
    id: 3,
    size: 350,
    color: 'bg-cyan-500',
    initialX: 30,
    initialY: 60,
    animateX: ['30%', '50%', '25%', '30%'],
    animateY: ['60%', '40%', '70%', '60%'],
    duration: 22,
    opacity: 0.1,
  },
  {
    id: 4,
    size: 300,
    color: 'bg-indigo-600',
    initialX: 70,
    initialY: 70,
    animateX: ['70%', '55%', '75%', '70%'],
    animateY: ['70%', '50%', '80%', '70%'],
    duration: 18,
    opacity: 0.12,
  },
  {
    id: 5,
    size: 250,
    color: 'bg-violet-500',
    initialX: 10,
    initialY: 40,
    animateX: ['10%', '25%', '5%', '10%'],
    animateY: ['40%', '55%', '35%', '40%'],
    duration: 28,
    opacity: 0.1,
  },
  {
    id: 6,
    size: 200,
    color: 'bg-purple-500',
    initialX: 50,
    initialY: 20,
    animateX: ['50%', '35%', '55%', '50%'],
    animateY: ['20%', '10%', '30%', '20%'],
    duration: 15,
    opacity: 0.08,
  },
];

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full ${orb.color} blur-3xl`}
          style={{
            width: orb.size,
            height: orb.size,
            opacity: orb.opacity,
          }}
          initial={{
            x: orb.animateX[0],
            y: orb.animateY[0],
            scale: 1,
          }}
          animate={{
            x: orb.animateX,
            y: orb.animateY,
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
