class Playlist extends Array {
  constructor(playlistEl,list=[]) {
    super(list);
    this.element = document.getElementById(playlistEl);
    this.initPlaylist();
  }

  add(itm) {
    if (!this.exists(itm)) {
      this.push(itm);
    }
  }
  exists(itm) {
    return this.some((ditm)=> {
      return ditm.audio == itm.audio;
    });
  }
  clear() {
    return new Promise(resolve=>{
      while (this.length > 0){
        this.pop();
      }
      resolve();
    });
  }
  replace(list) {
    this.clear()
    .then(()=>{
      list.forEach((itm)=> {
        this.add(new Item(itm));
      });
    })
    .then(()=>{
      this.display();
      Base.disp(Base.events.replacedPlaylist);
    });
  }
  createListItem(ep, index){
    const li = document.createElement("li");
    li.id = "li"+index;
    if (ep.episodeContent) {
      li.innerHTML = ep.episodeContent;
    }
    li.addEventListener("click", () => {
      Base.disp(Base.events.loadIndex, {index});
    });
    /*
    "touchstart;touchend".split(";")
    .forEach(e=>{
      li.addEventListener(e,(ev)=>{ 
        ep.drag(e,ev,li);
      }); 
    });
    */
    return li;
  }
  display() {
    if(!this.element){
      return;
    }
    this.element.innerHTML = "";
    this.forEach((ep, index) => {
      const li = this.createListItem(ep,index);
      
      ep.index=index;
      if(ep.setElement){
        ep.setElement(li);
      } else {
        ep.element=li;
      }
      
      this.element.appendChild(li);
    });
    //cl(this.map(i=>{return i.index}).join(","))

    Base.disp(Base.events.adjustPlaylistHeight);
  }
  initPlaylist(){
    //cl(this instanceof StreamList)
    window.addEventListener(Base.events.displayPlaylist,()=>{ this.display();});
    window.addEventListener(Base.events.refreshPodcasts,()=>{ this.clear();});
    window.addEventListener(Base.events.replacePlaylist, (e) => {
      this.replace(e.detail.list);
    });
  }
}