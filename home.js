import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, serverTimestamp, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCboHhYcYQKR8MuB41r4d5QRqPpiT0_v5w",
  authDomain: "today-7ee7d.firebaseapp.com",
  projectId: "today-7ee7d",
  storageBucket: "today-7ee7d.firebasestorage.app",
  messagingSenderId: "628567408302",
  appId: "1:628567408302:web:71598097228eb34fcf373f"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function attivaFrecce() {
    const btnPrev = document.getElementById("freccia_prev");
    const btnNext = document.getElementById("freccia_next");
    if (btnPrev) btnPrev.onclick = () => muovi_carosello(-1);
    if (btnNext) btnNext.onclick = () => muovi_carosello(1);

    const btnPrevAcc = document.getElementById("freccia_prev_accadde");
    const btnNextAcc = document.getElementById("freccia_next_accadde");
    if (btnPrevAcc) btnPrevAcc.onclick = () => cambiaEvento(-1);
    if (btnNextAcc) btnNextAcc.onclick = () => cambiaEvento(1);
    
    console.log("✅ Frecce collegate!");
}

attivaFrecce();

//CONTROLLO ESISTA IL NOME E LA DATA DI NASCITA
let nome = localStorage.getItem("username");
let dato_nascita = localStorage.getItem("data");
if (!nome) { window.location.href = "index.html"; }

//LOG DI ACCESSO
try {
  await addDoc(collection(db, "log"), {
    nome: nome,
    data: serverTimestamp()
  });
  console.log("Nuovo log di accesso creato");
} catch (e) {
  console.error("Errore: ", e);
}

//CAPTO ORA E DATA ODIERNA
const oggi = new Date();
const oggi_gg = oggi.getDate();
const oggi_mm = oggi.getMonth() + 1;
const oggi_aa = oggi.getFullYear();
const oggi_ora = oggi.getHours();

//IMPOSTO IL NOME NEL SALUTO
const el_buondi = document.getElementById("buondi");
if (oggi_ora < 5 || oggi_ora >= 23) { el_buondi.textContent = `Buonanotte ${nome}`; }
if (oggi_ora >= 5 && oggi_ora < 13) { el_buondi.textContent = `Buongiorno ${nome}`; }
if (oggi_ora >= 13 && oggi_ora < 18) { el_buondi.textContent = `Buon pomeriggio ${nome}`; }
if (oggi_ora >= 18 && oggi_ora < 23) { el_buondi.textContent = `Buonasera ${nome}`; }

/* PREPARO GIORNO A CERCHIO*/
const dayOfWeek = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const mesi = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

const el_dow = document.getElementById("dow");
el_dow.textContent = dayOfWeek[oggi.getDay()];
let el_circle = document.getElementById("circle");
const el_circle_day = document.getElementById("circle_day");
el_circle_day.textContent = oggi.getDate();
const el_meseanno = document.getElementById("meseanno");
el_meseanno.textContent = `${mesi[oggi.getMonth()]} ${oggi.getFullYear()}`;


// FUNCTIONS
caricaMeteo();
ricorrenzeDelGiorno(oggi_gg, oggi_mm);
date(oggi, dato_nascita);
caricaSanto();
citazioneDelGiorno(oggi_gg, oggi_mm);
let listaEventi = [];
let indiceCorrente = 0;
let timerStoria;
accaddeOggi(oggi_gg, oggi_mm);
pillolaSapere(oggi_aa, oggi_mm, oggi_gg);
topCanzoneItalia();
ilCapolavoroDelGiorno();
fotografiaIconica();
//ilGiganteDelGiorno(oggi_gg, oggi_mm);

