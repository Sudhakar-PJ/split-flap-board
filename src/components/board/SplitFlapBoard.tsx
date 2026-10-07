import { useState, useRef } from "react";
import AnimatedFlapCharacter from "../flap/AnimatedFlapCharacter";
import { audioService } from "../../services/audioService";
import { Volume2, VolumeX, X } from "lucide-react";

export default function SplitFlapBoard() {
  const [inputValue, setInputValue] = useState("");
  const [activeBoardText, setActiveBoardText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const characters = activeBoardText.toUpperCase().split("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    audioService.resumeAudioContext();
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      audioService.resumeAudioContext();
      setActiveBoardText(inputValue);
    }
  };

  const handleClearBoard = () => {
    audioService.resumeAudioContext();
    audioService.playResetClearSound();
    audioService.forceStopMotor();
    setInputValue("");
    setActiveBoardText("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAudioToggle = () => {
    audioService.resumeAudioContext();
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 max-w-full">
      {/* Outer Solari Board Housing Frame */}
      <div className="flex flex-col gap-4 rounded-2xl border-4 border-neutral-800 bg-[#0c0c0d] p-8 shadow-2xl transition-all duration-300 min-w-[340px]">
        {/* Board Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          {/* <div className="flex items-center gap-2"> */}
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {/* <span className="font-mono text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              Solari Mechanical Display
            </span> */}
          {/* </div> */}

          <div className="flex items-center gap-3">
            {/* Top Right Audio Mute Button */}
            <button
              onClick={handleAudioToggle}
              className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-4 w-4 text-red-400" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-emerald-400" />
                  <span>Sound On</span>
                </>
              )}
            </button>

            {/* Top Right "X" Clear & Stop Button above "Sound On" */}
            <button
              onClick={handleClearBoard}
              className="flex items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-400 transition hover:border-red-900 hover:bg-red-950 hover:text-red-300"
              title="Clear text & reset board"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Flap Display Container */}
        <div className="flex items-center gap-2 rounded-lg bg-[#141416] p-4 shadow-inner min-h-[124px] max-w-[90vw] overflow-x-auto justify-center">
          {characters.length > 0 ? (
            characters.map((char, index) => (
              <AnimatedFlapCharacter
                key={`${activeBoardText}-${index}`}
                targetCharacter={char}
                staggerIndex={index}
                totalSlots={characters.length}
              />
            ))
          ) : (
            <div className="text-neutral-600 text-sm font-mono tracking-wider px-4">
              PRESS ENTER TO DISPLAY...
            </div>
          )}
        </div>
      </div>

      {/* Input Control Triggered on Enter */}
      <div className="flex flex-col items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-96 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-center font-mono text-xl text-neutral-100 placeholder-neutral-500 outline-none transition focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 shadow-lg"
          placeholder="Type text and press ENTER..."
        />
        <span className="text-xs text-neutral-500 font-mono">
          Press{" "}
          <kbd className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-300">
            Enter
          </kbd>{" "}
          to start Solari animation
        </span>
      </div>
    </div>
  );
}
