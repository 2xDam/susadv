// Hier passt du das Spiel an: Texte, Gutscheine, Geschenke und Aufgaben.
const CONTENT = {
  title: "Adventsspiel",          // z. B. "Annas Adventsspiel"
  // Spielfigur: "prinzessin" ist die gezeichnete Figur, alternativ ein Emoji wie "🦌"
  token: "prinzessin",
  princess: { hair: "#7a4a2b", dress: "#ec6fa9" },   // Haar- und Kleidfarbe

  // Rote Felder: Gutscheine, die sie bei dir einlösen kann.
  // Landet sie auf einem roten Feld, wird zufällig einer gezogen.
  //   once: true   → gibt es nur einmal, danach verschwindet er aus dem Topf
  //   dice: 5      → sie würfelt nochmal, {n} wird zu "Augen × 5"
  vouchers: [
    { text: "{n} Minuten Fußmassage", dice: 5 },
    { text: "{n} Minuten Rückenmassage", dice: 5 },
    { text: "{n} Minuten Nackenmassage", dice: 5 },
    { text: "{n} Minuten Rückenkraulen", dice: 3 },
    { text: "Wir schauen einen Film deiner Wahl" },
    { text: "Du schläfst aus, ich übernehme den Morgen und bringe dir Frühstück ans Bett" },
    { text: "Abendessen ans Bett" },
    { text: "Spieleabend: Du suchst das Spiel aus, und ich lasse dich nicht absichtlich gewinnen" },
    { text: "Nein-Joker: Einmal etwas ablehnen, ohne Diskussion", once: true },
    { text: "Wunsch-Joker: Ich erfülle dir einen (kleinen) Wunsch", once: true },
    { text: "Heute koche ich, du wünschst dir was" },
    { text: "Wir machen einen Beautyabend, ich besorge alles" },
    { text: "Ein Abend ohne Handy, nur wir zwei" },
    { text: "Wir fahren auf einen Weihnachtsmarkt und ich bezahle das Essen", once: true },
    { text: "Du darfst dir eine Pflanze aussuchen", once: true },
    { text: "Wir gehen zusammen Schlittschuhlaufen", once: true },
    { text: "Kinoabend: Film nach deinem Wunsch, ich zahle die Tickets", once: true },
    { text: "Essen bestellen: Du suchst aus, ich zahle", once: true },
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

  // Fotos am Kamin: Jeder Wurf auf dem Wartefeld vor Heiligabend zeigt das nächste.
  // Reihenfolge = Reihenfolge hier. Bilder liegen im Ordner photos/.
  photos: [
    { src: "photos/7.jpg", text: "Eingemummelt im Nebelwald." },
    { src: "photos/2.jpg", text: "Dieser Blick sagt mehr als tausend Worte. 😄" },
    { src: "photos/8.jpg", text: "Der kleine Kerl mit dem Hut hat uns beide um den Rüssel gewickelt." },
    { src: "photos/1.jpg", text: "Schick gemacht für einen schönen Abend zu zweit." },
    { src: "photos/6.jpg", text: "Kuscheln unter der Lichterkette, zu dritt." },
    { src: "photos/5.jpg", text: "Der schönste Tag." },
  ],

  // Katzenfotos: Liegen fest auf Ruhefeldern, gleichmäßig übers Brett verteilt,
  // und sind dort als kleines Bild zu sehen. Landet sie darauf, gibt es das Foto groß.
  // Reihenfolge hier = Reihenfolge auf dem Brett. Vorschaubilder in photos/thumbs/.
  catPhotos: [
    { src: "photos/13.jpg", title: "Grüße von Ennos Kindern 🐾", text: "Waren wir nicht süß? Schöne Weihnachtszeit auch von uns!" },
    { src: "photos/3.jpg", text: "Enno schaut vorbei und fragt, ob du heute schon gekuschelt hast." },
    { src: "photos/14.jpg", text: "Enno ist eingekuschelt und bereit für den Winter. Schöne Grüße!" },
    { src: "photos/11.jpg", text: "Enno hat zu diesem Feld eine sehr klare Meinung." },
    { src: "photos/4.jpg", text: "Kein Gewinn, aber Enno sagt: Frisur sitzt." },
    { src: "photos/12.jpg", text: "Sonnige Grüße von Enno aus dem Garten." },
    { src: "photos/15.jpg", text: "Einer schläft, Enno passt auf. Schöne Grüße vom Sofa!" },
    { src: "photos/10.jpg", text: "Und das hier ist Ennos Meinung zum Thema Privatsphäre." },
    { src: "photos/9.jpg", text: "Zum Schluss liebe Grüße von Enno und Lieblingsmensch." },
  ],

  // Heiligabend: Der letzte Wurf landet immer hier, vorher ist das Feld unerreichbar.
  goal: "Frohe Weihnachten! Der Würfel hat heute nur eine Richtung gekannt. Dein großes Geschenk wartet unterm Baum.",
};