async function caricaMeteo() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      try {
        //RICERCA INVERSA POSIZIONE DA LAT-LON
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
        const geoResponse = await fetch(geoUrl);
        const geoDati = await geoResponse.json();
        const citta = geoDati.address.city || geoDati.address.town || geoDati.address.village || "Tua posizione";
        //API METEO
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
        const response = await fetch(url);
        const dati = await response.json();
        const codiciMeteo = {
          0: "Cielo Sereno",
          1: "Prevalent. Sereno",
          2: "Parz. Nuvoloso",
          3: "Nuvoloso",
          45: "Nebbia",
          48: "Nebbia con brina",
          51: "Pioggerellina",
          61: "Pioggia Debole",
          63: "Pioggia Moderata",
          65: "Pioggia Forte",
          71: "Neve Debole",
          73: "Neve Moderata",
          75: "Neve Forte",
          95: "Temporale"
        };
        const codiciIcone = {
          0: "ph ph-sun",
          1: "ph ph-sun-dim",
          2: "ph ph-cloud-sun",
          3: "ph ph-cloud",
          45: "ph ph-cloud-fog",
          48: "ph ph-cloud-fog",
          51: "ph ph-cloud-rain",
          61: "ph ph-cloud-rain",
          63: "ph ph-drop",
          65: "ph ph-drop",
          71: "ph-cloud-snow",
          73: "ph ph-snowflake",
          75: "ph ph-snowflake",
          95: "ph-cloud-lightning"
        }
        //PREPARO VARIABILI PER METEO
        const situazione = codiciMeteo[dati.current.weather_code] || "Condizioni Variabili";
        const iconaMeteo = codiciIcone[dati.current.weather_code] || "ph ph-empty";
        const tempAttuale = dati.current.temperature_2m;
        const tempMax = dati.daily.temperature_2m_max[0];
        const tempMin = dati.daily.temperature_2m_min[0];
        const alba = dati.daily.sunrise[0].split("T")[1];
        const tramonto = dati.daily.sunset[0].split("T")[1];
        
        //SCRIVO NEL DOM
        const el_meteo_icon = document.getElementById("meteo_icon");
        el_meteo_icon.innerHTML = `
          <i class="ph-duotone ${iconaMeteo}"></i>
          <span>${situazione}</span>
        `;
        const el_meteo_contenuto = document.getElementById("meteo_contenuto");
        el_meteo_contenuto.innerHTML = `
          <div class="meteo_riga">
            <i class="ph ph-map-pin-line"></i><span>${citta}</span>
          </div>
          <div class="meteo_riga">
            <i class="ph ph-thermometer"></i><span> ${tempAttuale}°C</span>
          </div>
          <div class="meteo_riga">
            <i class="ph ph-thermometer-cold"></i><span> ${tempMin}°C</span>
            <i class="ph ph-thermometer-hot" id="temp-hot"></i><span> ${tempMax}°C</span>
          </div>
          <div class="meteo_riga">
            <i class="ph ph-sun-horizon"></i><span> ${alba} - ${tramonto}</span>
          </div>
          `;

      } catch (error) {
        console.error("Errore nel recupero dati meteo:", error);
        el_meteo_contenuto.textContent = "Meteo non disponibile";
      }
    }, (error) => {
      el_meteo_contenuto.textContent = "Permesso negato o errore GPS";
      console.error(error);
    });
  } else {
    el_meteo_contenuto.textContent = "Geolocalizzazione non supportata";
  }
}

async function ricorrenzeDelGiorno(gg, mm) {
  const el_ricorrenza_box = document.getElementById("ricorrenza_box");

  try {
    // Usiamo l'endpoint 'holidays' di Wikipedia
    const response = await fetch(`https://it.wikipedia.org/api/rest_v1/feed/onthisday/holidays/${mm}/${gg}`);
    const dati = await response.json();

    if (!dati.holidays || dati.holidays.length === 0) {
      el_ricorrenza_box.innerHTML = "<div>Oggi è una giornata ordinaria nel calendario ONU.</div>";
      return;
    }

    // Filtriamo per prendere quelle che citano ONU, UNESCO o sono "Giornate Mondiali/Internazionali"
    const ufficiali = dati.holidays.filter(r =>
      r.text.toLowerCase().includes("giornata") ||
      r.text.toLowerCase().includes("onu") ||
      r.text.toLowerCase().includes("unesco")
    );

    // Se non ne troviamo di specifiche ONU, prendiamo la prima ricorrenza generale
    const oggi_festeggia = ufficiali.length > 0 ? ufficiali[0] : dati.holidays[0];

    el_ricorrenza_box.innerHTML = `
        <span>${oggi_festeggia.text}</span>
    `;

  } catch (error) {
    console.error("Errore Ricorrenze:", error);
    el_ricorrenza_box.innerHTML = "";
  }
}

