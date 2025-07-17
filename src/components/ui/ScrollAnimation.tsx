'use client'

import React, { useRef, useEffect } from 'react';
import { motion, useInView, useAnimation, UseInViewOptions } from 'framer-motion';

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scale' | 'rotate' | 'flip';
  duration?: number;
  delay?: number;
  viewport?: UseInViewOptions;
  transition?: {
    type?: "spring" | "tween" | "keyframes";
    stiffness?: number;
    damping?: number;
    ease?: string;
  };
}

const animations = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  rotate: {
    hidden: { opacity: 0, rotate: -5, scale: 0.95 },
    visible: { opacity: 1, rotate: 0, scale: 1 },
  },
  flip: {
    hidden: { opacity: 0, rotateX: 90 },
    visible: { opacity: 1, rotateX: 0 },
  },
};

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  className = '',
  animation = 'fadeUp',
  duration = 0.7,
  delay = 0,
  viewport = { once: true, margin: "-100px 0px" },
  transition = { type: 'tween', ease: 'easeOut' },
}) => {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, viewport);

  // Seleccionar la animación adecuada
  const selectedAnimation = animations[animation];

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={selectedAnimation}
      transition={{
        duration,
        delay,
        ...transition,
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;
