(() => {
  const LAST = 74;            // Zielfeld (Felder 0 bis 74 = 15 Reihen mit je 5 Feldern)
  const WAIT = LAST - 1;      // Wartefeld vor dem Ziel
  const COLS = 5;
  const DAYS = 24;
  const KEY = "susadv-v1";
  const TEST = new URLSearchParams(location.search).has("test");

  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- Felder ----------
  const SPECIALS = [
    { icon: "🛷", title: "Schlittenfahrt", text: "Der Schlitten nimmt dich mit: 2 Felder vor!", move: 2 },
    { icon: "🎲", title: "Wichtelglück", text: "Die Wichtel schenken dir einen Extrawurf.", reroll: true },
    { icon: "🌨️", title: "Schneegestöber", text: "Du siehst die Hand vor Augen nicht: 2 Felder zurück.", move: -2 },
  ];

  const fields = [];
  let r = 0, t = 0, s = 0;
  for (let i = 0; i <= LAST; i++) {
    if (i === 0) fields.push({ type: "start", icon: "🏠" });
    else if (i === LAST) fields.push({ type: "goal", icon: "🎄", title: "Heiligabend", text: CONTENT.goal });
    else if (i === WAIT) fields.push({ type: "wait", icon: "🔥", title: "Am Kamin", text: "Du bist fast da. Hier wärmst du dich auf, bis an Heiligabend dein letzter Wurf dich zum Baum bringt." });
    else if (i % 6 === 0) fields.push({ type: "special", ...SPECIALS[s++ % SPECIALS.length] });
    else if (i % 6 === 2 || i % 6 === 5) fields.push({ type: "reward", icon: "🎁", title: "Geschenk", text: CONTENT.rewards[r++ % CONTENT.rewards.length] });
    else if (i % 6 === 3) fields.push({ type: "task", icon: "⭐", title: "Aufgabe", text: CONTENT.tasks[t++ % CONTENT.tasks.length] });
    else fields.push({ type: "plain", icon: "❄️" });
  }

  // ---------- Spielstand ----------
  const fresh = () => ({ pos: 0, rolls: 0, bonus: 0, seen: [0], sack: [] });
  let state = fresh();
  try { state = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) { /* ohne Speicher spielbar */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignorieren */ } };

  // Wie viele Türchen sind schon offen? (0 vor dem 1. Dezember)
  function openDays() {
    if (TEST) return DAYS;
    const now = new Date();
    return now.getMonth() === 11 ? Math.min(now.getDate(), DAYS) : 0;
  }
  const rollsLeft = () => Math.max(0, openDays() - state.rolls) + state.bonus;

  // ---------- Brett aufbauen ----------
  const board = $("board"), token = $("token");
  const cells = [];
  token.innerHTML = `<span>${CONTENT.token}</span>`;
  $("title").textContent = CONTENT.title;
  document.title = CONTENT.title;

  fields.forEach((f, i) => {
    const row = Math.floor(i / COLS), col = i % COLS, ltr = row % 2 === 0;
    const el = document.createElement("div");
    el.className = `cell ${f.type}`;
    el.style.gridRow = row + 1;
    el.style.gridColumn = (ltr ? col : COLS - 1 - col) + 1;
    if (i < LAST) el.classList.add(col === COLS - 1 ? "to-down" : ltr ? "to-right" : "to-left");
    el.innerHTML = `<span class="num">${i === 0 ? "Start" : i === LAST ? "Ziel" : i}</span>${f.icon}`;
    board.appendChild(el);
    cells.push(el);
  });

  function placeToken() {
    const c = cells[state.pos];
    token.style.transform = `translate(${c.offsetLeft}px, ${c.offsetTop}px)`;
  }

  // ---------- Anzeige ----------
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function showDie(n) {
    [...$("die").children].forEach((p, i) => p.classList.toggle("on", PIPS[n].includes(i)));
    $("die").setAttribute("aria-label", `Würfel zeigt ${n}`);
  }

  let busy = false;
  function render() {
    cells.forEach((c, i) => {
      c.classList.toggle("visited", state.seen.includes(i) && i !== state.pos);
      c.classList.toggle("here", i === state.pos);
    });

    const now = new Date(), open = openDays(), left = rollsLeft();
    $("statDay").textContent = TEST ? "Testmodus" : now.toLocaleDateString("de-DE", { day: "numeric", month: "long" });
    $("statRolls").textContent = left;
    $("statPos").textContent = `${state.pos} / ${LAST}`;

    let hint;
    if (state.pos === LAST) hint = "Frohe Weihnachten! 🎄";
    else if (left > 0) hint = left === 1 ? "Dein Wurf für heute wartet." : `${left} Würfe warten auf dich.`;
    else if (open === 0) {
      const dec1 = new Date(now.getFullYear(), 11, 1);
      const days = Math.ceil((dec1 - now) / 864e5);
      hint = days > 0 ? `Noch ${days} ${days === 1 ? "Tag" : "Tage"} bis zum 1. Dezember.` : "Im Dezember geht es wieder los.";
    } else hint = "Morgen darfst du wieder würfeln.";
    $("dockHint").textContent = hint;
    $("roll").disabled = busy || left === 0 || state.pos === LAST;

    const list = $("sackList");
    list.innerHTML = "";
    $("sackHint").hidden = state.sack.length > 0 && state.sack.every((g) => g.done);
    state.sack.forEach((g, i) => {
      const li = document.createElement("li");
      li.className = g.done ? "done" : "";
      li.innerHTML = `<button><span class="gift">${g.done ? "✅" : "🎁"}</span><span class="txt"></span><span class="state">${g.done ? "eingelöst" : "offen"}</span></button>`;
      li.querySelector(".txt").textContent = g.text;
      li.querySelector("button").onclick = () => { g.done = !g.done; save(); render(); };
      list.prepend(li);
    });
    placeToken();
  }

  // ---------- Karte ----------
  const KIND = { reward: "Geschenk", task: "Aufgabe", special: "Ereignis", wait: "Fast geschafft", goal: "Ziel erreicht" };
  function showCard(f, okLabel) {
    const card = $("card");
    card.className = `card ${f.type}`;
    $("cardIcon").textContent = f.icon;
    $("cardKind").textContent = KIND[f.type] || "";
    $("cardTitle").textContent = f.title;
    $("cardText").textContent = f.text;
    $("cardOk").textContent = okLabel || "Weiter";
    card.showModal();
    return new Promise((res) => card.addEventListener("close", res, { once: true }));
  }
  $("cardOk").onclick = () => $("card").close();

  // ---------- Bewegung ----------
  async function walk(target) {
    const dir = target > state.pos ? 1 : -1;
    while (state.pos !== target) {
      state.pos += dir;
      if (!state.seen.includes(state.pos)) state.seen.push(state.pos);
      token.classList.remove("hop"); void token.offsetWidth; token.classList.add("hop");
      placeToken();
      cells[state.pos].scrollIntoView({ block: "center", behavior: "smooth" });
      await sleep(240);
    }
  }

  async function land(allowMove) {
    const f = fields[state.pos];
    if (f.type === "reward") {
      state.sack.push({ text: f.text, done: false });
      save(); render();
      await showCard(f, "In den Gabensack");
    } else if (f.type === "task") {
      await showCard(f, "Erledigt!");
    } else if (f.type === "special" && allowMove) {
      await showCard(f);
      if (f.reroll) state.bonus++;
      if (f.move) { await walk(state.pos + f.move); await land(false); }
    } else if (f.type === "wait" || f.type === "goal") {
      await showCard(f, f.type === "goal" ? "Juhu!" : "Weiter");
    }
  }

  async function roll() {
    if (busy || rollsLeft() === 0 || state.pos === LAST) return;
    busy = true; render();

    const usesBonus = state.bonus > 0;
    if (usesBonus) state.bonus--; else state.rolls++;
    const finale = !usesBonus && state.rolls === DAYS;   // letzter Wurf an Heiligabend
    const n = 1 + Math.floor(Math.random() * 6);

    $("die").classList.add("rolling");
    for (let i = 0; i < 6; i++) { showDie(1 + Math.floor(Math.random() * 6)); await sleep(80); }
    showDie(n);
    $("die").classList.remove("rolling");
    await sleep(350);

    if (finale) {
      await walk(LAST);
      await land(false);
    } else if (state.pos === WAIT) {
      const text = CONTENT.waiting[Math.floor(Math.random() * CONTENT.waiting.length)];
      state.sack.push({ text, done: false });
      await showCard({ type: "reward", icon: "💋", title: "Trostpreis am Kamin", text }, "In den Gabensack");
    } else {
      await walk(Math.min(state.pos + n, WAIT));
      await land(true);
    }

    save();
    busy = false; render();
  }

  // ---------- Schnee ----------
  function snow() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = $("snow");
    for (let i = 0; i < 28; i++) {
      const f = document.createElement("span");
      f.textContent = "❄";
      f.style.left = Math.random() * 100 + "vw";
      f.style.fontSize = 8 + Math.random() * 14 + "px";
      f.style.opacity = 0.25 + Math.random() * 0.5;
      f.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
      f.style.animationDuration = 9 + Math.random() * 12 + "s";
      f.style.animationDelay = -Math.random() * 20 + "s";
      box.appendChild(f);
    }
  }

  // ---------- Start ----------
  $("roll").onclick = roll;
  if (TEST) {
    $("reset").hidden = false;
    $("reset").onclick = () => { state = fresh(); save(); render(); scrollTo({ top: 0 }); };
  }
  addEventListener("resize", placeToken);
  showDie(5);
  snow();
  render();
  if (document.fonts) document.fonts.ready.then(placeToken);
})();
