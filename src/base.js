export default
class Base {
  static baseUrl = "https://pod.hagser.se/";
  constructor(from) {
    this.element = Base.getElementById(from);
  }
  static itemStates = Object.freeze({
    playing: "data-playing",
    played: "data-played",
    deleted: "data-deleted"
  });
  static events = Object.freeze({
    displayPlaylist: "displayPlaylist",
    replacedPlaylist: "replacedPlaylist",
    adjustPlaylistHeight: "adjustPlaylistHeight",
    playIndex: "playIndex",
    loadIndex: "loadIndex",
    refreshPodcasts: "refreshPodcasts",
    replacePlaylist: "replacePlaylist",
    playerPause: "playerPause",
    playingIndexUpdated: "playingIndexUpdated",
    playingItemUpdated: "playingItemUpdated",
    feedUpdated: "feedUpdated",
    deleteItem: "deleteItem",
    showDeleteItem: "showDeleteItem",
    showAddToList: "showAddToList",
    hideDeleteItem: "hideDeleteItem",
    hideAddToList: "hideAddToList",
    addToList: "addToList",
    scrollItemIntoView: "scrollItemIntoView",
    scrollIndexIntoView: "scrollIndexIntoView",
    scrollPlayingItemIntoView: "scrollPlayingItemIntoView",
    hideMenu: "hideMenu",
    showMenu: "showMenu"
  });
  static dataKeys = Object.freeze({
    playingIndex: "playingIndex",
    playingItem: "playingItem",
    playbackRate: "playbackRate",
    feedlist: "feedlist",
    playlist: "playlist",
    feedIndex: "feedIndex",
    sortOption: "sortOption",
    currentSrc: "currentSrc",
    streamlist: "streamlist"
  });
  static createElement(config) {
    const { id, type, text, value, selected, parent } = config;
    if (!type) {
      throw new Error(`config saknar type!`)
    }
    const el = document.createElement(type);
    if (id) {
      el.id = id;
    }
    el.text = text || value;
    el.value = value;
    el.selected = Base.selectedMapper(selected);
    if (parent) {
      parent.appendChild(el);
    }
    return el;
  }
  static resetAll() {
    const itemsToDelete = "feedlist;playlist;playingIndex;playingItem;playbackRate".split(";");
    itemsToDelete.forEach((itm) => localStorage.removeItem);
    document.reload();
  }
  static refreshPodcasts() {
    Base.disp(Base.events.refreshPodcasts, {});
  }
  static getElementById(id) {
    return document.getElementById(id);
  }
  static gi(key) {
    const val = localStorage.getItem(key);
    if (key == Base.dataKeys.streamlist) {
      cl(key, val)
    }
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
  static sd(data) {
    const key = Object.keys(data)[0];
    const val = data[key];
    if (key && val)
      Base.si(key, val);
  }
  static si(key, val) {
    if (key == Base.dataKeys.streamlist) {
      cl(key, val)
    }
    localStorage.setItem(key, JSON.stringify(val));
    if (key == Base.dataKeys.playingIndex) {
      Base.disp(Base.events.playingIndexUpdated, { playingIndex: parseInt(val) });
    }
  }
  static disp(name, detail = {}) {
    //cl(...arguments)
    return new Promise(resolve => {
      window.dispatchEvent(new CustomEvent(name, {
        detail
      }));
      resolve();
    });
  }
  static now() {
    return (new Date()).getTime();
  }

  static selectedMapper(boolean) {
    return boolean ? "selected" : "";
  }

  static ucaseFirst(txt) {
    const first = txt.substring(0, 1);
    const rest = txt.substring(1, txt.length);
    const res = first.toUpperCase() + rest;
    return res;
  }

  static createSetMethods(target, methods, aspect = null) {
    return new Promise(resolve => {
      //const {aspect,prefix}=config;
      methods.forEach(prop => {
        target["set" + Base.ucaseFirst(prop)] = (arg) => {
          target[prop] = arg;
          Base.si(prop, arg);
          if (aspect) {
            aspect.apply();
          }
        };
      });
      resolve();
    });
  }

  static createGetMethods(target, methods, config = null) {
    return new Promise((resolve, reject) => {
      try {
        const { aspect, prefix } = config;
        methods.forEach(prop => {
          target["get" + Base.ucaseFirst(prop)] = () => {
            if (aspect) {
              aspect.apply();
            }
            const val = Base.gi(prop) ?? target[prop];
            target[prop] = val;
            return val;
          };
        });
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  static sortList(list, option) {
    list.sort((a, b) => {
      switch (option) {
        case "titleAsc":
          return a.title.localeCompare(b.title);
        case "titleDesc":
          return b.title.localeCompare(a.title);
        case "dateDesc":
          return b.date - a.date; // Nyaste först
        case "dateAsc":
          return a.date - b.date; // Äldsta först
        case "durationDesc":
          return b.duration - a.duration;
        case "durationAsc":
          return a.duration - b.duration;
        default:
          return 0;
      }
    });
    return list;
  }
  static cl(...args) {
    console.log(...args);
  }
}