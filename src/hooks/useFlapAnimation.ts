import { useRef, useEffect, useCallback } from "react";
import { getFlapSequence } from "../services/flapSequenceService";
import {
  animateSingleFlip,
  type FlapElements,
} from "../services/flapAnimationService";
import { audioService } from "../services/audioService";
import { FLIP_DURATION } from "../utils/constants";

interface UseFlapAnimationProps {
  targetCharacter: string;
  delay?: number;
  totalSlots?: number;
  slotIndex?: number;
  onSequenceComplete?: () => void;
}

export function useFlapAnimation({
  targetCharacter,
  delay = 0,
  totalSlots = 1,
  slotIndex = 0,
  onSequenceComplete,
}: UseFlapAnimationProps) {
  const currentCharRef = useRef<string>(" ");
  const elementsRef = useRef<FlapElements | null>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const runSequence = useCallback(
    (target: string) => {
      const elements = elementsRef.current;
      if (!elements) return;

      const current = currentCharRef.current;
      const sequence = getFlapSequence(current, target);

      if (sequence.length <= 1) {
        if (onSequenceComplete) onSequenceComplete();
        return;
      }

      // Start global motor sound
      audioService.startMotor();
      let stepIndex = 0;

      const executeNextStep = () => {
        if (stepIndex >= sequence.length - 1) {
          currentCharRef.current = target;
          audioService.playStopSnap();

          // When the LAST flap slot (slotIndex === totalSlots - 1) finishes, trigger motor-stop spin down!
          if (slotIndex === totalSlots - 1) {
            audioService.triggerMotorStop();
          }

          if (onSequenceComplete) onSequenceComplete();
          return;
        }

        const stepCurrent = sequence[stepIndex];
        const stepNext = sequence[stepIndex + 1];
        stepIndex++;

        const totalSteps = sequence.length - 1;
        const dynamicDuration = totalSteps > 20 ? 0.05 : FLIP_DURATION;

        activeTimelineRef.current = animateSingleFlip(
          elements,
          stepCurrent,
          stepNext,
          {
            duration: dynamicDuration,
            onStepComplete: (nextChar) => {
              currentCharRef.current = nextChar;
              executeNextStep();
            },
          },
        );
      };

      if (delay > 0) {
        setTimeout(executeNextStep, delay * 1000);
      } else {
        executeNextStep();
      }
    },
    [delay, slotIndex, totalSlots, onSequenceComplete],
  );

  const bindElements = useCallback(
    (elements: FlapElements) => {
      const isFirstBind = !elementsRef.current;
      elementsRef.current = elements;

      if (isFirstBind && targetCharacter && targetCharacter !== " ") {
        runSequence(targetCharacter);
      }
    },
    [targetCharacter, runSequence],
  );

  useEffect(() => {
    const target = (targetCharacter || " ").toUpperCase();
    if (target !== currentCharRef.current && elementsRef.current) {
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }
      runSequence(target);
    }
  }, [targetCharacter, runSequence]);

  return {
    bindElements,
  };
}