function date(oggi, dato_nascita) {
  const nascita = new Date(dato_nascita);

  // Sincronizziamo i dati temporali mancanti
  const oggi_aa = oggi.getFullYear();
  const oggi_mm = oggi.getMonth(); // 0-11
  const oggi_gg = oggi.getDate();

  // 1. GIORNI VISSUTI
  const giorniVissuti = Math.floor((oggi - nascita) / (1000 * 60 * 60 * 24));

  // 2. GIORNI AL COMPLEANNO
  let nextComple = new Date(oggi_aa, nascita.getMonth(), nascita.getDate());
  if (nextComple < oggi) {
    nextComple.setFullYear(oggi_aa + 1);
  }
  const gg_next_Comple = Math.ceil((nextComple - oggi) / (1000 * 60 * 60 * 24));

  // 3. GIORNI A NATALE
  let Natale = new Date(oggi_aa, 11, 25);
  if (oggi > Natale) {
    Natale.setFullYear(oggi_aa + 1);
  }
  const DayToNatale = Math.ceil((Natale - oggi) / (1000 * 60 * 60 * 24));

  // 4. STAGIONE
  const primavera = new Date(oggi_aa, 2, 21);
  const estate = new Date(oggi_aa, 5, 21);
  const autunno = new Date(oggi_aa, 8, 23);
  const inverno = new Date(oggi_aa, 11, 21);

  let stagioneCorrente, prossimaStagione, inizioStagione, iconaStagione, nextSeason;

  if (oggi >= primavera && oggi < estate) {
    stagioneCorrente = "PRIMAVERA"; inizioStagione = primavera; prossimaStagione = estate; nextSeason = "ESTATE"; iconaStagione = "ph-flower-tulip";
  } else if (oggi >= estate && oggi < autunno) {
    stagioneCorrente = "ESTATE"; inizioStagione = estate; prossimaStagione = autunno; nextSeason = "AUTUNNO"; iconaStagione = "ph-sun";
  } else if (oggi >= autunno && oggi < inverno) {
    stagioneCorrente = "AUTUNNO"; inizioStagione = autunno; prossimaStagione = inverno; nextSeason = "INVERNO"; iconaStagione = "ph-leaf";
  } else {
    stagioneCorrente = "INVERNO"; iconaStagione = "ph-snowflake"; nextSeason = "PRIMAVERA";
    inizioStagione = (oggi_mm === 11 && oggi_gg >= 21) ? inverno : new Date(oggi_aa - 1, 11, 21);
    prossimaStagione = (oggi_mm === 11) ? new Date(oggi_aa + 1, 2, 21) : primavera;
  }
  const giornoStagione = Math.floor((oggi - inizioStagione) / (1000 * 60 * 60 * 24)) + 1;
  const giorniAProssima = Math.ceil((prossimaStagione - oggi) / (1000 * 60 * 60 * 24));

  // 5. PERCENTUALE ANNO
  const inizioAnno = new Date(oggi_aa, 0, 1);
  const fineAnno = new Date(oggi_aa + 1, 0, 1);
  const progressoAnno = ((oggi - inizioAnno) / (fineAnno - inizioAnno)) * 100;

  //COSTRUZIONE HTML
  const el_gg_vissuti = document.getElementById("gg_vissuti");
  el_gg_vissuti.innerHTML = `
    <div class="giorni_box">
      <div id="giorni-icon">
        <i class="ph-duotone ph-calendar-dot"></i>
      </div>
      <div class="contenuto">
        <span>
          <b>GIORNI VISSUTI<BR>AD OGGI</b><BR>${giorniVissuti.toLocaleString()}
        </span>
      </div> 
    </div>
  `;
  const el_next_comple = document.getElementById("next_comple");
  el_next_comple.innerHTML = `
    <div class="giorni_box">
      <div id="giorni-icon">
        <i class="ph-duotone ph-cake"></i>
      </div>
      <div class="contenuto">
        <span>
          <b>PROSSIMO COMPLEANNO TRA</B><BR>${gg_next_Comple} gg
        </span>
      </div> 
    </div>
  `;
  const el_gg_natale = document.getElementById("gg_natale");
  el_gg_natale.innerHTML = `
    <div class="giorni_box">
      <div id="giorni-icon">
        <i class="ph-duotone ph-gift"></i>
      </div>
      <div class="contenuto">
        <span>
          <b>GIORNI A NATALE</b><BR>${DayToNatale}
        </span>
      </div> 
    </div>
  `;
  const el_gg_stagione = document.getElementById("gg_stagione");
  el_gg_stagione.innerHTML = `
    <div class="giorni_box">
      <div id="giorni-icon">
        <i class="ph-duotone ${iconaStagione}"></i>
      </div>
      <div class="contenuto">
        <span>
          SIAMO NEL<B> ${giornoStagione}</B> GIORNO<BR>DI<B> ${stagioneCorrente}</B>
        </span>
      </div> 
    </div>
  `;
  let frase_next_stagione = (nextSeason === "PRIMAVERA")
    ? "LA PRIMAVERA ARRIVERA' TRA "
    : "L'" + nextSeason + " ARRIVERA' TRA";
  const el_next_stagione = document.getElementById("gg_next_stagione");
  el_next_stagione.innerHTML = `
    <div class="giorni_box">
      <div id="giorni-icon">
        <i class="ph-duotone ${iconaStagione}"></i>
      </div>
      <div class="contenuto">
        <span>
          ${frase_next_stagione}<BR><B>${giorniAProssima}</B> gg
        </span>
      </div> 
    </div>
  `;
  const el_anno_trascorso = document.getElementById("anno_trascorso");
  el_anno_trascorso.innerHTML = `
    <div class="item-header">
      <i class="ph-duotone ph-calendar-check"></i>
      <span>ANNO TRASCORSO:<br> ${progressoAnno.toFixed(1)}%</span>
    </div>
    <div class="progress-container">
        <div class="progress-bar" style="width: ${progressoAnno}%"></div>
    </div>
  `;
}

