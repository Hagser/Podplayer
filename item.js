class Item extends Base {
  constructor (itm) {
    super("item");
    this.index = itm.index;
    this.title = itm.title;
    this.audio = itm.audio;
    this.date = itm.date;
    this.image = itm.image;
    this.element = null;
    this.state = null;
    this.preLoadedAudio = null;
    this.showDeleteItem = false;
    this.showAddToList = false;
    this.currentTime = Base.gi(itm.audio + "_currentTime") || 0;
    this.deleted = Base.gi(itm.audio + "_deleted") === true;
    this.duration = Base.gi(itm.audio + "_duration") || 0;
    this.stream = Base.gi(itm.audio + "_stream") === true;
    this.liStart = new Map();
    this.init();
  }

  static deleteItem(el){
    //cl("deleteItem",itemId.id);
    Base.disp(Base.events.deleteItem,{itemId:el.id})
    Base.disp(Base.events.hideDeleteItem,{itemId:el.id});
  }
  static addToList(el){
    //cl("addToList",itemId.id);
    Base.disp(Base.events.addToList,{itemId:el.id});
    Base.disp(Base.events.hideAddToList,{itemId:el.id});
  }
  scrollIntoView() {
    if(this.index){
      //Base.disp(Base.events.scrollIndexIntoView,{index:this.index});
    }
  }

  updateContent() {
    if (this.element) {
      this.element.innerHTML = this.episodeContent;
      this.setAttribute(this.element, this.state);
    }
  }

  setDeleted() {
    this.deleted = true;
    Base.si(this.audio + "_deleted", true);
    this.setState(Base.itemStates.deleted);
  }
  
  setStream() {
    this.stream = true;
    Base.si(this.audio + "_stream", true);
  }
  
  removeAttribute(el, ...attributes) {
    attributes.forEach(attr => {
      if (el && el.hasAttribute(attr))
        el.removeAttribute(attr);
    });
  }

  setAttribute(el, ...attributes) {
    this.removeAttribute(el,
      Base.itemStates.playing,
      Base.itemStates.deleted,
      Base.itemStates.played);
    attributes.forEach(attr => {
      if (el && !el.hasAttribute(attr))
        el.setAttribute(attr, "true");
    });
  }

  get durationPercentage() {
    try {
      if (this.currentTime && this.duration && this.currentTime > 0 && this.duration > 0)
        return Math.round((this.currentTime/this.duration)*100)+"%";
    }
    catch {}
    return "&nbsp;";
  }
  
  formatDate(d) {
    let year = d.getFullYear();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return year+"-"+month+"-"+day;
  }
  
  get episodeContent() {
    let content = "<div class='fullwidth item'>";
    
    const image = "<div class='quarterwidth' style='background: url("+this.image+") no-repeat; background-size:60px;'>&nbsp;</div>";
    const dateAndText = "<div class='halfwidth'>" + this.formatDate(new Date(this.date)) +"<br/>"+ this.maxLength(this.title, 100) + "<br/></div>";
    const duration = "<div class='quarterwidth bigtext'><br/>"+this.durationPercentage +"</div>";

    if (this.showDeleteItem) {
      //content += image;
      //content += dateAndText;
      content += "<div class='fullwidth bigtext deleteItem' onclick='Item.deleteItem("+this.element.id+")'><br/>del</div>";
    } else if (this.showAddToList) {
      content += "<div class='fullwidth bigtext addToList' onclick='Item.addToList("+this.element.id+")'><br/>add</div>";
      //content += dateAndText;
      //content += duration;
    } else {
      content += image;
      content += dateAndText;
      content += duration;
    }
    content += "</div>";
    return content;
  }

  maxLength(txt, len = 200) {
    return (""+txt).substring(0, len);
  }
  
  get played() {
    return this.currentTime > 0;
  }
  
  mapTouch(touches) {
    //cl("mapTouch",touches);
    if (touches && touches.length) {
      const t = touches[0];
      return {x:t.screenX,y:t.screenY,n:(new Date()).getTime()};
    }
    return {x:-1,y:-1};
  }

  getDiff(start, end) {
    const xDiff=start.x-end.x;
    const yDiff=Math.abs(start.y-end.y);
    const age = (Base.now()-start.n);
    const isDel=yDiff<50 && xDiff>20;
    const isAdd=yDiff<50 && xDiff<-20;
    return {
      showDelete:isDel,
      showAdd:isAdd,
      age:age
    }
  }
  drag(e, ev, li) {
    if (e.indexOf("start") > 0) {
      this.liStart.set(li.id, this.mapTouch(ev.touches))
    }
    if (e.indexOf("end") > 0) {
      const start = this.liStart.get(li.id);
      const end = this.mapTouch(ev.changedTouches);
      const diff = this.getDiff(start, end);
      if (diff.showDelete) {
        Base.disp(Base.events.showDeleteItem, {
          itemId: li.id,
          dif: diff
        })
      } else if (diff.showAdd) {
        Base.disp(Base.events.showAddToList, {
          itemId: li.id,
          dif: diff
        })
      }
    }
  }
  
  init() {
    Base.createSetMethods(this, "currentTime,duration,element,state,playbackRate".split(","), ()=> {
      this.updateContent()})
    .then(()=> {
      if (this.deleted) {
        this.setDeleted();
      } else if (this.played) {
        this.setState(Base.itemStates.played);
      }
    });

    if (Base.gi(Base.dataKeys.currentSrc) == this.audio) {
      Base.disp(Base.events.playingItemUpdated, {
        playingItem: this
      });
    }
    window.addEventListener(Base.events.showDeleteItem, (e)=> {
      const itemId = e.detail.itemId;
      if (this.element?.id == itemId) {
        //cl("showDeleteItem",e.detail)
        this.showDeleteItem = true;
        this.showAddToList = false;
        this.updateContent();
        setTimeout(()=>{
          Base.disp(Base.events.hideDeleteItem,e.detail);
        },1500);
      }
    });
    window.addEventListener(Base.events.showAddToList, (e)=> {
        const itemId = e.detail.itemId;
        if (this.element?.id == itemId) {
          //cl("showAddToList",e.detail);
          this.showAddToList = true;
          this.showDeleteItem = false;
          this.updateContent();
          setTimeout(()=>{
            Base.disp(Base.events.hideAddToList,e.detail);
          },1500);
        }
      });
    window.addEventListener(Base.events.addToList, (e)=> {
      const itemId = e.detail.itemId;
      if (this.element?.id == itemId) {
        //cl("addToList",e.detail);
        this.setStream();
      }
    });
    window.addEventListener(Base.events.hideDeleteItem, (e)=> {
      const itemId = e.detail.itemId;
      if (this.element?.id == itemId) {
        //cl("hideDeleteItem",e.detail)
        this.showDeleteItem = false;
        this.updateContent();
      }
    });
    window.addEventListener(Base.events.deleteItem, (e)=> {
      const itemId = e.detail.itemId;
      if (this.element?.id == itemId) {
        //cl("Event deleteItem",e.detail)
        this.setDeleted();
        this.updateContent();
      }
    });
    window.addEventListener(Base.events.hideAddToList, (e)=> {
        const itemId = e.detail.itemId;
        if (this.element?.id == itemId) {
          //cl("hideAddToList",e.detail)
          this.showAddToList = false;
          this.updateContent();
        }
    });
    window.addEventListener(Base.events.playingIndexUpdated, (e) => {
        if (this.index != null && this.index == e.detail.playingIndex) {
          this.setState(Base.itemStates.playing);
        } else if (this.deleted) {
          this.setDeleted();
        } else if (this.played) {
          this.setState(Base.itemStates.played);
        }
    });
  }
}