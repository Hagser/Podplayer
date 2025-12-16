/**
 * @jest-environment jsdom
 */

import playlist from "../src/playlist.js";
import Item from "../src/item.js";
let pl;
beforeEach(() => {
    document.body.innerHTML = `
  <div id="plHolder">
    <ul id="playlist" class="fullwidth"></ul>
  </div>`;
    pl = new playlist("playlist",[]);
});
const testItem = new Item({audio:"test.mp3",title:"test"});
test("test playlist", () => {
    expect(playlist).toBeDefined();
    expect(pl.exists(testItem)).toBeFalsy();

});
test("test playlist add", () => {
    pl.add(testItem);
    expect(pl.exists(testItem)).toBeTruthy();

});
test("test playlist clear", () => {
    pl.add(testItem);
    pl.clear();
    expect(pl.exists(testItem)).toBeFalsy();

});
test("test playlist display", async () => {
    pl.add(testItem);
    await pl.display();
    expect(pl.element).toBeDefined();
    //expect(pl.element.innerHTML).not.toBe("");
    
    console.log(pl.element.innerHTML);

});


