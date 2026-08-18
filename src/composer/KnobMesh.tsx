"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The knob's dial, modelled on the real Etch A Sketch knob.
 *
 * SHAPE: a shallow fluted CONE. It flares out to meet the panel and narrows to
 * a smooth dished face, so the milling lies on a sloped surface — which is why,
 * head-on, the flutes read as a wide radial band rather than the thin serrated
 * edge a straight cylinder would show.
 *
 * BUILT BY DISPLACING A CONE, not by bevelling a gear outline. ExtrudeGeometry's
 * bevel offsets a shape along its own normals rather than scaling it toward the
 * centre, so a bevel deeper than the teeth (0.34 against 0.036) folds the
 * outline through itself and the knob stops being round at all. Starting from
 * CylinderGeometry and pushing its vertices out by a smooth wave keeps the
 * silhouette circular BY CONSTRUCTION — the radius only ever varies by the
 * flute depth.
 *
 * VISUAL ONLY. Pointer, keyboard and ARIA live on the DOM slider layered over
 * this canvas (see Knob.tsx); losing WebGL costs appearance and nothing else.
 */

const BASE_RADIUS = 1;      // against the panel
const FACE_RADIUS = 0.72;   // the flat it tapers to
const BODY_DEPTH = 0.4;
const FLUTES = 60;
const FLUTE_DEPTH = 0.022;
const DISH_DEPTH = 0.05;
/* Out to the cone's widest top edge, so no seam is left at the flute crests. */
const DISH_RADIUS = FACE_RADIUS + FLUTE_DEPTH;

/** A truncated cone with a finely milled surface. */
function useConeGeometry() {
  return useMemo(() => {
    // CLOSED, not open-ended. An open cone has nothing behind the dish, so the
    // seam where the two meet — and the lathe's degenerate apex — read straight
    // through the knob as holes. The caps cost a handful of triangles and make
    // the solid actually solid.
    const geometry = new THREE.CylinderGeometry(
      FACE_RADIUS,
      BASE_RADIUS,
      BODY_DEPTH,
      FLUTES * 4,
      1,
      false,
    );

    // Push each vertex out along its own radius by a smooth wave. Rounded
    // flutes rather than square teeth: a milled edge IS rounded, and shared
    // vertices on a square wave average their normals into mush.
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const radius = Math.hypot(x, z);
      if (radius < 1e-6) continue;
      const wave = 0.5 * (1 + Math.cos(Math.atan2(z, x) * FLUTES));
      const scale = (radius + FLUTE_DEPTH * wave) / radius;
      position.setX(i, x * scale);
      position.setZ(i, z * scale);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

/** The concave face, revolved from a shallow parabolic profile. */
function useDishGeometry() {
  return useMemo(() => {
    const profile: THREE.Vector2[] = [];
    // Starts at a small non-zero radius with a flat centre point. A lathe swept
    // from exactly r=0 produces a fan of degenerate triangles at the axis whose
    // normals are undefined — which renders as a dark dot in the middle of the
    // dish and reads as a puncture.
    profile.push(new THREE.Vector2(0, -DISH_DEPTH));
    for (let i = 1; i <= 28; i++) {
      const t = i / 28;
      profile.push(new THREE.Vector2(t * DISH_RADIUS, -DISH_DEPTH * (1 - t * t)));
    }
    const geometry = new THREE.LatheGeometry(profile, 72);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

export default function KnobMesh({ angle }: { angle: number }) {
  const cone = useConeGeometry();
  const dish = useDishGeometry();

  return (
    <Canvas
      /* Renders only when something changes. Two knobs on a permanent
         requestAnimationFrame would burn battery to display a still image. */
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.15], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      /* The DOM slider on top owns every event. */
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.75} />
      {/* Key from the upper left, matching the light the CSS toy is lit by, so
          the knob does not look borrowed from another scene. */}
      <directionalLight position={[-2.2, 3.4, 4]} intensity={1.7} />
      {/* Cool bounce from below right, so the shadowed flank keeps its form. */}
      <directionalLight position={[3, -2.4, 1.8]} intensity={0.4} color="#c3cdff" />

      {/* Barely leaned — the real knob is seen head-on; this is just enough for
          the cone's flank to register. */}
      <group rotation={[-0.14, 0, 0]}>
        <group rotation={[0, 0, -angle]}>
          {/* Stood on end so the cone's axis points at the viewer. */}
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={cone}>
              <meshStandardMaterial color="#ffffff" roughness={0.44} metalness={0.03} />
            </mesh>
            <mesh geometry={dish} position={[0, BODY_DEPTH / 2, 0]}>
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.32}
                metalness={0.02}
                /* The bowl is an open surface; without this its far wall
                   disappears and you see straight through the knob. */
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>

          {/* THE POINTER. The real knob has none — position is meaningless on a
              physical toy — but ours selects a hue and a lightness, so the angle
              must be legible at a glance. */}
          <mesh position={[0, 0.5, BODY_DEPTH / 2 + 0.02]}>
            <boxGeometry args={[0.075, 0.2, 0.05]} />
            <meshStandardMaterial color="#000000" roughness={0.5} />
          </mesh>
        </group>
      </group>
    </Canvas>
  );
}
