const PALETTES = {
  blossom: ["#ff3b8f", "#ff66a6", "#ff9ac6", "#ffd1e6"],
  bubbles: ["#00aaff", "#7fd5ff", "#dff7ff", "#0066aa"],
  buttercup: ["#2ecc71", "#1a8f4f", "#0b3d2e", "#66ff66"]
};

let active = null;
let color = null;

const palette = document.getElementById("palette");
const activeName = document.getElementById("active-name");

const btnBlossom = document.getElementById("btn-blossom");
const btnBubbles = document.getElementById("btn-bubbles");
const btnButtercup = document.getElementById("btn-buttercup");

function setActive(member, name) {
  active = member;
  activeName.textContent = name;

  btnBlossom.classList.toggle("is-active", member === "blossom");
  btnBubbles.classList.toggle("is-active", member === "bubbles");
  btnButtercup.classList.toggle("is-active", member === "buttercup");

  renderPalette(PALETTES[member]);
  document.getElementById("add-sound").disabled = false;
}

function renderPalette(colors) {
  palette.innerHTML = "";
  color = colors[0];

  colors.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "swatch" + (i === 0 ? " selected" : "");
    b.style.background = c;
    b.onclick = () => {
      color = c;
      document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
      b.classList.add("selected");
    };
    palette.appendChild(b);
  });
}

btnBlossom.onclick = () => setActive("blossom", "Thi (Blossom)");
btnBubbles.onclick = () => setActive("bubbles", "Delaram (Bubbles)");
btnButtercup.onclick = () => setActive("buttercup", "Abi (Buttercup)");

/* Canvas drawing */
const canvas = document.getElementById("paint");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 14;
ctx.lineCap = "round";

let drawing = false;

canvas.onmousedown = e => {
  if (!active) return;
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
};

canvas.onmousemove = e => {
  if (!drawing) return;
  ctx.strokeStyle = color;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

window.onmouseup = () => drawing = false;

document.getElementById("tool-clear").onclick = () =>
  ctx.clearRect(0, 0, canvas.width, canvas.height);
