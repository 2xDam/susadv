// Hier passt du das Spiel an: Texte, Geschenke und Aufgaben.
// Die Listen werden der Reihe nach auf die Felder verteilt.
const CONTENT = {
  title: "Adventsspiel",          // z. B. "Annas Adventsspiel"
  token: "🦌",                     // Spielfigur

  // Rote Felder: Belohnungen, die sie bei dir einlösen kann
  rewards: [
    "10 Minuten Nackenmassage",
    "Such dir das Abendessen aus",
    "Frühstück ans Bett",
    "Du bestimmst den Film heute Abend",
    "Eine heiße Schokolade mit Sahne, frisch serviert",
    "20 Minuten Fußmassage",
    "Ich übernehme heute den Abwasch",
    "Ein Spaziergang zum Weihnachtsmarkt, Glühwein geht auf mich",
    "Gutschein für einen Wunsch-Nachtisch",
    "Ein Abend ohne Handy, nur wir zwei",
    "Ich koche dein Lieblingsgericht",
    "Rückenkraulen bis du einschläfst",
    "Du darfst die Playlist im Auto bestimmen",
    "Ein Kinoabend deiner Wahl",
    "Ich bringe dir Kaffee, wann immer du heute willst",
    "Gemeinsames Plätzchenbacken, ich räume auf",
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
  ],

  goal: "Frohe Weihnachten! Du hast den Baum erreicht. Dein großes Geschenk wartet auf dich.",
};