function muovi_carosello(dato_direzione) {
  const el_lista = document.getElementById("lista_date");
  const el_card = el_lista.querySelector("li");
  if (el_card) {
    const dato_larghezza = el_card.offsetWidth;
    const dato_gap = 15;
    const dato_spostamento = (dato_larghezza + dato_gap) * dato_direzione;
    el_lista.scrollBy({ left: dato_spostamento, behavior: "smooth" });
  }
}

async function caricaSanto() {
  try {
    const response = await fetch('https://www.santodelgiorno.it/santi.json');
    const dati = await response.json();
    const principale = dati.find(s => s.default == "1") || dati[0];
    const altri = dati.filter(s => s.nome !== principale.nome).slice(0, 4);
    const nomiAltri = altri.map(s => s.nome).join(" • ");

    let el_main_saint = document.getElementById("main_saint");
    el_main_saint.textContent = principale.nome; 

    const santoS = document.createElement("span");
    if (nomiAltri) {
      santoS.textContent = `Si festeggiano anche: ${nomiAltri}`;
      santoS.classList.add("santi-secondari");
    }

    const el_santo_contenuto = document.getElementById("santo_contenuto");
    el_santo_contenuto.appendChild(santoS);

    //if (window.lucide) lucide.createIcons();

  } catch (error) {
    console.error("Errore santi:", error);
  }
}

async function citazioneDelGiorno(gg, mm) {
  const effimero_div = document.getElementById("effimero-box");

  const mesi = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const meseNome = mesi[mm - 1];

  const titoloTemplate = `Template:Qotd/${gg}${meseNome}`;
  const url = `https://it.wikiquote.org/w/api.php?action=query&prop=revisions&titles=${encodeURIComponent(titoloTemplate)}&rvprop=content&format=json&origin=*`;

  try {
    const response = await fetch(url);
    const dati = await response.json();

    const pages = dati.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === "-1") {
      let el_testo_citaz = document.getElementById("testo_citaz");
      el_testo_citaz.textContent="Nessun pensiero per oggi.";
      return;
    }

    let wikitesto = pages[pageId].revisions[0]["*"];

    const regexCitazione = /citazione\s*=\s*([\s\S]*?)(?=\s*\|\s*\w+\s*=|\s*\}\s*$)/;
    const regexAutore = /autore\s*=\s*([\s\S]*?)(?=\s*\|\s*\w+\s*=|\s*\}\s*$)/;

    const citazioneMatch = wikitesto.match(regexCitazione);
    const autoreMatch = wikitesto.match(regexAutore);

    let citazioneRaw = citazioneMatch ? citazioneMatch[1].trim() : "Citazione non trovata";
    let autoreRaw = autoreMatch ? autoreMatch[1].trim() : "Autore ignoto";

    const citazionePulita = citazioneRaw
      .replace(/\{\{!\}\}/g, "|")                  // Prima sistemiamo il simbolo speciale {{!}}
      .replace(/\{\{[^}]+\}\}/g, "")               // CANCELLA tutto quello che è dentro {{ }}
      .replace(/\[\[([^|\]]+\|)?([^\]]+)\]\]/g, "$2") // Tiene solo il testo visibile dei link [[Link|Testo]]
      .replace(/\[\[[^\]]+\]\]/g, "")              // Cancella eventuali link rimasti [[ ]]
      .replace(/'''?/g, "")                       // Toglie grassetti e corsivi
      .replace(/\s+/g, " ")                        // Toglie spazi doppi o strani creati dalle cancellazioni
      .trim();

    const autorePulito = autoreRaw
        .replace(/\[\[([^|\]]+\|)?([^\]]+)\]\]/g, "$2") // Toglie i link [[...]]
        .replace(/'''?/g, "")                          // Toglie grassetti
        .replace(/\}/g, "")                            // <--- AGGIUNTA: Toglie le parentesi graffe residue
        .trim();

    // 3. STAMPA
    let el_testo_citaz = document.getElementById("testo_citaz");
    let el_autore_citaz = document.getElementById("autore_citaz");
    el_testo_citaz.innerHTML=`${citazionePulita}`;
    el_autore_citaz.textContent=`— ${autorePulito}`;

  } catch (error) {
    console.error("Errore Template API:", error);
    let el_testo_citaz = document.getElementById("testo_citaz");
    el_testo_citaz.textContent="Pensiero del giorno in manutenzione.";
  }
}

