// Hier passt du das Spiel an: Texte, Gutscheine, Geschenke und Aufgaben.
const CONTENT = {
  title: "Susens Adventsrennen",          // z. B. "Annas Adventsspiel"
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
    { text: "Ein Abend ohne Handy" },
    { text: "Wir fahren auf einen Weihnachtsmarkt (oder worauf du mehr Lust hast) und ich bezahle das Essen", once: true },
    { text: "Du darfst dir eine Pflanze aussuchen", once: true },
    { text: "Wir gehen zusammen Schlittschuhlaufen", once: true },
    { text: "Kinoabend: Film nach deinem Wunsch, ich zahle die Tickets", once: true },
    { text: "Essen bestellen: Du suchst aus, ich zahle", once: true },
  ],

  // Wohlfühl-Bonus (🎀): Diese Geschenke gibt es der Reihe nach, sobald sie an einem
  // 🎀-Feld vorbeizieht. Alle sind garantiert, nur der Tag ist eine Überraschung.
  // So viele Einträge wie hier stehen, so viele 🎀-Felder hat das Brett.
  bigGifts: [
    "Körperlotion",   // vorläufig, kommt noch
    "Riechdosen",
    "Tigerbalm",
    "Peeling",
    // "Geschenk Nr. 5",
  ],

  // Grüne Felder: kleine Aufgaben
  tasks: [
    "Nenne drei Dinge, die du dieses Jahr besonders schön fandest",
    "Male in zwei Minuten einen Weihnachtsmann, ohne den Stift abzusetzen",
    "Tanze zu „Last Christmas“ und sing dabei mit",
  ],

  // Lila Quizfelder ❓: Fragen über uns. Die ERSTE Antwort ist immer die richtige,
  // im Spiel werden sie gemischt. Richtig = 2 Felder vor. note ist optional.
  // Bis zu 9 Fragen, sie ersetzen einen Teil der grünen Aufgabenfelder.
  quiz: [
    { q: "Wo war unser erstes Date?", answers: ["Rees", "Emmerich", "Wesel"] },
    { q: "Was haben wir beim ersten Treffen getrunken?", answers: ["4bro", "Bratee", "Dirtea"] },
    { q: "Wer hat zuerst „Ich liebe dich“ gesagt?", answers: ["Damian", "Susen"], note: "„Ich muss dir was sagen :D“" },
    { q: "Seit wann sind wir offiziell zusammen?", answers: ["28.09.21", "21.09.21", "28.10.21"] },
    { q: "Wie lautet Ennos offizieller Name, nicht abgekürzt?", answers: ["nomen nominandum", "no name", "noch nichts"] },
    { q: "Wo haben wir die Elefanten getroffen?", answers: ["Takua Pa", "Mau Dok", "Hak Tua"] },
    { q: "Wie heißt der Nebelwald auf Madeira?", answers: ["Fanal-Forest", "Fog-Forest", "Funchal-Forest"] },
    { q: "An welchem Tag haben wir uns verlobt?", answers: ["18.01.26", "15.01.26", "11.01.26"] },
    { q: "Was ist mein Lieblingsessen?", answers: ["Buchweizenpfannkuchen", "du", "Thai-Curry"] },
  ],

  // Fotos am Ziel: Ist sie vor Heiligabend schon am Wartefeld, gibt es dort pro Wurf
  // erst offene Quizfragen (danach je ein Foto von hier), dann offene Aufgaben.
  // Reihenfolge = Reihenfolge hier. Bilder liegen im Ordner photos/.
  photos: [
    { src: "photos/7.jpg", text: "Eingemummelt im Nebelwald." },
    { src: "photos/2.jpg", text: "Dieser Blick sagt mehr als tausend Worte. 😄" },
    { src: "photos/8.jpg", text: "Der kleine Kerl mit dem Hut hat uns beide um den Rüssel gewickelt." },
    { src: "photos/1.jpg", text: "Schick gemacht für einen schönen Abend zu zweit." },
    { src: "photos/6.jpg", text: "Kuscheln unter der Lichterkette, zu dritt." },
    { src: "photos/5.jpg", text: "Ein kleiner Vorgeschmack darauf, wie toll wir mal aussehen werden 😍" },
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
  goal: "Frohe Weihnachten! Der Würfel hat heute nur eine Richtung gekannt. Unterm Baum wartet etwas Kuscheliges auf dich, das normalerweise dicht gedrängt in einer Dose wohnt 🐟",
};
