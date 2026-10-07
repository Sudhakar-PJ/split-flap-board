import gsap from "gsap";
import { audioService } from "./audioService";

export interface FlapElements {
  topFlap: HTMLDivElement;
  bottomFlap: HTMLDivElement;
  flippingFlap: HTMLDivElement;
  topCharEl: HTMLSpanElement;
  bottomCharEl: HTMLSpanElement;
  flippingTopCharEl: HTMLSpanElement;
  flippingBottomCharEl: HTMLSpanElement;
  shadowOverlay?: HTMLDivElement;
}

export interface AnimationOptions {
  duration?: number;
  onStepComplete?: (nextChar: string) => void;
}

/**
 * Creates a realistic GSAP 3D mechanical split-flap flip step synchronized with audio clicks.
 */
export function animateSingleFlip(
  elements: FlapElements,
  currentChar: string,
  nextChar: string,
  options: AnimationOptions = {}
): gsap.core.Timeline {
  const { duration = 0.16, onStepComplete } = options;
  const halfDuration = duration / 2;

  const tl = gsap.timeline({
    onComplete: () => {
      // Trigger physical mechanical click sound on flap snap landing
      audioService.playFlapClick();
      // Synchronize static bottom face to next character upon landing
      if (elements.bottomCharEl) elements.bottomCharEl.textContent = nextChar;
      // Reset flipping flap to neutral 0° state hidden behind static faces
      gsap.set(elements.flippingFlap, { rotateX: 0, zIndex: 1 });
      if (onStepComplete) onStepComplete(nextChar);
    },
  });

  // Prepare static background faces
  // Top static face immediately shows the NEXT character top half (waiting underneath)
  if (elements.topCharEl) elements.topCharEl.textContent = nextChar;
  // Bottom static face holds CURRENT character bottom half
  if (elements.bottomCharEl) elements.bottomCharEl.textContent = currentChar;

  // Prepare active flipping flap displaying CURRENT character top half
  if (elements.flippingTopCharEl) elements.flippingTopCharEl.textContent = currentChar;
  if (elements.flippingBottomCharEl) elements.flippingBottomCharEl.textContent = currentChar;

  // Initial GSAP 3D setup for flipping flap
  gsap.set(elements.flippingFlap, {
    rotateX: 0,
    transformOrigin: "50% 100%",
    backfaceVisibility: "hidden",
    zIndex: 20,
  });

  // Phase 1: Heavy gravity acceleration down to vertical center (-90deg)
  tl.to(elements.flippingFlap, {
    rotateX: -90,
    duration: halfDuration,
    ease: "sine.in",
    onComplete: () => {
      // Switch active face to NEXT character bottom half once past vertical threshold
      if (elements.flippingBottomCharEl) {
        elements.flippingBottomCharEl.textContent = nextChar;
      }
      gsap.set(elements.flippingFlap, {
        transformOrigin: "50% 0%",
      });
    },
  });

  // Phase 2: Deceleration snap onto bottom stack (-90deg to -180deg)
  tl.to(elements.flippingFlap, {
    rotateX: -180,
    duration: halfDuration,
    ease: "back.out(1.2)",
  });

  // Shadow overlay flash across bottom card on flap landing
  if (elements.shadowOverlay) {
    tl.fromTo(
      elements.shadowOverlay,
      { opacity: 0 },
      { opacity: 0.75, duration: halfDuration, ease: "power1.in", yoyo: true, repeat: 1 },
      0
    );
  }

  return tl;
}
