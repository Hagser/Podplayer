export const cl = (...e) => console.log(...e)
export const ce = (...e) => console.error(...e)
export const ao = (o) => alert(JSON.stringify(o))
//window.addEventListener("error", (e) => console.error(e))
import Plholder from './plholder.js';
import Playlist from './playlist.js';
import AudioPlayer from './audioplayer.js';
import Sort from './sort.js';
import Sleep from './sleep.js';
import Feedlist from './feedlist.js';

export default
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
      .catch(ex => ce(ex));
  }
}
window.addEventListener("load", function () {
  console.log("Starting App",new App());
});