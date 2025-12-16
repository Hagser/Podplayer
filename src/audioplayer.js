import Base from './base.js';

export default
class AudioPlayer extends Base {
  static skipSeconds = 20;
  constructor(playerEl, playlist) {
    super(playerEl);
    this.playlist = playlist;
    this.playingIndex = Base.gi(Base.dataKeys.playingIndex) || -1;
    this.playingItem = Base.gi(Base.dataKeys.playingItem);
    this.playbackRate = Base.gi(Base.dataKeys.playbackRate) || 1;
    this.goPrev = Base.getElementById("goPrev");
    this.skipPrev = Base.getElementById("skipPrev");
    this.goNext = Base.getElementById("goNext");
    this.skipNext = Base.getElementById("skipNext");
    this.initAudioPlayer();
  }

  playIndex(index, direction = 1) {
    this.setPlayingIndex(index);
    const item = this.playlist[index];
    if (item?.deleted && index > 0 && index < this.playlist.length) {
      this.go(direction);
    } else {
      this.playItem(item);
    }
  }

  playItem(itm) {
    if (itm) {
      this.loadItem(itm);
      this.element.play();
    }
  }
  loadIndex(index) {
    this.setPlayingIndex(index);
    const item = this.playlist[index];
    if (item) {
      this.loadItem(item);
    }
  }
  loadItem(itm) {
    if (!itm)
      return;
    this.setPlayingItem(itm);
    this.element.setSrc(itm.audio);
    this.element.setCurrentTime(itm.currentTime || 0);
    this.element.setPlaybackRate(this.playbackRate);
    Base.disp(Base.events.scrollIndexIntoView, { index: this.playingIndex });
    if (itm.scrollIntoView) {
      itm.scrollIntoView();
    }

  }
  skip(direction) {
    this.element.setCurrentTime(this.element.currentTime += (direction * AudioPlayer.skipSeconds));
  }
  go(direction) {
    this.playIndex(this.playingIndex + direction, direction);
  }
  savePlayerData() {
    Base.si(this.element.currentSrc + "_currentTime", this.element.currentTime);
    Base.si(this.element.currentSrc + "_duration", this.element.duration);
    Base.si(Base.dataKeys.currentSrc, this.element.currentSrc);
  }
  shouldPlayNext() {
    return this.element.currentTime > this.element.duration - 0.5;
  }

  initAudioPlayer() {
    Base.createSetMethods(this.element, "currentTime;duration;playbackRate;src".split(";"));
    Base.createSetMethods(this, "playingIndex;playingItem;playbackRate".split(";"));
    this.element.addEventListener(Base.events.scrollPlayingItemIntoView, () => {
      if (this.playingIndex) {
        Base.disp(Base.events.scrollIndexIntoView, { index: this.playingIndex });
      }
    })
    this.goPrev.addEventListener("click", (e) => { this.go(-1) });
    this.skipPrev.addEventListener("click", (e) => { this.skip(-1) });
    this.goNext.addEventListener("click", (e) => { this.go(1) });
    this.skipNext.addEventListener("click", (e) => { this.skip(1) });
    this.element.addEventListener("touchmove", (ev) => { ev.preventDefault(); })
    this.element.addEventListener(Base.events.playerPause, (e) => this.element.pause());
    this.element.addEventListener(Base.events.playIndex, (e) => this.playIndex(e.detail.index));
    this.element.addEventListener(Base.events.loadIndex, (e) => this.loadIndex(e.detail.index));
    this.element.addEventListener(Base.events.replacePlaylist, (e) => this.loadItem(this.playingItem));
    this.element.addEventListener(Base.events.refreshPodcasts, (e) => {
      this.setPlayingIndex(-1);
      this.setPlayingItem(null);
    });
    this.element.addEventListener(Base.events.playingItemUpdated, (e) => { this.setPlayingItem(e.detail.playingItem); });
    this.element.onratechange = () => {
      this.setPlaybackRate(this.element.playbackRate);
    };
    this.element.ontimeupdate = (ev) => {
      this.savePlayerData();

      if (this.playingItem) {
        if (this.playingItem.setCurrentTime)
          this.playingItem.setCurrentTime(this.element.currentTime);
        if (this.playingItem.setDuration)
          this.playingItem.setDuration(this.element.duration);
        Base.sd({ playingItem: this.playingItem });
      }

      if (this.shouldPlayNext()) {
        if (this.playingItem) {
          this.playingItem.setDeleted();
        }
        this.playIndex(this.playingIndex + 1);
      }
    };
  }
}