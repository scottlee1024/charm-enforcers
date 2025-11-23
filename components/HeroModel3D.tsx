import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Character } from '../types';
import * as THREE from 'three';

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

// --- Inner Component ---
function ModelContent({ url, action }: { url: string; action: string; }) {
    const { scene, animations } = useGLTF(url);
    const { actions, names } = useAnimations(animations, scene);
    
    useEffect(() => {
        if (!actions || names.length === 0) return;
        const findAnim = (term: string) => names.find(n => n.toLowerCase().includes(term.toLowerCase()));
        
        let clipName = names[0]; 
        if (action === 'ATTACK') clipName = findAnim('attack') || findAnim('kick') || findAnim('shoot') || clipName;
        else if (action === 'HIT') clipName = findAnim('hit') || findAnim('damage') || clipName;
        else if (action === 'IDLE') clipName = findAnim('idle') || findAnim('stand') || clipName;

        const currentAction = actions[clipName];
        if (currentAction) {
            currentAction.reset().fadeIn(0.2).play();
            if (action === 'ATTACK' || action === 'HIT') {
                currentAction.setLoop(THREE.LoopOnce, 1);
                currentAction.clampWhenFinished = true;
            } else {
                currentAction.setLoop(THREE.LoopRepeat, Infinity);
            }
        }
        return () => { if (currentAction) currentAction.fadeOut(0.2); };
    }, [action, actions, names]);

    return <primitive object={scene} />;
}

// --- Main Component ---
export default function HeroModel3D({ character, position, rotation = [0, 0, 0], action }: { character: Character; position: [number, number, number]; rotation?: [number, number, number]; action: string; isFront: boolean }) {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current && action === 'IDLE') {
            // Enhanced floating effect: Speed 2.0, Amplitude 0.08
            // We use position[1] as the base height
            group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2.0) * 0.08;
        }
    });

    const FallbackMesh = (
        <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
            <meshStandardMaterial color={character.color.includes('red') ? '#ef4444' : character.color.includes('pink') ? '#ec4899' : '#3b82f6'} />
        </mesh>
    );

    return (
        <group ref={group} position={position} rotation={rotation} scale={character.modelScale || 1}>
            <group position={[0, 1.0, 0]}>
                <ModelErrorBoundary fallback={FallbackMesh}>
                    <ModelContent url={character.modelUrl || 'https://models.readyplayer.me/64f0263b8551c8233565c988.glb'} action={action} />
                </ModelErrorBoundary>
            </group>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.55, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.6} />
            </mesh>
        </group>
    );
}