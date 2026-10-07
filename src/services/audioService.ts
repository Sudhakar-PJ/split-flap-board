import flip01 from "../assets/sounds/flip-01.wav";
import flip02 from "../assets/sounds/flip-02.wav";
import flip03 from "../assets/sounds/flip-03.wav";
import flip04 from "../assets/sounds/flip-04.wav";
import flip05 from "../assets/sounds/flip-05.wav";
import stopSound from "../assets/sounds/stop.wav";
import motorLoopSound from "../assets/sounds/motor-loop.wav";
import motorStopSound from "../assets/sounds/motor-stop.wav";
import resetClearSound from "../assets/sounds/reset-clear.wav";
import ambientSound from "../assets/sounds/ambient.wav";

/**
 * Mechanical Audio Engine utilizing multi-variation sound buffers
 * for Solari Split-Flap board flip clicks, motor loop/stop, landing snaps,
 * continuous room ambience, and clear/reset latch releases.
 */
class MechanicalAudioEngine {
  private ctx: AudioContext | null = null;
  private isMutedState: boolean = false;
  private masterGain: GainNode | null = null;

  private flipBuffers: AudioBuffer[] = [];
  private stopBuffer: AudioBuffer | null = null;
  private motorLoopBuffer: AudioBuffer | null = null;
  private motorStopBuffer: AudioBuffer | null = null;
  private resetClearBuffer: AudioBuffer | null = null;
  private ambientBuffer: AudioBuffer | null = null;

  private motorLoopSource: AudioBufferSourceNode | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.ctx.destination);

      this.loadSoundBuffers();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  private async loadSoundBuffers() {
    if (!this.ctx) return;
    try {
      const flipUrls = [flip01, flip02, flip03, flip04, flip05];
      this.flipBuffers = (
        await Promise.all(flipUrls.map((url) => this.fetchAndDecode(url)))
      ).filter((b): b is AudioBuffer => b !== null);

      this.stopBuffer = await this.fetchAndDecode(stopSound);
      this.motorLoopBuffer = await this.fetchAndDecode(motorLoopSound);
      this.motorStopBuffer = await this.fetchAndDecode(motorStopSound);
      this.resetClearBuffer = await this.fetchAndDecode(resetClearSound);
      this.ambientBuffer = await this.fetchAndDecode(ambientSound);

      this.startAmbient();
    } catch (err) {
      console.warn("Failed to decode Solari sound set:", err);
    }
  }

  private async fetchAndDecode(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await this.ctx.decodeAudioData(arrayBuffer);
  }

  public resumeAudioContext() {
    this.initContext();
    this.startAmbient();
  }

  public toggleMute(): boolean {
    this.isMutedState = !this.isMutedState;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMutedState ? 0 : 0.6,
        this.ctx.currentTime
      );
    }
    return this.isMutedState;
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  /**
   * Starts continuous background station room tone ambience
   */
  public startAmbient() {
    if (this.isMutedState || this.ambientSource) return;
    if (!this.ctx || !this.masterGain || !this.ambientBuffer) return;

    this.ambientSource = this.ctx.createBufferSource();
    this.ambientSource.buffer = this.ambientBuffer;
    this.ambientSource.loop = true;

    const ambientGain = this.ctx.createGain();
    ambientGain.gain.value = 0.15;

    this.ambientSource.connect(ambientGain);
    ambientGain.connect(this.masterGain);

    this.ambientSource.start(0);
  }

  /**
   * Plays a random flip sound variation (flip-01 to flip-05)
   */
  public playFlapClick() {
    if (this.isMutedState || this.flipBuffers.length === 0) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const randomIndex = Math.floor(Math.random() * this.flipBuffers.length);
    const chosenBuffer = this.flipBuffers[randomIndex];

    const source = this.ctx.createBufferSource();
    source.buffer = chosenBuffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.8;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(0);
  }

  /**
   * Plays stop.wav when a card lands on its target letter
   */
  public playStopSnap() {
    if (this.isMutedState) return;
    this.initContext();
    if (!this.ctx || !this.masterGain || !this.stopBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = this.stopBuffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.95;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(0);
  }

  /**
   * Plays heavy double-clack reset-clear.wav when clicking top-right X button
   */
  public playResetClearSound() {
    if (this.isMutedState) return;
    this.initContext();
    if (!this.ctx || !this.masterGain || !this.resetClearBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = this.resetClearBuffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 1.0; // High gain for prominent reset sound

    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(0);
  }

  /**
   * Starts motor hum loop cleanly
   */
  public startMotor() {
    if (this.isMutedState || this.motorLoopSource) return;
    this.initContext();
    if (!this.ctx || !this.masterGain || !this.motorLoopBuffer) return;

    const now = this.ctx.currentTime;

    this.motorLoopSource = this.ctx.createBufferSource();
    this.motorLoopSource.buffer = this.motorLoopBuffer;
    this.motorLoopSource.loop = true;

    const loopGain = this.ctx.createGain();
    loopGain.gain.setValueAtTime(0, now);
    loopGain.gain.linearRampToValueAtTime(0.35, now + 0.1);

    this.motorLoopSource.connect(loopGain);
    loopGain.connect(this.masterGain);

    this.motorLoopSource.start(now);
  }

  /**
   * Triggers prominent motor-stop.wav spin-down fade out when the final flap completes
   */
  public triggerMotorStop() {
    if (this.motorLoopSource) {
      try {
        this.motorLoopSource.stop();
      } catch {
        // ignore
      }
      this.motorLoopSource = null;
    }

    if (this.ctx && this.masterGain && this.motorStopBuffer && !this.isMutedState) {
      const now = this.ctx.currentTime;
      const stopSrc = this.ctx.createBufferSource();
      stopSrc.buffer = this.motorStopBuffer;

      const stopGain = this.ctx.createGain();
      stopGain.gain.setValueAtTime(0.75, now); // Higher gain for prominent motor-stop
      stopGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      stopSrc.connect(stopGain);
      stopGain.connect(this.masterGain);

      stopSrc.start(now);
    }
  }

  /**
   * Immediately stops motor on reset/clear button click
   */
  public forceStopMotor() {
    if (this.motorLoopSource) {
      try {
        this.motorLoopSource.stop();
      } catch {
        // ignore
      }
      this.motorLoopSource = null;
    }
  }
}

export const audioService = new MechanicalAudioEngine();
