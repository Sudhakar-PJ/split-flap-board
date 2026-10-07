import FlapCharacter from "./FlapCharacter";
import { useFlapAnimation } from "../../hooks/useFlapAnimation";
import { CHARACTER_STAGGER } from "../../utils/constants";

interface AnimatedFlapCharacterProps {
  targetCharacter: string;
  staggerIndex?: number;
  totalSlots?: number;
  className?: string;
  onComplete?: () => void;
}

export default function AnimatedFlapCharacter({
  targetCharacter,
  staggerIndex = 0,
  totalSlots = 1,
  className = "",
  onComplete,
}: AnimatedFlapCharacterProps) {
  const delay = staggerIndex * CHARACTER_STAGGER;

  const { bindElements } = useFlapAnimation({
    targetCharacter,
    delay,
    slotIndex: staggerIndex,
    totalSlots,
    onSequenceComplete: onComplete,
  });

  return (
    <FlapCharacter
      character=" "
      className={className}
      onElementsReady={bindElements}
    />
  );
}
