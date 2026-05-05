import { useRef, useState, Suspense, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment,
  ContactShadows,
  PresentationControls,
  Loader,
  MeshReflectorMaterial,
  BakeShadows
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';

const PRODUCT_URL = 'https://fork.bhavuk-arora03.workers.dev/';

// Original Brand Colors
const BLUE_600 = "#2563eb";
const BLUE_HOVER = "#1d4ed8";
const BLUE_LIGHT = "#60a5fa";

// --- Magnetic Component (Refined for Cuberto Feel) ---
const Magnetic = ({ children, onHoverChange }: { children: React.ReactElement, onHoverChange?: (hovered: boolean) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.4);
    y.set(middleY * 0.4);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    onHoverChange?.(false);
  };

  const handleMouseEnter = () => {
    onHoverChange?.(true);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="relative flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
};

// --- Custom Cursor (Cuberto Style: Large, Inverted, Sticky) ---
const CustomCursor = ({ isDarkMode, hoverType }: { isDarkMode: boolean; hoverType: string | null }) => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorSize = useMotionValue(12);

  const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };
  const sizeSpringConfig = { damping: 20, stiffness: 200 };
  
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const cursorSizeSpring = useSpring(cursorSize, sizeSpringConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (hoverType === 'button') {
      cursorSize.set(80);
    } else if (hoverType === 'text') {
      cursorSize.set(120);
    } else {
      cursorSize.set(12);
    }
  }, [hoverType, cursorSize]);

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] flex items-center justify-center mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        width: cursorSizeSpring,
        height: cursorSizeSpring,
        translateX: "-50%",
        translateY: "-50%",
        backgroundColor: "white", // White background with mix-blend-difference creates the inversion
      }}
    >
      {hoverType === 'button' && (
          <div className="w-1 h-1 rounded-full bg-black opacity-20" />
      )}
    </motion.div>
  );
};

// --- Masked Text Reveal ---
const MaskedText = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <div className="mask-container">
      <motion.div
        initial={{ translateY: "100%" }}
        animate={{ translateY: 0 }}
        transition={{
          duration: 1.2,
          delay,
          ease: [0.76, 0, 0.24, 1]
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const BlueFork = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { mouse, viewport } = useThree();

  const isMobile = viewport.width < 5;
  const xPos = isMobile ? 0 : viewport.width * 0.28;
  const yPos = isMobile ? 0.5 : 1.0;

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = yPos + Math.sin(t * 1.2) * 0.1;

      const targetRotationX = mouse.y * 0.4;
      const targetRotationY = mouse.x * 0.4;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.1);
      groupRef.current.rotation.z = 0;

      const targetScale = hovered ? 1.9 : 1.7;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
      <group
          ref={groupRef}
          position={[xPos, yPos, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
      >
        <group position={[0, -0.5, 0]}>
          <mesh position={[0, -1, 0]}>
            <cylinderGeometry args={[0.04, 0.07, 2, 64]} />
            <meshStandardMaterial
                color={hovered ? BLUE_HOVER : BLUE_600}
                metalness={1}
                roughness={0.05}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.35, 0.4, 0.08]} />
            <meshStandardMaterial
                color={hovered ? BLUE_HOVER : BLUE_600}
                metalness={1}
                roughness={0.05}
            />
          </mesh>
          {[ -0.12, -0.04, 0.04, 0.12 ].map((x, i) => (
              <mesh key={i} position={[x, 0.7, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.8, 32]} />
                <meshStandardMaterial
                    color={hovered ? BLUE_HOVER : BLUE_600}
                    metalness={1}
                    roughness={0.05}
                />
              </mesh>
          ))}
        </group>
      </group>
  );
};

const ReflectiveGround = ({ isDarkMode }: { isDarkMode: boolean }) => {
  if (!isDarkMode) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[0, 0]} resolution={1024} mixBlur={0} mixStrength={40} roughness={1} depthScale={1}
        minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#000000" metalness={0.5} mirror={0.2}
      />
    </mesh>
  );
};

