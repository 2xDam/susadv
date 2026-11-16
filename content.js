// Hier passt du das Spiel an: Texte, Gutscheine, Geschenke und Aufgaben.
const CONTENT = {
  title: "Adventsspiel",          // z. B. "Annas Adventsspiel"
  token: "🦌",                     // Spielfigur

  // Rote Felder: Gutscheine, die sie bei dir einlösen kann.
  // Landet sie auf einem roten Feld, wird zufällig einer gezogen.
  //   once: true   → gibt es nur einmal, danach verschwindet er aus dem Topf
  //   dice: 5      → sie würfelt nochmal, {n} wird zu "Augen × 5"
  vouchers: [
    { text: "{n} Minuten Fußmassage", dice: 5 },
    { text: "{n} Minuten Rückenmassage", dice: 5 },
    { text: "{n} Minuten Nackenmassage", dice: 5 },
    { text: "{n} Minuten Rückenkraulen", dice: 3 },
    { text: "{n} Küsse, einzulösen wann immer du willst", dice: 2 },
    { text: "Wir schauen einen Film deiner Wahl" },
    { text: "Frühstück ans Bett" },
    { text: "Heute koche ich, du wünschst dir was" },
    { text: "Eine heiße Schokolade mit Sahne, frisch serviert" },
    { text: "Ein Abend ohne Handy, nur wir zwei" },
    { text: "Wir fahren auf einen Weihnachtsmarkt und ich bezahle das Essen", once: true },
    { text: "Du darfst dir eine Pflanze aussuchen", once: true },
  ],

  // Meilensteine: Diese Geschenke gibt es der Reihe nach, sobald sie an einem
  // 🎀-Feld vorbeizieht. Alle sind garantiert, nur der Tag ist eine Überraschung.
  // So viele Einträge wie hier stehen, so viele 🎀-Felder hat das Brett.
  bigGifts: [
    "Gesichtsmasken für einen Wellnessabend",
    "Riechdosen",
    "Tigerbalm",
    "Peeling",
    // "Geschenk Nr. 5",
  ],

  // Grüne Felder: kleine Aufgaben
  tasks: [
    "Sing mir die erste Strophe deines liebsten Weihnachtslieds vor",
    "Mach ein Selfie mit Weihnachtsmütze und schick es mir",
    "Nenne drei Dinge, die du dieses Jahr besonders schön fandest",
    "Male in zwei Minuten einen Weihnachtsmann, ohne den Stift abzusetzen",
    "Erzähl mir deine schönste Weihnachtserinnerung aus der Kindheit",
    "Tanze 30 Sekunden zu „Last Christmas“",
    "Schreib mir einen Wunschzettel mit genau drei Wünschen",
    "Gib mir einen Kuss unter dem (gedachten) Mistelzweig",
    "Errate in drei Versuchen, was ich mir zu Weihnachten wünsche",
    "Sag „Fischers Fritz fischt frische Fische“ dreimal fehlerfrei",
    "Bastle einen Papierstern und häng ihn auf",
    "Denk dir einen Rentiernamen für mich aus",
  ],

  // Wartefeld vor dem Ziel: kleine Trostpreise, falls sie früh ankommt
  waiting: [
    "Ein Kuss, sofort einzulösen",
    "Eine lange Umarmung",
    "Ein Plätzchen deiner Wahl",
    "Ein ehrliches Kompliment von mir",
    "5 Minuten Kraulen, sofort",
    "Ich singe dir ein Weihnachtslied vor",
    "Ein Tee oder Kakao, von mir gebracht",
  ],

  // Heiligabend: Der letzte Wurf landet immer hier, vorher ist das Feld unerreichbar.
  goal: "Frohe Weihnachten! Der Würfel hat heute nur eine Richtung gekannt. Dein großes Geschenk wartet unterm Baum.",
};
