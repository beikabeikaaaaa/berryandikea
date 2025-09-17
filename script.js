// Image paths (adjust if you rename files)
const LOCK_IMG_SRC = "assets/berryikea_lock.jpg";  // 锁屏
const HOME_IMG_SRC = "assets/berryikea_home.jpg";  // 解锁

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
const bgPaws = document.getElementById("bgPaws");

// set images
lockImg.src = LOCK_IMG_SRC;
homeImg.src = HOME_IMG_SRC;

// generate soft background paws
(function genBgPaws(){
  const count = 28;
  const frag = document.createDocumentFragment();
  for (let i=0;i<count;i++){
    const span = document.createElement("span");
    span.textContent = "🐾";
    span.style.position = "absolute";
    span.style.left = Math.random()*100 + "vw";
    span.style.top = Math.random()*100 + "vh";
    span.style.fontSize = (14 + Math.random()*14) + "px";
    span.style.opacity = 0.5 + Math.random()*0.4;
    span.style.transform = `rotate(${Math.random()*40-20}deg)`;
    frag.appendChild(span);
  }
  bgPaws.appendChild(frag);
})();

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
  s1.style.color = "#8b7f73";
  s2.style.color = "#5a5046";
  // hide lock layer
  lockLayer.style.opacity = 0;
  // celebratory hearts & paws
  confettiHearts();
  setTimeout(()=>confettiPaws(), 250);
}

// after unlock: click to spawn BIGGER paw prints (multiple per click)
screenEl.addEventListener("pointerdown", (e) => {
  ripple(e);
  if(homeLayer.classList.contains("active")){
    for(let i=0;i<3;i++){
      setTimeout(()=>spawnPaw(e, i), i*80);
    }
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
function spawnPaw(e, offset=0){
  const rect = screenEl.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left + (Math.random()*20-10);
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top + (Math.random()*10-5);
  const p = document.createElement("span");
  p.className = "paw";
  p.textContent = "🐾";
  p.style.left = `${x}px`; p.style.top = `${y}px`;
  p.style.fontSize = (28 + Math.random()*14) + "px";
  fx.appendChild(p);
  p.addEventListener("animationend", ()=> p.remove());
}

// confetti: hearts on unlock
function confettiHearts(){
  for(let i=0;i<12;i++){
    setTimeout(()=>{
      const span = document.createElement("span");
      span.textContent = "❤️";
      span.style.position = "absolute";
      span.style.left = (Math.random()*0.6 + 0.2) * screenEl.clientWidth + "px";
      span.style.top = (screenEl.clientHeight*0.7 + Math.random()*30) + "px";
      span.style.fontSize = (16 + Math.random()*12) + "px";
      span.style.transform = "translate(-50%,-50%)";
      span.style.animation = "heartUp 1200ms ease-out forwards";
      fx.appendChild(span);
      span.addEventListener("animationend", ()=> span.remove());
    }, i*60);
  }
}
// confetti: paws on unlock
function confettiPaws(){
  for(let i=0;i<10;i++){
    setTimeout(()=>{
      const span = document.createElement("span");
      span.textContent = "🐾";
      span.style.position = "absolute";
      span.style.left = (Math.random()*0.8 + 0.1) * screenEl.clientWidth + "px";
      span.style.top = (screenEl.clientHeight*0.75 + Math.random()*20) + "px";
      span.style.fontSize = (18 + Math.random()*10) + "px";
      span.style.transform = "translate(-50%,-50%)";
      span.style.animation = "heartUp 1200ms ease-out forwards";
      fx.appendChild(span);
      span.addEventListener("animationend", ()=> span.remove());
    }, i*70);
  }
}

// keyframes injected for hearts/paws float up
const style = document.createElement('style');
style.textContent = `@keyframes heartUp{
  0%{opacity:.95; transform:translate(-50%,-50%) scale(.9)}
  70%{transform:translate(-50%,-120%) scale(1.15)}
  100%{opacity:0; transform:translate(-50%,-180%) scale(1)}
}`;
document.head.appendChild(style);