const Scene = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nextTheme, setNextTheme] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoverType, setHoverType] = useState<string | null>(null);

  const toggleTheme = (e: React.MouseEvent) => {
    if (isTransitioning) return;
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    setNextTheme(!isDarkMode);
    const root = document.documentElement;
    root.style.setProperty('--reveal-x', `${x}px`);
    root.style.setProperty('--reveal-y', `${y}px`);
    root.style.setProperty('--reveal-radius', `${endRadius}px`);
    setIsTransitioning(true);
    setTimeout(() => {
      setIsDarkMode(!isDarkMode);
      setIsTransitioning(false);
    }, 800);
  };

  return (
    <div className={`w-screen h-screen relative font-['Plus_Jakarta_Sans'] overflow-hidden ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <CustomCursor isDarkMode={isDarkMode} hoverType={hoverType} />
      
      {isDarkMode && (
        <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-blue-900/20 via-black to-black" />
      )}

      <div 
        className={`absolute inset-0 z-50 pointer-events-none transition-all duration-700 ease-in-out clip-reveal ${isTransitioning ? 'active' : ''} ${nextTheme ? 'bg-black' : 'bg-white'}`}
      />

      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 1, 6]} fov={35} />
        <color attach="background" args={[isDarkMode ? '#000000' : '#ffffff']} />
        <fog attach="fog" args={[isDarkMode ? '#000000' : '#ffffff', 15, 30]} />

        <Suspense fallback={null}>
          <Environment preset={isDarkMode ? "city" : "apartment"} />
          <PresentationControls
            global snap speed={1.5} rotation={[0, 0, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]} azimuth={[-Math.PI / 3, Math.PI / 3]}
          >
            <BlueFork />
          </PresentationControls>
          <ReflectiveGround isDarkMode={isDarkMode} />
          {isDarkMode && (
            <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={20} blur={1} far={4} />
          )}
          <BakeShadows />
        </Suspense>

        <ambientLight intensity={isDarkMode ? 0.6 : 0.8} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={isDarkMode ? 10 : 2} castShadow color="#ffffff" />
        <pointLight position={[-5, 5, 5]} intensity={isDarkMode ? 5 : 1} color={BLUE_LIGHT} />
      </Canvas>

      <div className="absolute top-8 right-8 md:top-12 md:right-12 z-[60] pointer-events-auto">
        <Magnetic onHoverChange={(h) => setHoverType(h ? 'button' : null)}>
          <button 
            onClick={toggleTheme}
            className={`px-6 py-2 rounded-full border text-[10px] font-black tracking-widest uppercase transition-colors duration-500
              ${isDarkMode ? 'border-white/20 text-white' : 'border-black/10 text-black'}`}
          >
            {isDarkMode ? 'LIGHT' : 'DARK'}
          </button>
        </Magnetic>
      </div>

      <div className="absolute inset-0 flex flex-col items-start justify-center p-8 md:p-32 pointer-events-none z-10">
        <div className="w-full max-w-4xl">
          <div 
            onMouseEnter={() => setHoverType('text')}
            onMouseLeave={() => setHoverType(null)}
            className="pointer-events-auto inline-block mb-4"
          >
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-['Bebas_Neue'] font-black leading-[0.85] uppercase select-none cursor-default transition-all duration-500">
              <MaskedText delay={0.2}>Blue</MaskedText>
              <MaskedText delay={0.3}>
                <span className="text-blue-600">Fork</span>
              </MaskedText>
            </h1>
          </div>
          
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="w-16 h-1 bg-blue-600 mb-12 md:mb-14 origin-left"
          />
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pointer-events-auto">
            <Magnetic onHoverChange={(h) => setHoverType(h ? 'button' : null)}>
              <a 
                href={PRODUCT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-12 py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full text-center shadow-lg block"
              >
                Explore Fork
              </a>
            </Magnetic>
            <Magnetic onHoverChange={(h) => setHoverType(h ? 'button' : null)}>
              <button 
                className={`w-full sm:w-auto px-12 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-full border text-center transition-colors duration-500
                  ${isDarkMode ? 'bg-transparent border-white/20 text-white' : 'bg-white border-black/10 text-black shadow-sm'}`}
              >
                Investor Relations
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 w-full px-8 md:px-32 flex justify-between items-end pointer-events-none z-10">
        <div className="flex flex-col gap-1">
          <MaskedText delay={1}>
            <div className={`text-[12px] md:text-[13px] font-black uppercase tracking-[0.4em] transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Blue Fork Pvt. Ltd.
            </div>
          </MaskedText>
          <MaskedText delay={1.1}>
            <div className="text-blue-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
              AI-Native Products
            </div>
          </MaskedText>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Loader 
        containerStyles={{ background: '#ffffff' }}
        innerStyles={{ background: BLUE_600, height: '2px' }}
        barStyles={{ background: '#eee' }}
        dataStyles={{ color: '#000', fontFamily: 'Plus Jakarta Sans', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3em' }}
        dataInterpolation={(p) => `READY... ${p.toFixed(0)}%`}
      />
    </>
  );
}
