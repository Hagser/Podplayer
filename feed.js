class Feed extends Base {
  static timeoutInMilliseconds=600000;
  constructor (itm,index) {
    super("feed");
    this.index=index;
    this.url = itm.url;
    this.limit = Math.min(itm.limit || 10, 25);
    this.image = Base.gi(this.url+"_image") || itm.image;
    this.title = Base.gi(this.url+"_title") || itm.title;
    this.list = Base.gi(this.url) || [];
    this.lastupdated = Base.gi(this.url+"_lastupdated") || 0;
  }
  
  saveTitle(){
    Base.si(this.url+"_title", this.title);
  }
  saveImage(){
    Base.si(this.url+"_image", this.image);
  }
  saveList(){
    Base.si(this.url,this.list);
  }
  setLastUpdated() {
    Base.si(this.url+"_lastupdated", Base.now());
  }
  shallUpdate() {
    if (this.list.length < 1) {
      return true;
    }
    return (Base.now()-this.lastupdated) > Feed.timeoutInMilliseconds;
  }
  async refreshFeed() {
    await this.fetchFeed();
  }
  async fetchJson(){
    const response = await fetch(`${Base.baseUrl}fetch_feed.php?url=${this.url}&limit=${this.limit}`);
    return await response.json();
  }
  async resolveTitle(){
    this.list.forEach((itm)=> {
      if (this.title != null && this.image != null) {
        return;
      }
      if (this.title == null) {
        this.title = itm.name + " (" + this.list.length +")";
        this.saveTitle();
      }
      if (this.image == null) {
        this.image = itm.image;
        this.saveImage();
      }
    });
  }
  async fetchFeed() {
    if (this.shallUpdate()) {
      this.list = await this.fetchJson();
    }
    const tempList = this.list.filter(itm => !itm.deleted);
    this.list = tempList;
    this.title = null;

    await this.resolveTitle();
    this.saveList();
    Base.disp(Base.events.feedUpdated,{url:this.url,index:this.index});
    this.setLastUpdated();
  }
}