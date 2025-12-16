import Base from './base.js';

export default
class Sort extends Base {
  #sortPlaylistTimerId = -1;
  constructor(sortEl, playlist) {
    super(sortEl);
    //this.sortPlaylistTimerId=-1;
    this.playlist = playlist;
    this.init();
  }
  static sortOptions = Object.freeze({
    dateDesc: "Nyast",
    dateAsc: "Äldst",
    titleAsc: "Titel (A–Ö)",
    titleDesc: "Titel (Ö–A)",
    durationAsc: "Kortast",
    durationDesc: "Längst"
  });

  sortPlaylistTimed() {
    clearTimeout(this.#sortPlaylistTimerId);
    this.#sortPlaylistTimerId = setTimeout(() => {
      this.sortPlaylist()
    }, 500);
  }
  sortPlaylist(option = undefined) {
    const sortOption = option ?? this.element.value;
    Base.sd({ sortOption });
    Base.sortList(this.playlist, sortOption);
    Base.disp(Base.events.displayPlaylist);
  }

  display() {
    return new Promise((resolve, reject) => {
      try {
        const sortOption = Base.gi(Base.dataKeys.sortOption);

        this.element.innerHTML = "";
        Object.keys(Sort.sortOptions).forEach((option) => {
          Base.createElement({
            type: "option",
            text: Sort.sortOptions[option],
            value: option,
            selected: option == sortOption,
            parent: this.element
          });
        });
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }
  init() {
    window.addEventListener(Base.events.replacedPlaylist, (e) => {
      this.sortPlaylistTimed();
    });
    this.element.addEventListener("change", (el) => {
      this.sortPlaylist(el.srcElement.value)
    });
  }
}