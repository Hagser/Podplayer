const cl = (...e) => console.log(e)
const ao = (o) => alert(JSON.stringify(o))
window.addEventListener("error", (e) => console.error(e))

const head = document.head;
const baseScript = document.createElement('script');
baseScript.setAttribute('src', 'base.js');
head.insertBefore(baseScript, head.firstElementChild);

const fullyLoaded = new Promise(resolve => {
  baseScript.addEventListener('load', () => {
    const taskPromises = [];
    const scripts = "audioplayer;feedlist;playlist;item;feed;sleep;sort;plholder".split(";");
    scripts.forEach(s => {
      const script = document.createElement('script');
      script.setAttribute('src', `${s}.js`);
      taskPromises.push(new Promise(resolve => {
        script.addEventListener('load', resolve);
      }));
      head.insertBefore(script, head.firstElementChild);
    });
    resolve(Promise.all(taskPromises));
  });
});
class App {
  constructor() {
    this.plHolder = new Plholder();
    this.playlist = new Playlist("playlist");
    this.audioPlayer = new AudioPlayer("player", this.playlist);
    this.sort = new Sort("sort", this.playlist);
    this.sleep = new Sleep("sleep");
    this.feedlist = new Feedlist("feedlist");
    this.sort.display()
      .then(() => this.sleep.display())
      .then(() => this.feedlist.fetchPodcasts())
      .catch(ex => ao(ex));
  }
}