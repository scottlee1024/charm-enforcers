import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Enemy } from '../types';
import { PIRATE_MODEL_URL } from '../constants';
import * as THREE from 'three';

interface EnemyModel3DProps {
    enemy: Enemy;
    position: [number, number, number];
    action: string;
}

// --- Error Boundary ---
class ModelErrorBoundary extends React.Component<
    { fallback: React.ReactNode; children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}

function ModelContent({ url, action }: { url: string; action: string; }) {
    const { scene, animations } = useGLTF(url);
    const { actions, names } = useAnimations(animations, scene);

    useEffect(() => {
        if (!actions || names.length === 0) return;
        const findAnim = (term: string) => names.find(n => n.toLowerCase().includes(term.toLowerCase()));

        let clipName = names[0];
        if (action === 'HIT') clipName = findAnim('hit') || findAnim('damage') || clipName;
        else clipName = findAnim('idle') || findAnim('stand') || clipName;

        const currentAction = actions[clipName];
        if (currentAction) {
            currentAction.reset().fadeIn(0.2).play();
            if (action === 'HIT') {
                currentAction.setLoop(THREE.LoopOnce, 1);
                currentAction.clampWhenFinished = true;
            } else {
                currentAction.setLoop(THREE.LoopRepeat, Infinity);
            }
        }
        return () => { if (currentAction) currentAction.fadeOut(0.2); };
    }, [action, actions, names]);

    return <primitive object={scene} scale={1.2} rotation={[0, -Math.PI / 2, 0]} />;
}

export default function EnemyModel3D({ enemy, position, action }: EnemyModel3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const modelUrl = enemy.modelUrl || PIRATE_MODEL_URL;

    useFrame((state) => {
        if (groupRef.current && action !== 'HIT') {
             // Added dynamic floating effect with slightly different timing than heroes
             groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + 1) * 0.06;
        }
    });

    const FallbackMesh = (
        <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ef4444" />
        </mesh>
    );

    return (
        <group ref={groupRef} position={position}>
             <group position={[0, 0.8, 0]}>
                <ModelErrorBoundary fallback={FallbackMesh}>
                     <ModelContent url={modelUrl} action={action} />
                </ModelErrorBoundary>
             </group>

             {/* Shadow */}
             <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.8, 32]} />
                <meshBasicMaterial color="black" transparent opacity={0.5} />
            </mesh>
        </group>
    );
}