async function accaddeOggi(gg, mm) {
  try {
    const response = await fetch(`https://it.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${gg}`);
    const dati = await response.json();
    listaEventi = dati.events;

    mostraEvento(); // Prima esecuzione
    avviaTimer();   // Parte l'automatismo
  } catch (error) {
    console.error("Errore con la storia:", error);
    document.getElementById("evento_contenuto").textContent = "Oggi la storia si è presa una pausa.";
  }
}

function mostraEvento() {
  const evento = listaEventi[indiceCorrente];
  document.getElementById("evento_year").innerHTML = `<b>${evento.year}</b>`;
  document.getElementById("evento_contenuto").textContent = evento.text;
}

function cambiaEvento(direzione) {
  // Reset del timer: se l'utente clicca, il countdown di 5 secondi riparte da zero
  clearInterval(timerStoria);

  indiceCorrente += direzione;

  // Gestione loop (se vai sotto zero torna alla fine, se superi la fine torna a zero)
  if (indiceCorrente < 0) indiceCorrente = listaEventi.length - 1;
  if (indiceCorrente >= listaEventi.length) indiceCorrente = 0;

  mostraEvento();
  avviaTimer(); // Riavvia l'automatismo dopo il click
}

function avviaTimer() {
  timerStoria = setInterval(() => {
    indiceCorrente = (indiceCorrente + 1) % listaEventi.length;
    mostraEvento();
  }, 5000);
}

async function pillolaSapere(aa, mm, gg) {
  //controllo se esiste già pillola odierna
  const id = aa + "-" + mm + "-" + gg;
  const docRef = doc(db, "pillola", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    const el_pillola_box = document.getElementById("pillola_box");
    let voceValida = false;
    let tentativi = 0;
    try {
      while (!voceValida && tentativi < 10) {
        const response = await fetch(`https://it.wikipedia.org/api/rest_v1/page/random/summary`);
        const dati = await response.json();
        const eUnaLista = dati.title.toLowerCase().includes("lista");
        const eUnElenco = dati.title.toLowerCase().includes("elenco");
        const eUnAnno = /^\d+$/.test(dati.title) || dati.title.includes("secolo");
        const eNoioso = ["stazione", "diocesi", "comune", "sovrano", "stub"].some(t => dati.title.includes(t));
        const eDisambigua = dati.type === "disambiguation";
        const troppoCorta = !dati.extract || dati.extract.length < 100;
        const immagineOk = dati.thumbnail && dati.thumbnail.source && dati.thumbnail.width >= 200;
        if (!eUnaLista && !eUnAnno && !eNoioso && !eUnElenco && !eDisambigua && !troppoCorta && immagineOk) {
          voceValida = true;
          const immagine = document.createElement("img");
          if (dati.thumbnail && dati.thumbnail.source) {
            immagine.src = dati.thumbnail.source;
          }
          const link = document.createElement("a");
          link.href = `${dati.content_urls.desktop.page}`;
          link.textContent = dati.title;
          const desc = document.createElement("span");
          desc.textContent = dati.extract;
          el_pillola_box.appendChild(immagine);
          el_pillola_box.appendChild(link);
          el_pillola_box.appendChild(desc);
          const nuovaPillola = {
            titolo: dati.title,
            link: dati.content_urls.desktop.page,
            immagine: dati.thumbnail.source,
            estratto: dati.extract
          };
          try {
            await setDoc(doc(db, "pillola", id), nuovaPillola);
            console.log("Pillola del giorno salvata con successo!");
          } catch (e) {
            console.error("Errore durante il salvataggio: ", e);
          }
        }
        tentativi++;
      }
    } catch (error) {
      console.error("Errore con la pillola:", error);
      el_pillola_box.textContent = "Oggi restiamo ignoranti.";
    }
  } else {
    const immagine = document.createElement("img");
    if (docSnap.get("immagine")) {
      immagine.src = docSnap.get("immagine");
    }
    const link = document.createElement("a");
    link.href = `${docSnap.get("link")}`;
    link.textContent = docSnap.get("titolo");
    const desc = document.createElement("span");
    desc.textContent = docSnap.get("estratto");
    const el_pillola_box = document.getElementById("pillola_box");
    el_pillola_box.appendChild(immagine);
    el_pillola_box.appendChild(link);
    el_pillola_box.appendChild(desc);
  }
}

