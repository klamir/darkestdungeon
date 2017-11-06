export class AmbienceController {
  private player: AmbiencePlayer;
  private positions: {[key: string]: number} = {};
  private currentId: string;

  constructor (
    private lookup: { [key: string]: AmbienceDefinition | string }
  ) {}

  activate (id: string) {
    // Check if requested ambience exists and possibly route to a linked id
    const lookupResult = this.performLookup(id);
    if (!lookupResult) {
      console.warn("Unknown ambience: ", id);
      this.deactivate();
      this.currentId = id;
      return;
    }

    // Ignore recurring activations of the same ambience
    id = lookupResult.id;
    if (id === this.currentId) {
      console.log("Ignoring ambience activation: ", id);
      return;
    }

    // Deactivate the current ambience and switch to the new one
    this.deactivate();
    this.currentId = id;
    this.player = new AmbiencePlayer(lookupResult.definition);
    this.player.play(this.positions[id] || 0);
    console.log("Ambience changed to: ", id);
  }

  deactivate () {
    if (this.player) {
      this.positions[this.currentId] = this.player.getBasePosition();
      this.player.stop();
      delete this.player;
    }
  }

  setVolume (volume?: number) {
    this.player.fadeTo(volume);
  }

  private performLookup (id: string) {
    let definition;
    while (true) {
      definition = this.lookup[id];
      if (!definition) {
        return;
      }

      if (typeof definition === "string") {
        id = definition as string;
      } else {
        break;
      }
    }

    return {definition, id};
  }
}

export class AmbienceDefinition {
  constructor (
    public base: IHowlProperties,
    public os: IHowlProperties[]
  ) {}
}

export class AmbiencePlayer {
  static fadeTime: number = 1000;

  private baseSound: Howl;
  private osSounds: Howl[] = [];
  private isPlaying: boolean;

  constructor (
    private definition: AmbienceDefinition
  ) {}

  getBasePosition (): number {
    return this.baseSound.seek() as number;
  }

  play (startPosition: number = 0) {
    this.stop();
    this.isPlaying = true;
    this.baseSound = new Howl({...this.definition.base, loop: true});
    this.osSounds = this.definition.os.map((props) => new Howl(props));

    this.baseSound.seek(startPosition);
    this.baseSound.play();
    this.baseSound.fade(0, definedOr(this.definition.base.volume, 1), AmbiencePlayer.fadeTime);
    this.queueNextOS();
  }

  fadeTo (targetVolume?: number) {
    const sounds = [this.baseSound, ...this.osSounds];
    const initialVolumes = [this.definition.base, ...this.definition.os].map((def) => definedOr(def.volume, 1));
    const promises = sounds.map((sound, index) => {
      return new Promise((resolve) => {
        const volume = targetVolume === undefined ? initialVolumes[index] : targetVolume;
        sound.fade(sound.volume(), volume, AmbiencePlayer.fadeTime);
        sound.once("fade", resolve);
      });
    });

    return Promise.all(promises).then(() => sounds);
  }

  queueNextOS () {
    const timeout = 5000 + Math.random() * 10000;
    setTimeout(() => this.isPlaying && this.playNextOS(), timeout);
  }

  playNextOS () {
    const index = Math.floor(Math.random() * this.osSounds.length);
    const os = this.osSounds[index];
    os.once("end", () => this.isPlaying && this.queueNextOS());
    os.play();
  }

  stop () {
    if (!this.isPlaying) {
      return Promise.resolve();
    }

    // Set as not playing immediately to avoid OS timeouts
    // to trigger asynchronously while we're fading out
    this.isPlaying = false;

    // After all sounds have faded out we stop playing and unload
    return this.fadeTo(0).then((sounds) => {
      sounds.forEach((sound) => {
        sound.stop();
        sound.unload();
      });
    });
  }
}

function definedOr (value: any, fallback: any) {
  return value !== undefined ? value : fallback;
}