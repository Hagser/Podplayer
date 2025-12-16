import Base from './base.js';
import Feed from './feed.js';
import Item from './item.js';

export default
class Feedlist extends Array {
  constructor(feedlistElement) {
    super([]);
    this.element = document.getElementById(feedlistElement);
    this.initFeedlist();
  }

  display() {
    if (!this.element) {
      return;
    }
    this.element.onchange = (el) => {
      this.fetchFeedByIndex(el.srcElement.value, true);
    };
    this.element.innerHTML = "";
    const savedIndex = Base.gi(Base.dataKeys.feedIndex);
    //const initOptions = "-4;stream|-3;alla|-2;senaste 2 veckor|-1;50 nyaste".split("|");
    const initOptions = "-3;alla|-2;senaste 2 veckor|-1;50 nyaste".split("|");
    initOptions.forEach((opt, index) => {
      const [value, text] = opt.split(";");
      Base.createElement({
        type: "option",
        text: text,
        value: value,
        selected: value == savedIndex,
        parent: this.element
      });
    });
    this.forEach((feed, index) => {
      //cl(feed,index)
      Base.createElement({
        type: "option",
        text: feed.title,
        value: feed.index ?? index,
        selected: index == savedIndex,
        parent: this.element
      });
    });
    if (savedIndex && parseInt(savedIndex) < 0) {
      this.element.selectedIndex = parseInt(savedIndex) + 3;
    }
    this.fetchFeedByIndex(savedIndex);
  }
  isNyare(date, millisekunder) {
    const diff = Base.now() - date.getTime();
    return diff < millisekunder;
  }
  taBortAldre(list, millisekunder) {
    return list.filter(item => this.isNyare(new Date(item.date), millisekunder));
  }
  get50Nyaste(list) {
    return Base.sortList(list, "dateAsc").slice(-50);
  }
  getSenasteTvaVeckor(list) {
    const millisekunder = 14 * 24 * 3600 * 1000;
    list = Base.sortList(list, "dateDesc");
    list = this.taBortAldre(list, millisekunder);
    list = Base.sortList(list, "dateAsc");
    return list;
  }
  getStreamlist(list) {
    return list.filter(item => item.stream);
  }
  preLoadList(list) {
    list.forEach(item => {
      item.preLoadedAudio = new Audio(item.audio);
    })
  }
  fetchFeedByIndex(index, force = false) {
    if (index == undefined || index == null || isNaN(parseInt(index)))
      return;
    const savedIndex = Base.gi(Base.dataKeys.feedIndex);
    //cl("fetchFeedByIndex",index,savedIndex,force);
    if (savedIndex === index && !force)
      return;
    Base.si(Base.dataKeys.feedIndex, index);
    if (index >= 0) {
      Base.disp(Base.events.replacePlaylist, {
        list: this[index].list
      });
    } else {
      let tempList = [];
      this.forEach((feed) => {
        this.addList(tempList, feed.list);
      });
      let list = tempList
        //.filter(itm=>!Base.isDeleted(itm))
        .map(itm => new Item(itm))
        .filter(itm => !itm.deleted);

      if (index == -1) {
        list = this.get50Nyaste(list, index);
      } else if (index == -2) {
        list = this.getSenasteTvaVeckor(list);
      } else if (index == -4) {
        list = this.getStreamlist(list);
        this.preLoadList(list);
      }

      Base.disp(Base.events.replacePlaylist, {
        list
      });
    }
  }
  addList(tolist, fromlist) {
    if (fromlist && tolist)
      fromlist.forEach(itm => tolist.push(itm));
    return tolist;
  }
  exists(itm) {
    return this.some((ditm) => {
      return ditm.url == itm.url;
    });
  }
  add(itm) {
    if (!this.exists(itm)) {
      this.push(itm);
    }
  }
  clear() {
    return new Promise(resolve => {
      while (this.length > 0) {
        this.pop();
      }
      resolve();
    });
  }
  replace(list) {
    return this.clear().then(() => {
      list.forEach((feed, index) => {
        this.add(new Feed(feed, index));
      });
    });
  }
  async fetchJson() {
    const response = await fetch(`${Base.baseUrl}fetch_feeds.php`);
    const list = await response.json();
    return list;
  }
  async fetchPodcasts() {
    const savedFeedlist = Base.gi(Base.dataKeys.feedlist);
    Base.cl(savedFeedlist)
    let tempFeedlist;
    if (savedFeedlist && savedFeedlist.length > 0) {
      tempFeedlist = savedFeedlist;
    } else {
      tempFeedlist = await this.fetchJson();
    }
    this.replace(tempFeedlist.map((itm, index) =>
      new Feed(itm, index)
    )).then(() => {
      this.forEach(feed => feed.fetchFeed());
    });
    Base.sd({
      feedlist: this
    });
    setTimeout(() => {
      this.fetchFeedByIndex(Base.gi(Base.dataKeys.feedIndex), true);
    }, 100);
  }

  initFeedlist() {
    let list = Base.gi(Base.dataKeys.feedlist) || [];
    this.replace(list)
      .then(() => this.display());

    window.addEventListener(Base.events.feedUpdated, (e) => {
      const savedIndex = Base.gi(Base.dataKeys.feedIndex);
      if (!savedIndex || savedIndex < 0 || savedIndex == e.detail.index) {
        this.display();
      }
    });
    window.addEventListener(Base.events.refreshPodcasts, (e) => {
      const savedIndex = Base.gi(Base.dataKeys.feedIndex);
      this.filter((feed) => {
        return savedIndex == -1 || savedIndex == feed.index;
      }).forEach((feed) => {
        feed.refreshFeed();
      });
      Base.sd({
        feedlist: this
      });
      this.fetchFeedByIndex(savedIndex);
    });

  }
}