async function topCanzoneItalia() {
  const API_KEY = "db772145c12ef958d947b7287aafabe5";
  const el_topmusic = document.getElementById("topmusic_box");

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country=italy&api_key=${API_KEY}&format=json&limit=1`;

    const response = await fetch(url);
    const dati = await response.json();
    const traccia = dati.tracks.track[0];

    const infoUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(traccia.artist.name)}&track=${encodeURIComponent(traccia.name)}&format=json`;
    const infoRes = await fetch(infoUrl);
    const infoDati = await infoRes.json();
    let cover = "assets/placeholder-musica.png";
    
    if (infoDati.track && infoDati.track.album && infoDati.track.album.image) {
      const imgUrl = infoDati.track.album.image[3]["#text"];
      if (imgUrl && imgUrl.trim() !== "") {
        cover = imgUrl;
      }
    }
    const immagine = document.createElement("img");
    immagine.src = cover;
    immagine.onerror = () => {
      immagine.src = "assets/placeholder-musica.png";
    };
    const artist = document.createElement("span");
    artist.id = "artista";
    artist.textContent = traccia.name;
    const title = document.createElement("span");
    title.innerHTML = `<strong>${traccia.artist.name}</strong>`;
    el_topmusic.appendChild(immagine);
    el_topmusic.appendChild(artist);
    el_topmusic.appendChild(title);

  } catch (error) {
    console.error("Errore nel recupero della top chart:", error);
  }
}


async function ilCapolavoroDelGiorno() {
  const el_capolavoro_box = document.getElementById("capolavoro_box");

  const queryUrl = "https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&limit=50&fields=id,title,artist_display,image_id,date_display";

  try {
    const response = await fetch(queryUrl);
    const dati = await response.json();

    const oggi = new Date().getDate();
    const opera = dati.data[oggi % dati.data.length];

    const imageUrl = `https://www.artic.edu/iiif/2/${opera.image_id}/full/843,/0/default.jpg`;

    el_capolavoro_box.innerHTML = `
        <img src="${imageUrl}" alt="${opera.title}">
        <h2>${opera.title}</h2>
        <p >${opera.artist_display}</p>
    `;

  } catch (error) {
    console.error("Errore Arte API:", error);
    el_capolavoro_box.innerHTML = "<p>L'arte oggi è timida.</p>";
  }
}


async function fotografiaIconica() {
  const el_fotografia_box = document.getElementById("fotografia_box");

  const oggi = new Date();
  const dataIso = oggi.toISOString().split('T')[0].replace(/-/g, '/');

  const url = `https://it.wikipedia.org/api/rest_v1/feed/featured/${dataIso}`;

  try {
    const response = await fetch(url);
    const dati = await response.json();

    const foto = dati.image;
    if (!foto) throw new Error("Foto non disponibile");

    el_fotografia_box.innerHTML = `
        <img src="${foto.thumbnail.source}">
        <p>${foto.description.text}</p>
    `;

  } catch (error) {
    console.error("Errore Foto:", error);
    foto_div.innerHTML = "";
  }
}

