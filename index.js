if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrato:', reg))
      .catch(err => console.error('Errore nella registrazione:', err));
  });
}

// Logica per il pulsante di installazione PWA
let deferredPrompt;
const installBanner = document.getElementById('pwa-install-banner');
const installBtn = document.getElementById('pwa-install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  // Previene la comparsa automatica del banner di Chrome
  e.preventDefault();
  // Salva l'evento per usarlo dopo
  deferredPrompt = e;
  // Mostra il nostro banner personalizzato
  installBanner.style.display = 'block';
  console.log("Evento 'beforeinstallprompt' intercettato!");
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    // Mostra il prompt di installazione nativo
    deferredPrompt.prompt();
    // Attendi la risposta dell'utente
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Risultato installazione: ${outcome}`);
    // Pulizia
    deferredPrompt = null;
    installBanner.style.display = 'none';
  }
});

// Nascondi il banner se l'app viene installata con successo
window.addEventListener('appinstalled', () => {
  installBanner.style.display = 'none';
  deferredPrompt = null;
  console.log('App installata correttamente!');
});



let yourname = localStorage.getItem("username");

//CARICO IL DOM
const sp = document.getElementById("splash");
const frm = document.getElementById("insert");
const disc = document.getElementById("disclaimer");

if (yourname) {
  sp.style = "display:block;"
  sp.innerHTML = `<span id="welcome">Benvenuto ${yourname}</span><div class="separator"></div>`;
  setTimeout(() => {  
    window.location.href = "home.html";
  }, 2500);
} else {
  frm.style = "display:block";
  disc.style = "display: block";
};

const send = document.getElementById("sendform");
send.addEventListener("click", async (e) => {
  yourname = document.getElementById("nome").value.trim();
  const inputdate = document.getElementById("nato").value;
  const oggi = new Date();
  const dataNascita = new Date(inputdate);
  const error = document.getElementById("error");
  if (yourname === "") {
        error.textContent="Inserisci un nome valido"; 
        return;
  }
  if (!inputdate) {
    error.textContent="Dimentichi la tua data di nascita";
    return;
  }
  if (dataNascita >= oggi) {
    error.textContent="A meno che tu non venga dal futuro, inserisci una data passata!";
    return;
  }
  localStorage.setItem("username", yourname);
  localStorage.setItem("data", inputdate);
  frm.style ="display:none;";
  disc.style = "display:none";
  sp.style = "display:block;"
  sp.innerHTML = `<span id="welcome">Benvenuto ${yourname}</span><div class="separator"></div>`;
  try {
    if (typeof registraAccesso === "function") {
      await registraAccesso(yourname, inputdate);
    }
  } catch (err) {
      console.error("Errore database, ma procediamo comunque:", err);
  }
  setTimeout(() => {
    window.location.href = "home.html";
  }, 2500);
});