"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Box } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function FloatingShape({ color, position, type = "sphere" }: { color: string, position: [number, number, number], type?: "sphere" | "box" }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            {type === "sphere" ? (
                <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
                    <MeshDistortMaterial
                        color={color}
                        speed={3}
                        distort={0.4}
                        radius={1}
                        emissive={color}
                        emissiveIntensity={0.5}
                        metalness={0.8}
                        roughness={0.2}
                    />
                </Sphere>
            ) : (
                <Box ref={meshRef} args={[1.5, 1.5, 1.5]} position={position}>
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.5}
                        metalness={0.9}
                        roughness={0.1}
                    />
                </Box>
            )}
        </Float>
    );
}

export function Scene3D() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <FloatingShape color="#FE7501" position={[6, 3, -2]} />
                <FloatingShape color="#6A00FF" position={[-7, -4, -1]} type="box" />
                <FloatingShape color="#00F0FF" position={[3, -5, 2]} />
            </Canvas>
        </div>
    );
}
