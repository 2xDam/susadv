(() => {
  const LAST = 74;            // Zielfeld (Felder 0 bis 74 = 15 Reihen mit je 5 Feldern)
  const WAIT = LAST - 1;      // Wartefeld vor dem Ziel
  const COLS = 5;
  const DAYS = 24;
  const KEY = "susadv-v2";
  const TEST = new URLSearchParams(location.search).has("test");

  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const d6 = () => 1 + Math.floor(Math.random() * 6);

  // ---------- Felder ----------
  const SPECIALS = [
    { icon: "🛷", title: "Schlittenfahrt", text: "Der Schlitten nimmt dich mit: 2 Felder vor!", move: 2 },
    { icon: "🎲", title: "Wichtelglück", text: "Die Wichtel schenken dir einen Extrawurf.", reroll: true },
    { icon: "🌨️", title: "Schneegestöber", text: "Du siehst die Hand vor Augen nicht: 2 Felder zurück.", move: -2 },
  ];

  const fields = [];
  let s = 0;
  for (let i = 0; i <= LAST; i++) {
    if (i === 0) fields.push({ type: "start", icon: "🏠" });
    else if (i === LAST) fields.push({ type: "goal", icon: "🎄", title: "JACKPOT!", text: CONTENT.goal });
    else if (i === WAIT) fields.push({ type: "wait", icon: "🏁", title: "Schon am Ziel!", text: "Du hast das Ziel bereits erreicht, wir wissen ja, dass du Würfelglück hast 😉 Ab jetzt gibt es hier jeden Tag eine kleine Überraschung, bis dich an Heiligabend dein letzter Wurf zum Jackpot bringt." });
    else if (i % 6 === 0) fields.push({ type: "special", ...SPECIALS[s++ % SPECIALS.length] });
    else if (i % 6 === 2 || i % 6 === 5) fields.push({ type: "reward", icon: "🎁", title: "Gutschein" });
    else if (i % 6 === 3) fields.push({ type: "task", icon: "⭐", title: "Aufgabe" });
    else fields.push({ type: "plain", icon: "❄️" });
  }

  // Meilensteine gleichmäßig verteilen, jeweils auf das nächstgelegene Ruhefeld
  const BIG = CONTENT.bigGifts.length;
  for (let k = 1; k <= BIG; k++) {
    const ideal = (k * WAIT) / (BIG + 1);
    let best = -1;
    fields.forEach((f, i) => {
      if (f.type === "plain" && (best < 0 || Math.abs(i - ideal) < Math.abs(best - ideal))) best = i;
    });
    if (best > 0) fields[best] = { type: "milestone", icon: "🎀", title: "Wohlfühl-Bonus!" };
  }

  // Quizfragen gleichmäßig auf einen Teil der Aufgabenfelder legen
  const quiz = CONTENT.quiz || [];
  const taskCells = fields.map((f, i) => (f.type === "task" ? i : -1)).filter((i) => i > 0);
  const nQuiz = Math.min(quiz.length, Math.max(0, taskCells.length - 3));
  for (let k = 0; k < nQuiz; k++) {
    const i = taskCells[Math.floor(((k + 0.5) * taskCells.length) / nQuiz)];
    fields[i] = { type: "quiz", icon: "❓", title: "Quizfrage", qi: k, ...quiz[k] };
  }
  // Aufgaben der Reihe nach auf die übrig gebliebenen Aufgabenfelder
  let t = 0;
  fields.forEach((f) => { if (f.type === "task") { f.ti = t++ % CONTENT.tasks.length; f.text = CONTENT.tasks[f.ti]; } });

  // Katzenfotos gleichmäßig auf die übrigen Ruhefelder legen
  const cats = CONTENT.catPhotos || [];
  const rest = fields.map((f, i) => (f.type === "plain" ? i : -1)).filter((i) => i > 0);
  cats.slice(0, rest.length).forEach((p, k) => {
    const i = rest[Math.floor(((k + 0.5) * rest.length) / Math.min(cats.length, rest.length))];
    fields[i] = { type: "cat", icon: "🐾", title: p.title || "Grüße von Enno 🐾", text: p.text, src: p.src };
  });

  // ---------- Spielstand ----------
  const fresh = () => ({ pos: 0, rolls: 0, bonus: 0, seen: [0], sack: [], big: 0, got: [], bag: [], onceWon: [], photo: 0, asked: [], tasksDone: [] });
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

  // Gutschein ziehen: gemischter Stapel, damit sich nicht ständig dasselbe wiederholt
  function drawVoucher() {
    const usable = (i) => CONTENT.vouchers[i] && !(CONTENT.vouchers[i].once && state.onceWon.includes(i));
    state.bag = state.bag.filter(usable);
    if (!state.bag.length) {
      state.bag = CONTENT.vouchers.map((_, i) => i).filter(usable);
      for (let i = state.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.bag[i], state.bag[j]] = [state.bag[j], state.bag[i]];
      }
    }
    const idx = state.bag.pop();
    if (CONTENT.vouchers[idx].once) state.onceWon.push(idx);
    return CONTENT.vouchers[idx];
  }

  // ---------- Brett aufbauen ----------
  const board = $("board"), token = $("token");
  const cells = [];
  if (CONTENT.token === "prinzessin") {
    token.innerHTML = `<span><svg viewBox="0 0 60 82"><use href="#princess"/></svg></span>`;
    token.style.setProperty("--hair", CONTENT.princess.hair);
    token.style.setProperty("--dress", CONTENT.princess.dress);
  } else token.innerHTML = `<span>${CONTENT.token}</span>`;
  $("title").textContent = CONTENT.title;
  document.title = CONTENT.title;

  fields.forEach((f, i) => {
    const row = Math.floor(i / COLS), col = i % COLS, ltr = row % 2 === 0;
    const el = document.createElement("div");
    el.className = `cell ${f.type}`;
    el.style.gridRow = row + 1;
    el.style.gridColumn = (ltr ? col : COLS - 1 - col) + 1;
    if (i < LAST) el.classList.add(col === COLS - 1 ? "to-down" : ltr ? "to-right" : "to-left");
    const face = f.type === "cat" ? `<img class="thumb" src="${f.src.replace("photos/", "photos/thumbs/")}" alt="">` : f.icon;
    el.innerHTML = `${face}<span class="num">${i === 0 ? "Start" : i === LAST ? "Jackpot" : i}</span>`;
    board.appendChild(el);
    cells.push(el);
  });
  cells[LAST].onclick = () => { if (state.pos === LAST || TEST) sardines(); };

  function placeToken() {
    const c = cells[state.pos];
    token.style.transform = `translate(${c.offsetLeft}px, ${c.offsetTop}px)`;
  }

  // ---------- Würfel ----------
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function showDie(die, n) {
    die.classList.toggle("fish", n === "fish");
    [...die.children].forEach((p, i) => p.classList.toggle("on", n !== "fish" && PIPS[n].includes(i)));
    die.setAttribute("aria-label", n === "fish" ? "Würfel zeigt einen Fisch" : `Würfel zeigt ${n}`);
  }
  // Großer 3D-Würfel: springt aus seinem Platz in die Bildschirmmitte, taumelt,
  // prallt zweimal auf, bleibt mit dem Ergebnis nach vorn liegen und kehrt zurück.
  const stage = $("diceStage"), cubeWrap = $("cubeWrap"), cube = $("cube"), cubeShadow = $("cubeShadow");
  const cubeTilt = cubeWrap.firstElementChild, diceSay = $("diceSay");
  for (let n = 1; n <= 6; n++) {
    const face = document.createElement("div");
    face.className = `face f${n}`;
    for (let i = 0; i < 9; i++) {
      const pip = document.createElement("i");
      if (PIPS[n].includes(i)) pip.className = "on";
      face.appendChild(pip);
    }
    cube.appendChild(face);
  }
  // Drehung, die die jeweilige Seite nach vorn bringt: [um X, um Y]
  const FACING = { 1: [0, 0], 2: [-90, 0], 3: [0, -90], 4: [0, 90], 5: [90, 0], 6: [0, 180] };

  async function throwDie(src, result, grand = false) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showDie(src, result);
      await sleep(500);
      return;
    }
    cube.classList.toggle("jackpot", result === "fish");
    (card.open ? card : document.body).appendChild(stage);   // im Dialog liegt er über der Karte

    // Start- und Endpunkt: der kleine Würfel, aus dem er herausspringt
    const r = src.getBoundingClientRect();
    const dx = r.left + r.width / 2 - innerWidth / 2;
    const dy = r.top + r.height / 2 - innerHeight / 2;
    const s0 = r.width / cubeWrap.offsetWidth;
    const H = innerHeight;
    const at = (x, y, sc) => `translate3d(${x}px, ${y}px, 0) scale3d(${sc}, ${sc}, ${sc})`;
    const up = "cubic-bezier(.2,.7,.4,1)", down = "cubic-bezier(.6,0,.9,.45)";
    const duration = grand ? 5200 : 3000;

    src.classList.add("away");
    stage.classList.add("on");

    const [fx, fy] = FACING[result === "fish" ? 1 : result];
    const rnd = () => Math.random() * 360;
    const end = `rotateX(${fx + (grand ? 5 : 3) * 360}deg) rotateY(${fy + (grand ? 4 : 2) * 360}deg) rotateZ(0deg)`;
    cube.animate([
      { transform: `rotateX(${rnd()}deg) rotateY(${rnd()}deg) rotateZ(${rnd() - 180}deg)`, easing: "cubic-bezier(.1,.5,.2,1)" },
      { transform: end, offset: 0.93 },
      { transform: end },
    ], { duration, fill: "forwards" });

    const flight = cubeWrap.animate([
      { offset: 0, transform: at(dx, dy, s0), easing: up },
      { offset: 0.3, transform: at(dx * 0.15, -0.17 * H, 1.25), easing: down },
      { offset: 0.5, transform: at(0, 0, 1), easing: up },
      { offset: 0.63, transform: at(0, -0.07 * H, 1.06), easing: down },
      { offset: 0.76, transform: at(0, 0, 1), easing: up },
      { offset: 0.84, transform: at(0, -0.02 * H, 1.02), easing: down },
      { offset: 0.92, transform: at(0, 0, 1) },
      { offset: 1, transform: at(0, 0, 1) },
    ], { duration, fill: "forwards" });

    const sh = (o, sc) => ({ opacity: o, transform: `scale(${sc})` });
    cubeShadow.animate([
      { offset: 0, ...sh(0, 0.4), easing: up },
      { offset: 0.3, ...sh(0.18, 0.55), easing: down },
      { offset: 0.5, ...sh(0.6, 1), easing: up },
      { offset: 0.63, ...sh(0.35, 0.8), easing: down },
      { offset: 0.76, ...sh(0.6, 1), easing: up },
      { offset: 0.84, ...sh(0.5, 0.93), easing: down },
      { offset: 0.92, ...sh(0.6, 1) },
      { offset: 1, ...sh(0.6, 1) },
    ], { duration, fill: "forwards" });

    await flight.finished;
    // Würfel dreht sich dem Betrachter zu, darunter steht das Ergebnis
    cubeTilt.classList.add("settled");
    diceSay.textContent = result === "fish" ? "Moment mal … ein Fisch?" : `Eine ${result}!`;
    diceSay.classList.add("on");
    await sleep(grand ? 2400 : 1500);   // Ergebnis wirken lassen
    diceSay.classList.remove("on");

    showDie(src, result);
    stage.classList.remove("on");
    const back = cubeWrap.animate(
      [{ transform: at(0, 0, 1) }, { transform: at(dx, dy, s0) }],
      { duration: 650, easing: "cubic-bezier(.5,0,.8,.4)", fill: "forwards" });
    cubeShadow.animate([sh(0.6, 1), sh(0, 0.4)], { duration: 300, fill: "forwards" });
    await back.finished;

    cubeTilt.classList.remove("settled");
    src.classList.remove("away");
    src.classList.remove("pop"); void src.offsetWidth; src.classList.add("pop");
    [...cube.getAnimations(), ...cubeWrap.getAnimations(), ...cubeShadow.getAnimations()].forEach((a) => a.cancel());
  }

  // ---------- Anzeige ----------
  const SACK_ICON = { voucher: "🎁", big: "🎀", wait: "💋" };
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
    else if (state.rolls === DAYS - 1 && open === DAYS && state.bonus === 0) hint = "Heiligabend. Heute ist alles möglich …";
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
    $("sackHint").textContent = state.sack.length
      ? "Tippe ein Geschenk an, sobald du es eingelöst hast."
      : "Noch leer. Gewonnene Geschenke landen hier.";
    state.sack.forEach((g) => {
      const li = document.createElement("li");
      li.className = g.done ? "done" : "";
      li.innerHTML = `<button><span class="gift">${g.done ? "✅" : SACK_ICON[g.kind] || "🎁"}</span><span class="txt"></span><span class="state">${g.done ? "eingelöst" : "offen"}</span></button>`;
      li.querySelector(".txt").textContent = g.text;
      li.querySelector("button").onclick = () => { g.done = !g.done; save(); render(); };
      list.prepend(li);
    });
    placeToken();
  }

  // ---------- Karte ----------
  const KIND = { quiz: "Wie gut kennst du uns?", reward: "Gutschein", task: "Aufgabe", special: "Ereignis", milestone: "Für dich", wait: "Fast geschafft", goal: "Heiligabend", photo: "Erinnerung" };
  const card = $("card"), cardDie = $("cardDie");
  let cardAction = null;   // solange gesetzt, führt der Knopf eine Aktion aus statt zu schließen
  let typing = null;       // läuft gerade die Schreibmaschine?
  const okBtn = $("cardOk"), cardText = $("cardText");

  // Text Buchstabe für Buchstabe aufbauen, als würde ihn jemand live tippen.
  // Ein Tipp auf die Karte schreibt den Rest sofort hin.
  function typeText(text) {
    const chars = Array.from(text);
    const out = document.createElement("span");
    const caret = document.createElement("span");
    caret.className = "caret";
    cardText.replaceChildren(out, caret);
    okBtn.classList.add("waiting");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) chars.length = 0, out.textContent = text;

    return new Promise((res) => {
      let i = 0, timer;
      const done = () => {
        clearTimeout(timer);
        out.textContent = text;
        typing = null;
        setTimeout(() => caret.remove(), 900);
        okBtn.classList.remove("waiting");
        res();
      };
      const next = () => {
        if (i >= chars.length) return done();
        const c = chars[i++];
        out.textContent += c;
        const pause = /[.!?]/.test(c) ? 420 : /[,:;–]/.test(c) ? 240 : c === " " ? 90 : 0;
        timer = setTimeout(next, 55 + Math.random() * 55 + pause);
      };
      typing = { skip: done };
      timer = setTimeout(next, 650);   // kurz warten, bis die Karte aufgeklappt ist
    });
  }

  function openCard(f, okLabel) {
    card.className = `card ${f.type}`;
    $("cardIcon").textContent = f.icon;
    $("cardKind").textContent = KIND[f.type] || "";
    $("cardTitle").textContent = f.title;
    okBtn.textContent = okLabel || "Weiter";
    cardDie.hidden = true;
    okBtn.hidden = false;
    quizBox.hidden = true;
    quizBox.replaceChildren();
    const photo = $("cardPhoto");
    photo.hidden = !f.src;
    if (f.src) photo.src = f.src; else photo.removeAttribute("src");
    card.showModal();
    const closed = new Promise((res) => { closeResolver = res; });
    closed.typed = typeText(f.text);
    return closed;
  }

  // Selbst schließen und Bescheid geben, statt sich auf das "close"-Ereignis
  // zu verlassen (das feuert nicht in jedem Browser zuverlässig)
  let closeResolver = null;
  function closeCard() {
    if (card.open) card.close();
    const res = closeResolver;
    closeResolver = null;
    if (res) res();
  }
  // Nur reagieren, wenn die Karte wirklich zu ist: Das Ereignis kann verspätet
  // eintreffen, wenn schon die nächste Karte offen ist.
  card.addEventListener("close", () => { if (!card.open) closeCard(); });
  card.addEventListener("click", () => { if (typing) typing.skip(); });
  okBtn.onclick = (e) => {
    if (typing) return;                 // der Klick überspringt nur das Tippen
    e.stopPropagation();
    cardAction ? cardAction() : closeCard();
  };
  card.addEventListener("cancel", (e) => {
    e.preventDefault();
    if (typing) typing.skip();
    else if (!cardAction) closeCard();
  });

  // Quiz: Frage tippen, Antworten gemischt zeigen. Liefert true bei richtiger Antwort.
  const quizBox = $("quizAnswers");
  function quizCard(f, bonus = true) {
    const closed = openCard({ ...f, text: f.q }, "Weiter");
    okBtn.hidden = true;
    cardAction = () => {};              // erst antworten, dann geht es weiter
    const opts = f.answers.map((a, i) => ({ a, ok: i === 0 }));
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    let right = false;
    closed.typed.then(() => {
      opts.forEach((o) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = o.a;
        b.onclick = (e) => {
          e.stopPropagation();
          if (quizBox.dataset.done) return;
          quizBox.dataset.done = "1";
          right = o.ok;
          [...quizBox.children].forEach((x, k) => {
            x.disabled = true;
            if (opts[k].ok) x.classList.add("right");
          });
          if (!o.ok) b.classList.add("wrong");
          const note = document.createElement("small");
          note.textContent = (o.ok ? "Richtig! 🎉 " : `Leider nicht. Richtig ist: ${f.answers[0]}. `) + (f.note || "");
          cardText.appendChild(note);
          okBtn.textContent = o.ok && bonus ? "2 Felder vor 🎉" : "Weiter";
          okBtn.hidden = false;
          cardAction = null;
        };
        quizBox.appendChild(b);
      });
      delete quizBox.dataset.done;
      quizBox.hidden = false;
    });
    return closed.then(() => right);
  }

  // Gutschein mit Würfel: erst würfeln, dann wandert er in den Sack
  function voucherCard(v) {
    const closed = openCard({ type: "reward", icon: "🎁", title: "Gutschein", text: v.text.replace("{n}", "?") }, "Würfeln 🎲");
    showDie(cardDie, 1);
    closed.typed.then(() => {
      cardText.insertAdjacentHTML("beforeend", `<small>Jedes Auge zählt ${v.dice}.</small>`);
      cardDie.hidden = false;
    });
    return new Promise((res) => {
      cardAction = async () => {
        cardAction = () => {};
        okBtn.classList.add("waiting");
        const n = d6();
        await throwDie(cardDie, n);
        await sleep(350);
        const text = v.text.replace("{n}", n * v.dice);
        okBtn.textContent = "In den Gabensack";
        await typeText(text);
        cardAction = null;
        state.sack.push({ text, done: false, kind: "voucher" });
        save(); render();
        closed.then(res);
      };
    });
  }

  // ---------- Bewegung ----------
  const passed = [];   // Meilensteine, an denen sie beim letzten Zug vorbeigekommen ist
  async function walk(target) {
    const dir = target > state.pos ? 1 : -1;
    while (state.pos !== target) {
      state.pos += dir;
      if (!state.seen.includes(state.pos)) state.seen.push(state.pos);
      if (fields[state.pos].type === "milestone" && !state.got.includes(state.pos)) passed.push(state.pos);
      token.classList.remove("hop"); void token.offsetWidth; token.classList.add("hop");
      placeToken();
      cells[state.pos].scrollIntoView({ block: "center", behavior: "smooth" });
      await sleep(460);
    }
  }

  async function claimMilestones() {
    while (passed.length) {
      const pos = passed.shift();
      if (state.got.includes(pos)) continue;
      state.got.push(pos);
      const text = CONTENT.bigGifts[state.big++] || "Ein Überraschungsgeschenk";
      state.sack.push({ text, done: false, kind: "big" });
      save(); render();
      await openCard({ type: "milestone", icon: "🎀", title: "Wohlfühl-Bonus!", text }, "In den Gabensack");
    }
  }

  async function move(target) {
    await walk(target);
    await claimMilestones();
  }

  // Nächstes Foto aus einer Liste zeigen; false, wenn alle schon dran waren
  async function showPhoto() {
    const p = (CONTENT.photos || [])[state.photo];
    if (!p) return false;
    state.photo++;
    save();
    await openCard({ type: "photo", icon: "📸", title: "Weißt du noch?", text: p.text, src: p.src }, "Schön ❤️");
    return true;
  }

  // Am Ziel vor Heiligabend: erst offene Quizfragen (danach ein Foto),
  // dann offene Aufgaben, dann übrige Fotos, sonst nur die Ziel-Karte
  async function atFireplace() {
    const quiz = CONTENT.quiz || [];
    const qi = quiz.findIndex((_, i) => !state.asked.includes(i));
    if (qi >= 0) {
      state.asked.push(qi);
      save();
      await quizCard({ type: "quiz", icon: "❓", title: "Quizfrage", ...quiz[qi] }, false);
      await showPhoto();
      return;
    }
    const ti = CONTENT.tasks.findIndex((_, i) => !state.tasksDone.includes(i));
    if (ti >= 0) {
      state.tasksDone.push(ti);
      save();
      await openCard({ type: "task", icon: "⭐", title: "Aufgabe", text: CONTENT.tasks[ti] }, "Erledigt!");
      return;
    }
    if (!(await showPhoto())) await openCard(fields[WAIT]);
  }

  async function land(allowMove) {
    const f = fields[state.pos];
    if (f.type === "quiz") {
      if (!state.asked.includes(f.qi)) state.asked.push(f.qi);
      save();
      if (await quizCard(f)) {
        await move(Math.min(state.pos + 2, WAIT));
        await land(false);
      }
    } else if (f.type === "cat") {
      await openCard({ ...f, type: "photo" }, "Schön ❤️");
    } else if (f.type === "reward") {
      const v = drawVoucher();
      if (v.dice) await voucherCard(v);
      else {
        state.sack.push({ text: v.text, done: false, kind: "voucher" });
        save(); render();
        await openCard({ ...f, text: v.text }, "In den Gabensack");
      }
    } else if (f.type === "task") {
      if (!state.tasksDone.includes(f.ti)) state.tasksDone.push(f.ti);
      save();
      await openCard(f, "Erledigt!");
    } else if (f.type === "special" && allowMove) {
      await openCard(f);
      if (f.reroll) state.bonus++;
      if (f.move) { await move(state.pos + f.move); await land(false); }
    } else if (f.type === "wait") {
      await openCard(f);
    } else if (f.type === "goal") {
      sardines();
      await sleep(3500);
      await openCard(f, "Juhu!");
    }
  }

  async function roll() {
    if (busy || rollsLeft() === 0 || state.pos === LAST) return;
    busy = true; render();

    const usesBonus = state.bonus > 0;
    if (usesBonus) state.bonus--; else state.rolls++;
    const finale = !usesBonus && state.rolls === DAYS;   // letzter Wurf an Heiligabend
    const n = d6();

    await throwDie($("die"), finale ? "fish" : n, finale);
    await sleep(350);

    if (finale) {
      await move(LAST);
      await land(false);
    } else if (state.pos === WAIT) {
      await atFireplace();
    } else {
      await move(Math.min(state.pos + n, WAIT));
      await land(true);
    }

    save();
    busy = false; render();
  }

  // ---------- Sardinen-Jackpot ----------
  const sea = $("sea");
  function sardines() {
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sea.showPopover && !sea.matches(":popover-open")) sea.showPopover();
    const schools = calm ? 2 : 5;
    let longest = 0;
    for (let sc = 0; sc < schools; sc++) {
      const rtl = sc % 2 === 1;
      const y = 8 + Math.random() * 76;
      const start = sc * 2 + Math.random() * 0.6;
      const size = 44 + Math.random() * 26;
      const count = calm ? 6 : 11 + Math.floor(Math.random() * 5);
      for (let k = 0; k < count; k++) {
        const fish = document.createElement("div");
        fish.className = "sardine" + (rtl ? " rtl" : "");
        const dur = (calm ? 16 : 10) + Math.random() * 2.5;
        const delay = start + Math.random() * 1.8;
        fish.style.top = `${y + (Math.random() - 0.5) * 16}vh`;
        fish.style.width = `${size * (0.8 + Math.random() * 0.4)}px`;
        fish.style.animationDuration = `${dur}s`;
        fish.style.animationDelay = `${delay}s`;
        fish.innerHTML = `<svg viewBox="0 0 100 40" style="animation-delay:-${Math.random() * 2}s"><use href="#sardine"/></svg>`;
        fish.addEventListener("animationend", (e) => { if (e.target === fish) fish.remove(); });
        sea.appendChild(fish);
        longest = Math.max(longest, dur + delay);
      }
    }
    clearTimeout(sardines.timer);
    sardines.timer = setTimeout(() => {
      sea.replaceChildren();
      if (sea.hidePopover && sea.matches(":popover-open")) sea.hidePopover();
    }, longest * 1000 + 300);
  }

  // Popover liegt über der Karte; ohne Popover-Unterstützung genügt der z-index
  function liftSea() {
    if (sea.showPopover && sea.matches(":popover-open")) { sea.hidePopover(); sea.showPopover(); }
  }
  card.addEventListener("toggle", liftSea);
  new MutationObserver(() => { if (card.open) liftSea(); }).observe(card, { attributes: true, attributeFilter: ["open"] });

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
    $("testTools").hidden = false;
    $("reset").onclick = () => { state = fresh(); save(); render(); scrollTo({ top: 0 }); };
    $("testFish").onclick = sardines;
  }
  addEventListener("resize", placeToken);
  showDie($("die"), state.pos === LAST ? "fish" : 5);
  showDie(cardDie, 1);
  snow();
  render();
  if (document.fonts) document.fonts.ready.then(placeToken);
})();
