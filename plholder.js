class Plholder extends Base {
  constructor() {
    super("plHolder")
    this.init();
  }
  plHeight = 0;
  adjustPlaylistHeight() {
    const height = window.top.innerHeight - 277;
    if (height > 0 && this.plHeight != height) {
      this.plHeight = height;
      this.element.style.height = height + "px";
    }
    Base.disp(Base.events.scrollPlayingItemIntoView);
  }
  init() {
    window.addEventListener("resize", (e) => this.adjustPlaylistHeight());
    window.addEventListener(Base.events.adjustPlaylistHeight, (e) => this.adjustPlaylistHeight());
    window.addEventListener(Base.events.scrollItemIntoView, (e) => {
      this.element.scrollTo(e.detail);
    });
    window.addEventListener(Base.events.scrollIndexIntoView, (e) => {
      const scrollHeight = e.detail?.index * 70;
      const detail = { top: scrollHeight, left: 0, behavior: "smooth" };
      this.element.scrollTo(detail);
    });
    //this.element.addEventListener("scroll",(e)=>cl(e));
  }
}