"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import { gsap } from "gsap";
import { Vector3, Group, Object3DEventMap, MathUtils, Color } from "three";
import { Pause, Play } from "lucide-react";

// Constants
const CUBE_CONFIG = {
  dimensions: { width: 1, height: 1, depth: 1 },
  gap: 1,
  radius: 0.1,
};

const LIGHT_POSITIONS = [
  { position: new Vector3(-1, 0.5, 0.2), intensity: 10 }, // left
  { position: new Vector3(0, 2, 5), intensity: 10 }, // front
  { position: new Vector3(0, 1, 0.2), intensity: 10 }, // top
  { position: new Vector3(-1, -1, -1), intensity: 10 }, // left-bottom
  { position: new Vector3(1, -1, -1), intensity: 10 }, // right-bottom
  { position: new Vector3(1, 0.5, 0.2), intensity: 10 }, // right
];

// Individual cube component
const SubCube = ({ position }: { position: Vector3 }) => {
  return (
    <RoundedBox
      args={[
        CUBE_CONFIG.dimensions.width,
        CUBE_CONFIG.dimensions.height,
        CUBE_CONFIG.dimensions.depth,
      ]}
      position={position}
      radius={CUBE_CONFIG.radius}
    >
      <meshStandardMaterial
        color={new Color(0x000000)}
        metalness={0.3}
        roughness={0.15}
      />
    </RoundedBox>
  );
};

// Lighting setup component
const Lighting = () => {
  return (
    <>
      <ambientLight intensity={30} />
      {LIGHT_POSITIONS.map((light, index) => (
        <directionalLight
          key={index}
          position={light.position.multiplyScalar(5)}
          intensity={light.intensity}
        />
      ))}
    </>
  );
};

// Main cube row component
const CubeRow = forwardRef<Group<Object3DEventMap> | null, { y: number }>(
  ({ y }, groupRef) => {
    const positions = useMemo(() => {
      const poses: Vector3[] = [];
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
          const _x = (x - 1) * CUBE_CONFIG.gap;
          const _y = (y - 1) * CUBE_CONFIG.gap;
          const _z = (z - 1) * CUBE_CONFIG.gap;

          poses.push(new Vector3(_x, _y, _z));
        }
      }

      return poses;
    }, [y]);

    return (
      <group ref={groupRef}>
        {positions.map((position, index) => (
          <SubCube key={index} position={position} />
        ))}
      </group>
    );
  }
);

CubeRow.displayName = "CubeRow";

// Main RubiksCube component
const RubiksCube = ({ isPaused }: { isPaused: boolean }) => {
  const [isTablet, setIsTablet] = useState(false);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const cubeGroupRef = useRef<Group<Object3DEventMap> | null>(null);
  const row1Ref = useRef<Group<Object3DEventMap> | null>(null);
  const row2Ref = useRef<Group<Object3DEventMap> | null>(null);
  const row3Ref = useRef<Group<Object3DEventMap> | null>(null);

  const { camera } = useThree();

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    setIsTablet(width <= 800);
  }, []);

  // Initial setup
  useEffect(() => {
    if (cubeGroupRef.current && !isPaused) {
      cubeGroupRef.current.rotation.x = MathUtils.degToRad(45);
      cubeGroupRef.current.rotation.y = MathUtils.degToRad(45);
    }

    // Animation timeline
    const timeline = (timelineRef.current = gsap.timeline({ repeat: -1 }));
    isPaused ? timeline.pause() : timeline.resume();
   
    if (row1Ref.current && row3Ref.current && !isPaused) {
      row1Ref.current.rotation.set(0, 0, 0);
      row3Ref.current.rotation.set(0, 0, 0);

      timeline
        .to(row1Ref.current.rotation, { y: "+=3.14", duration: 3 })
        .to(row3Ref.current.rotation, { y: "+=3.14", duration: 3 }, 4)
        .to(row1Ref.current.rotation, { y: "+=3.14", duration: 3 }, 8)
        .to(row3Ref.current.rotation, { y: "+=3.14", duration: 3 }, 8.5)
        .to(row1Ref.current.rotation, { y: "+=6.28", duration: 3 }, 12)
        .to(row3Ref.current.rotation, { y: "+=6.28", duration: 3 }, 16)
        .to(row1Ref.current.rotation, { y: "+=6.28", duration: 3 }, 20)
        .to(row3Ref.current.rotation, { y: "+=6.28", duration: 3 }, 20.5);
    }

    return () => {
      timeline.kill();
    };
  }, [isPaused, camera]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (isTablet) camera.position.set(0, 0, 8);
    else camera.position.set(0, 0, 5.5);
  }, [isTablet, camera.position]);

  // Continuous rotation animation
  useFrame(() => {
    if (cubeGroupRef.current && !isPaused) {
      const rotationInRad = 0.01;
      cubeGroupRef.current.rotation.x += rotationInRad;
      cubeGroupRef.current.rotation.y += rotationInRad;
      cubeGroupRef.current.rotation.z += rotationInRad;
    }
  });

  return (
    <>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enableZoom={false}
        camera={camera}
      />
      <Lighting />

      <group ref={cubeGroupRef}>
        <CubeRow y={0} ref={row3Ref} />
        <CubeRow y={1} ref={row2Ref} />
        <CubeRow y={2} ref={row1Ref} />
      </group>
    </>
  );
};

const AnimatedRubiksCube = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="relative w-full h-full">
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute top-4 right-4 z-10 p-2 bg-neutral-800 backdrop-blur-sm rounded-md text-white hover:bg-neutral-900 transition-colors"
      >
        {isPaused ? <Play className="size-3"/> : <Pause className="size-3"/>}
      </button>

      <Canvas>
        <RubiksCube isPaused={isPaused} />
      </Canvas>
    </div>
  );
};

export default AnimatedRubiksCube;
