class Sleep extends Base {
  #sleepTimeoutId = -1;
  constructor(sleepEl) {
    super(sleepEl);
  }
  stopPlaying() {
    this.element.selectedIndex = 0;
    Base.disp(Base.events.playerPause);
  }
  addSleepMinutes() {
    for (let t = 15; t < 100; t = t + 15) {
      Base.createElement({
        type: "option",
        text: t + " min",
        value: t * 60000,
        parent: this.element
      });
    }
  }
  display() {
    return new Promise(resolve => {
      this.element.innerHTML = "<option>av</option>";
      this.element.onchange = () => {
        clearTimeout(this.#sleepTimeoutId);
        const val = this.element.value;
        if (!val || isNaN(parseInt(val))) {
          return;
        }
        this.#sleepTimeoutId = setTimeout(() => { this.stopPlaying() }, val);
      };
      this.addSleepMinutes();
      resolve();
    });
  }

}