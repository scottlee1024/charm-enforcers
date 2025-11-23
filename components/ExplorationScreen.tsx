import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PIRATE_MODEL_URL, KAYLA_MODEL_URL } from '../constants';

interface ExplorationScreenProps {
    frontHeroId: string;
    onEncounter: (enemyId: string) => void;
    defeatedEnemies: string[];
    onExit: () => void;
}

// Player Avatar for Map
function PlayerAvatar({ position, targetPosition, isMoving }: { position: THREE.Vector3, targetPosition: THREE.Vector3, isMoving: boolean }) {
    const ref = useRef<THREE.Group>(null);
    const { scene } = useGLTF(KAYLA_MODEL_URL); 
    
    useFrame((state, delta) => {
        if (!ref.current) return;
        
        // Sync position with the physics state (playerPos)
        ref.current.position.copy(position);

        if (isMoving) {
            ref.current.lookAt(targetPosition);
        }
        // Idle bob
        if (ref.current.children[0]) {
            ref.current.children[0].position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    return (
        <group ref={ref}>
            <group scale={0.6}>
                 <primitive object={scene.clone()} />
            </group>
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <ringGeometry args={[0.6, 0.8, 32]} />
                <meshBasicMaterial color="#06b6d4" />
            </mesh>
        </group>
    );
}

// Map Enemy
function MapEnemy({ id, position, onClick }: { id: string, position: [number, number, number], onClick: () => void }) {
    const { scene } = useGLTF(PIRATE_MODEL_URL);
    const ref = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if(ref.current) {
             ref.current.rotation.y += 0.01;
             ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
        }
    });

    return (
        <group ref={ref} position={position} onClick={onClick} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
             <primitive object={scene.clone()} scale={0.6} />
             <Html position={[0, 2.0, 0]} center>
                 <div className="bg-red-900/80 text-white px-2 py-1 rounded text-xs font-bold border border-red-500 animate-pulse whitespace-nowrap">
                    PIRATE SCOUT
                 </div>
             </Html>
        </group>
    );
}

function GameMap({ onMove, playerPos, moving, target, enemies, onInteract }: any) {
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {/* Clickable Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={(e) => onMove(e.point)}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
            </mesh>
            <Grid position={[0, 0.01, 0]} args={[100, 100]} cellColor="#1e293b" sectionColor="#334155" infiniteGrid />

            <PlayerAvatar position={playerPos} targetPosition={target} isMoving={moving} />

            {enemies.map((enemy: any) => (
                <MapEnemy key={enemy.id} id={enemy.id} position={enemy.position} onClick={() => onInteract(enemy.id)} />
            ))}
        </>
    );
}

const ExplorationScreen: React.FC<ExplorationScreenProps> = ({ frontHeroId, onEncounter, defeatedEnemies, onExit }) => {
    const [playerPos] = useState(new THREE.Vector3(0, 0, 0));
    const [targetPos] = useState(new THREE.Vector3(0, 0, 0));
    const [isMoving, setIsMoving] = useState(false);

    // Filter out already defeated enemies
    const mapEnemies = [
        { id: 'pirate_1', position: [4, 0, -4] as [number, number, number], name: 'Small Pirate' },
        { id: 'pirate_2', position: [-6, 0, -3] as [number, number, number], name: 'Small Pirate' },
        { id: 'boss_guard', position: [0, 0, -12] as [number, number, number], name: 'Elite Guard' }
    ].filter(e => !defeatedEnemies.includes(e.id));

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 p-6 flex justify-between items-start z-10 pointer-events-none">
                 <div>
                    <h1 className="text-2xl font-black text-cyan-400 italic tracking-widest uppercase">Deep Space Sector</h1>
                    <p className="text-slate-400 text-sm">Objective: Neutralize Threats</p>
                 </div>
                 <button onClick={onExit} className="pointer-events-auto bg-slate-800/80 px-4 py-2 rounded text-white text-xs hover:bg-red-900">
                     Abort Mission
                 </button>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cyan-500/50 text-sm font-mono z-10 animate-pulse pointer-events-none">
                CLICK TO MOVE // ENGAGE HOSTILES
            </div>

            <Canvas camera={{ position: [0, 15, 10], fov: 45 }}>
                <Suspense fallback={null}>
                    <SceneContent 
                        playerPos={playerPos} 
                        targetPos={targetPos} 
                        isMoving={isMoving} 
                        setIsMoving={setIsMoving}
                        mapEnemies={mapEnemies}
                        onEncounter={onEncounter}
                    />
                </Suspense>
                <OrbitControls enableRotate={false} enableZoom={true} minZoom={10} maxZoom={40} />
            </Canvas>
        </div>
    );
};

function SceneContent({ playerPos, targetPos, isMoving, setIsMoving, mapEnemies, onEncounter }: any) {
    useFrame((state, delta) => {
        if (isMoving) {
            const speed = 8 * delta;
            
            // Manual 'moveTowards' logic
            const direction = new THREE.Vector3().subVectors(targetPos, playerPos);
            const distance = direction.length();
            
            if (distance > speed) {
                direction.normalize().multiplyScalar(speed);
                playerPos.add(direction);
            } else {
                playerPos.copy(targetPos);
            }

            if (playerPos.distanceTo(targetPos) < 0.2) setIsMoving(false);

            // Proximity Check
            mapEnemies.forEach((enemy: any) => {
                const enemyVec = new THREE.Vector3(...enemy.position);
                if (playerPos.distanceTo(enemyVec) < 2.0) {
                    setIsMoving(false);
                    onEncounter(enemy.id);
                }
            });
        }
    });

    return (
        <GameMap 
            onMove={(p: THREE.Vector3) => { targetPos.copy(p); setIsMoving(true); }}
            playerPos={playerPos}
            moving={isMoving}
            target={targetPos}
            enemies={mapEnemies}
            onInteract={(id: string) => onEncounter(id)}
        />
    );
}

export default ExplorationScreen;