/*
async function ilGiganteDelGiorno(gg, mm) {
  const gigante_div = document.getElementById("compleanno");
  const giorno = String(gg).padStart(2, '0');
  const mese = String(mm).padStart(2, '0');
  try {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${mese}/${giorno}`);
    console.log(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${mese}/${giorno}`);
    const data = await response.json();
    if (!data.births) return;

    const gigantiPerDecennio = {};
    data.births.forEach(p => {
      const decennio = Math.floor(p.year / 10) * 10;
      if (decennio >= 1900 && decennio <= 2020) {
        const currentScore = (p.pages[0].thumbnail ? 300 : 0) +
          (p.pages[0].extract ? p.pages[0].extract.length : 0) +
          (p.pages[0].description ? p.pages[0].description.length : 0) +
          (p.pages[0].description?.includes("Italian") ? 2600 : 0);
        if (!gigantiPerDecennio[decennio] || currentScore > gigantiPerDecennio[decennio].score) {
          gigantiPerDecennio[decennio] = { ...p, score: currentScore };
        }
      }
    });
    const listaFinale = Object.values(gigantiPerDecennio).sort((a, b) => a.year - b.year);
    //EXTRACT IN ITALIANO
    // --- STEP 1: RACCOLTA DEI QID ---
    const qids = listaFinale.map(g => g.pages[0].wikibase_item).join('|');

    try {
      // --- STEP 2: CHIEDIAMO A WIKIDATA I TITOLI DELLE PAGINE ITALIANE ---
      // Usiamo Wikidata per convertire i QID (es. Q447882) nei titoli reali di Wikipedia IT (es. "Sandro Pertini")
      const urlWikidata = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qids}&props=sitelinks&sitefilter=itwiki&format=json&origin=*`;

      const resWikidata = await fetch(urlWikidata);
      const dataWikidata = await resWikidata.json();

      // Creiamo una mappa per collegare QID -> Titolo Italiano
      const mappaTitoli = {};
      const titoliPerWikipedia = [];

      for (const qid in dataWikidata.entities) {
        const titleIt = dataWikidata.entities[qid].sitelinks?.itwiki?.title;
        if (titleIt) {
          mappaTitoli[titleIt] = qid; // Ci serve per riaccoppiarli dopo
          titoliPerWikipedia.push(titleIt);
        }
      }

      // --- STEP 3: CHIEDIAMO A WIKIPEDIA IT GLI EXTRACT (DESCRIZIONI) ---
      // Ora che abbiamo i nomi "veri", chiediamo i testi in un colpo solo
      const nomiStringa = titoliPerWikipedia.join('|');
      // URL per descrizioni brevi (poche parole)
      const urlWikiIT = `https://it.wikipedia.org/w/api.php?action=query&prop=pageterms&titles=${encodeURIComponent(nomiStringa)}&format=json&origin=*`;

      const resWikiIT = await fetch(urlWikiIT);
      const dataWikiIT = await resWikiIT.json();

      const pagineIt = dataWikiIT.query.pages;

      // --- STEP 4: ACCOPPIAMENTO E CREAZIONE HTML ---
      const ulGig = document.createElement("ul");

      for (const id in pagineIt) {
        const p = pagineIt[id];
        const qidCorrispondente = mappaTitoli[p.title];

        // Troviamo l'oggetto originale nella lista per recuperare l'anno e la foto
        const personaggioOriginale = listaFinale.find(g => g.pages[0].wikibase_item === qidCorrispondente);

        if (personaggioOriginale) {
          const descrizioneBreve = p.terms?.description?.[0] || "Personaggio storico";
          const foto = personaggioOriginale.pages[0]?.thumbnail?.source || "assets/placeholder_gigante.jpg";
          const annoNascita = personaggioOriginale.year;

          // Creiamo la card
          const liGig = document.createElement("li");
          liGig.innerHTML = ` 
                <div id="gigDiv">
                    <h2>${p.title}</h2>
                    <img src="${foto}" alt="${p.title}" />
                    <div class="gig-info">
                        <span class="gig-year">${annoNascita}</span>
                        <p class="gig-desc">${descrizioneBreve}</p>
                    </div>
                </div>
            `;
          ulGig.appendChild(liGig);
        }
      }

      // Aggiungiamo la lista al contenitore finale
      gigante_div.innerHTML = "<h2>I GIGANTI NATI OGGI</h2>"; // Pulisce e mette il titolo
      gigante_div.appendChild(ulGig);

    } catch (error) {
      console.error("Errore nell'ultimo miglio delle API:", error);
    }

  } catch (e) {
    console.error("Errore:", e);
  }
}
*/