// ------ Replace paths with your filenames if needed ------
const LOCK_IMG_SRC = "berryikea_lock.jpg";  // 锁屏
const HOME_IMG_SRC = "berryikea_home.jpg";  // 解锁
// --------------------------------------------------------

const screenEl = document.getElementById("screen");
const lockLayer = document.getElementById("lockLayer");
const homeLayer = document.getElementById("homeLayer");
const lockImg = document.getElementById("lockImg");
const homeImg = document.getElementById("homeImg");
const knob = document.getElementById("knob");
const slideHint = document.getElementById("slideHint");
const fx = document.getElementById("fx");
const s1 = document.querySelector(".s1");
const s2 = document.querySelector(".s2");

// set images
lockImg.src = LOCK_IMG_SRC;
homeImg.src = HOME_IMG_SRC;

// clock text
const tNow = document.getElementById("timeNow");
const dNow = document.getElementById("dateNow");
function refreshClock(){
  const d = new Date();
  tNow.textContent = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  dNow.textContent = d.toLocaleDateString([], {weekday:'short', month:'short', day:'2-digit'});
}
refreshClock();
setInterval(refreshClock, 1000);

let dragging = false;
let startX = 0;
let knobX = 0;
const knobMin = 4;
const trackWidth = () => lockLayer.querySelector(".slider").clientWidth;
const knobMax = () => trackWidth() - knob.clientWidth - 4;
const unlockThreshold = () => trackWidth() * 0.72;

// pointer events for drag-to-unlock
knob.addEventListener("pointerdown", (e) => {
  dragging = true;
  startX = e.clientX ?? e.touches?.[0]?.clientX;
  knob.setPointerCapture?.(e.pointerId);
  ripple(e);
});

window.addEventListener("pointermove", (e) => {
  if(!dragging) return;
  const x = e.clientX ?? e.touches?.[0]?.clientX;
  const dx = x - startX;
  knobX = Math.max(knobMin, Math.min(knobMax(), knobMin + dx));
  knob.style.left = knobX + "px";
  slideHint.style.opacity = Math.max(0, 1 - knobX / unlockThreshold());
});

window.addEventListener("pointerup", () => {
  if(!dragging) return;
  dragging = false;
  if (knobX >= unlockThreshold()){
    doUnlock();
  } else {
    // snap back
    knobX = knobMin; knob.style.left = knobX + "px"; slideHint.style.opacity = 1;
  }
});

// keyboard unlock (Space)
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && homeLayer.classList.contains("active") === false){
    doUnlock();
  }
});

// unlock sequence
function doUnlock(){
  // show home
  homeLayer.classList.add("active");
  // visually dim first sentence & brighten second
  s1.style.color = "#9fb0c6";
  s2.style.color = "#e9eef7";
  // move lock layer behind
  lockLayer.style.opacity = 0;
  // small success ripple mid-screen
  rippleAt(screenEl.clientWidth*0.5, screenEl.clientHeight*0.8);
}

// after unlock: click to spawn paw prints
screenEl.addEventListener("pointerdown", (e) => {
  ripple(e);
  if(homeLayer.classList.contains("active")){
    spawnPaw(e);
  }
});

// helpers
function ripple(e){
  const rect = screenEl.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
  rippleAt(x, y);
}
function rippleAt(x, y){
  const r = document.createElement("span");
  r.className = "ripple";
  r.style.left = `${x}px`; r.style.top = `${y}px`;
  fx.appendChild(r);
  r.addEventListener("animationend", ()=> r.remove());
}
function spawnPaw(e){
  const rect = screenEl.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
  const p = document.createElement("span");
  p.className = "paw";
  p.textContent = "🐾";
  p.style.left = `${x}px`; p.style.top = `${y}px`;
  fx.appendChild(p);
  p.addEventListener("animationend", ()=> p.remove());
}
