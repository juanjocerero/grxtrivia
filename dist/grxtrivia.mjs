const E = document.getElementById("start-screen"), I = document.getElementById("game-screen"), k = document.getElementById("end-screen"), H = document.getElementById("start-button"), O = document.getElementById("restart-button"), D = document.getElementById("score"), P = document.getElementById("card-counter"), u = document.getElementById("next-card-container"), o = document.getElementById("timeline");
document.getElementById("final-score");
document.getElementById("correct-answers");
document.getElementById("wrong-answers");
const v = document.getElementById("resume-modal"), R = document.getElementById("resume-yes-button"), j = document.getElementById("resume-no-button"), C = document.getElementById("results-modal"), J = document.getElementById("final-score-modal"), K = document.getElementById("correct-answers-modal"), _ = document.getElementById("wrong-answers-modal"), z = document.getElementById("close-results-modal"), F = document.getElementById("play-again-button"), b = "triviaGameState";
let w = [], c = [], l = 0, y = 0, g = 0, d = 0, i = 0, h, p;
async function Q() {
  try {
    const e = await fetch("events.json");
    if (!e.ok) throw new Error(`HTTP error! status: ${e.status}`);
    w = await e.json();
  } catch (e) {
    console.error("No se pudieron cargar los eventos:", e);
  }
}
function U(e) {
  document.readyState === "interactive" || document.readyState === "complete" ? e() : document.addEventListener("DOMContentLoaded", e, { once: !0 });
}
function V() {
  const e = Array.from(o.children).map((n) => ({
    id: parseInt(n.dataset.id, 10),
    isCorrect: n.classList.contains("correct"),
    isIncorrect: n.classList.contains("incorrect")
  })), t = {
    score: l,
    correctAnswers: y,
    wrongAnswers: g,
    currentCardIndex: d,
    gameEvents: c,
    placedCards: e,
    streak: i
  };
  localStorage.setItem(b, JSON.stringify(t));
}
function x() {
  localStorage.removeItem(b);
}
function W(e) {
  l = e.score, y = e.correctAnswers, g = e.wrongAnswers, d = e.currentCardIndex, c = e.gameEvents, i = e.streak || 0, o.innerHTML = "", e.placedCards.forEach((t) => {
    const n = w.find((r) => r.id === t.id);
    if (n) {
      const r = t.isCorrect || t.isIncorrect ? { correct: t.isCorrect } : null;
      T(n, r);
    }
  }), B(), M(0), A(), S(), E.classList.add("hidden"), k.classList.add("hidden"), I.classList.remove("hidden");
}
function X() {
  x();
  const e = /* @__PURE__ */ new Map();
  w.forEach((s) => {
    e.has(s.year) || e.set(s.year, []), e.get(s.year).push(s);
  }), c = Array.from(e.keys()).sort(() => 0.5 - Math.random()).slice(0, 11).map((s) => {
    const a = e.get(s);
    return a[Math.floor(Math.random() * a.length)];
  });
}
function L() {
  X(), l = 0, y = 0, g = 0, d = 0, i = 0, o.innerHTML = "", u.innerHTML = "", h.option("disabled", !1), p.option("disabled", !1);
  const e = Math.floor(Math.random() * c.length), t = c.splice(e, 1)[0];
  M(0), A(), T(t, null, !0), B(), S(), E.classList.add("hidden"), k.classList.add("hidden"), I.classList.remove("hidden");
}
function Z() {
  x(), J.textContent = l, K.textContent = y, _.textContent = g, C.classList.remove("hidden"), I.classList.add("hidden"), o.classList.remove("dense-view", "very-dense-view"), Array.from(o.children).forEach((e) => {
    const t = e.querySelector(".card-content");
    if (t) {
      t.classList.remove("card-blur"), t.querySelector("p").style.display = "block";
      const n = t.querySelector("img");
      n && (n.style.display = "block");
    }
  }), z.onclick = () => {
    C.classList.add("hidden"), E.classList.remove("hidden");
  }, F.onclick = () => {
    C.classList.add("hidden"), L();
  };
}
function ee() {
  h = new Sortable(o, {
    group: { name: "timeline-game", pull: !1, put: !0 },
    sort: !0,
    // Permitir reordenar las cartas no confirmadas
    filter: ".correct, .incorrect, .anchor-card",
    // No permitir mover cartas resueltas o la ancla
    animation: 150,
    ghostClass: "card-ghost",
    onAdd: te
  }), p = new Sortable(u, {
    group: { name: "timeline-game", pull: !0, put: !1 },
    animation: 150,
    ghostClass: "card-ghost"
  });
}
function te(e) {
  const t = e.item;
  t.classList.add("card-in-timeline");
  const n = t.querySelector(".card-content");
  if (t.querySelector(".confirm-overlay")) return;
  n && n.classList.add("card-blur");
  const r = document.createElement("div");
  r.className = "confirm-overlay", r.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  const s = document.createElement("button");
  s.textContent = "Confirmar", s.className = "bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg", r.appendChild(s), t.appendChild(r), s.addEventListener("click", (a) => {
    a.stopPropagation();
    const f = Array.from(o.children).indexOf(t);
    ne(t, f);
  }, { once: !0 });
}
function B() {
  const e = o.children.length;
  o.classList.remove("dense-view", "very-dense-view"), e >= 8 ? o.classList.add("very-dense-view") : e >= 5 && o.classList.add("dense-view");
}
function ne(e, t) {
  e.querySelector(".confirm-overlay").remove();
  const n = e.querySelector(".card-content");
  n && n.classList.remove("card-blur"), h.option("disabled", !0), p.option("disabled", !0);
  const r = o.querySelector(".anchor-card");
  r && r.classList.remove("anchor-card");
  const s = parseInt(e.dataset.year, 10), a = Array.from(o.children), m = a[t - 1], f = a[t + 1], N = m ? parseInt(m.dataset.year, 10) : -1 / 0, Y = f ? parseInt(f.dataset.year, 10) : 1 / 0, $ = s > N && s < Y;
  if (e.querySelector(".year-badge").classList.remove("hidden"), $) {
    i++;
    const G = 1 + i;
    e.classList.add("correct"), M(G), y++;
  } else
    i = 0, e.classList.add("incorrect"), g++;
  B(), d++, d >= c.length ? setTimeout(Z, 1200) : (V(), A(), S(), h.option("disabled", !1), p.option("disabled", !1));
}
function q(e, t) {
  const n = document.createElement("div");
  n.dataset.id = e.id, n.dataset.year = e.year, n.className = "card bg-white p-4 rounded-lg shadow-lg w-full max-w-md mx-auto relative", n.classList.toggle("cursor-move", t);
  let r = "";
  return e.image && (r = `<img src="${e.image}" alt="${e.title}" class="w-full h-32 object-cover my-2 rounded">`), n.innerHTML = `
        <div class="card-content">
            <h3 class="font-bold text-lg text-gray-900">${e.title}</h3>
            <p class="text-gray-700 text-sm">${e.description}</p>
            ${r}
            <div class="year-badge hidden absolute top-2 right-2 bg-gray-200 text-xs font-bold px-2 py-1 rounded text-gray-800">${e.isApproximate ? "Circa" : ""} ${e.year}</div>
        </div>
    `, n;
}
function T(e, t, n = !1) {
  const r = q(e, !1);
  r.classList.add("card-in-timeline"), n ? (r.classList.add("anchor-card"), r.querySelector(".year-badge").classList.remove("hidden")) : t && (r.querySelector(".year-badge").classList.remove("hidden"), r.classList.add(t.correct ? "correct" : "incorrect"));
  const s = [...o.children], a = s.findIndex((m) => parseInt(m.dataset.year, 10) > e.year);
  a === -1 ? o.appendChild(r) : o.insertBefore(r, s[a]);
}
function S() {
  if (d < c.length) {
    const e = c[d], t = q(e, !0);
    u.innerHTML = "", u.appendChild(t);
  } else
    u.innerHTML = '<div class="text-center text-gray-500">¡No hay más cartas!</div>';
}
function M(e) {
  e !== 0 && (l += e), D.textContent = l;
}
function A() {
  P.textContent = `${d + 1}/${c.length}`;
}
U(() => {
  Q().then(() => {
    ee();
    const e = localStorage.getItem(b);
    e && re(JSON.parse(e)), H.addEventListener("click", L), O.addEventListener("click", L);
  });
});
function re(e) {
  v.classList.remove("hidden"), R.onclick = () => {
    W(e), v.classList.add("hidden");
  }, j.onclick = () => {
    x(), v.classList.add("hidden");
  };
}
