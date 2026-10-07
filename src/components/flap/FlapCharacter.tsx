import { useRef, useEffect } from "react";
import styles from "./Flap.module.css";

interface FlapCharacterProps {
  character: string;
  className?: string;
  onElementsReady?: (elements: {
    topFlap: HTMLDivElement;
    bottomFlap: HTMLDivElement;
    flippingFlap: HTMLDivElement;
    topCharEl: HTMLSpanElement;
    bottomCharEl: HTMLSpanElement;
    flippingTopCharEl: HTMLSpanElement;
    flippingBottomCharEl: HTMLSpanElement;
    shadowOverlay?: HTMLDivElement;
  }) => void;
}

export default function FlapCharacter({
  character,
  className = "",
  onElementsReady,
}: FlapCharacterProps) {
  const displayChar = character || " ";

  const topFlapRef = useRef<HTMLDivElement>(null);
  const bottomFlapRef = useRef<HTMLDivElement>(null);
  const flippingFlapRef = useRef<HTMLDivElement>(null);
  const topCharRef = useRef<HTMLSpanElement>(null);
  const bottomCharRef = useRef<HTMLSpanElement>(null);
  const flippingTopCharRef = useRef<HTMLSpanElement>(null);
  const flippingBottomCharRef = useRef<HTMLSpanElement>(null);
  const shadowOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      onElementsReady &&
      topFlapRef.current &&
      bottomFlapRef.current &&
      flippingFlapRef.current &&
      topCharRef.current &&
      bottomCharRef.current &&
      flippingTopCharRef.current &&
      flippingBottomCharRef.current
    ) {
      onElementsReady({
        topFlap: topFlapRef.current,
        bottomFlap: bottomFlapRef.current,
        flippingFlap: flippingFlapRef.current,
        topCharEl: topCharRef.current,
        bottomCharEl: bottomCharRef.current,
        flippingTopCharEl: flippingTopCharRef.current,
        flippingBottomCharEl: flippingBottomCharRef.current,
        shadowOverlay: shadowOverlayRef.current || undefined,
      });
    }
  }, [onElementsReady]);

  return (
    <div className={`${styles.outerFrame} ${className}`.trim()}>
      <div className={styles.perspective}>
        {/* Top Half Flap (Static Top Face & Viewport revealing next character) */}
        <div ref={topFlapRef} className={styles.topFlap}>
          <div className={styles.topFace} />
          <div className={styles.characterViewportTop}>
            <span ref={topCharRef} className={styles.character}>
              {displayChar}
            </span>
          </div>
        </div>

        {/* Bottom Half Flap (Static Bottom Face & Viewport) */}
        <div ref={bottomFlapRef} className={styles.bottomFlap}>
          <div className={styles.bottomFace} />
          <div className={styles.characterViewportBottom}>
            <span ref={bottomCharRef} className={styles.character}>
              {displayChar}
            </span>
          </div>
        </div>

        {/* Dynamic 3D Flipping Leaf (Active Falling Flap owned by GSAP) */}
        <div ref={flippingFlapRef} className={styles.flippingFlap}>
          <div className={styles.flippingFace} />
          <div className={styles.characterViewportTop}>
            <span ref={flippingTopCharRef} className={styles.character}>
              {displayChar}
            </span>
          </div>
          <div className={styles.characterViewportBottom}>
            <span ref={flippingBottomCharRef} className={styles.character}>
              {displayChar}
            </span>
          </div>
        </div>

        {/* Dynamic Landing Shadow Overlay */}
        <div ref={shadowOverlayRef} className={styles.shadowOverlay} />

        {/* Center Hinge Hairline Separator */}
        <div className={styles.centerHinge} />

        {/* Realistic Cylindrical Side Pivot Pins */}
        <div className={`${styles.pivotPin} ${styles.leftPivot}`} />
        <div className={`${styles.pivotPin} ${styles.rightPivot}`} />

        {/* Subtle Lighting Reflection Overlay */}
        <div className={styles.lightingOverlay} />
      </div>
    </div>
  );
}
