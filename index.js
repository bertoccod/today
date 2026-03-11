//REGISTRAZIONE SERVICE WORKER PER CREARE PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrato con successo:', reg.scope))
            .catch(err => console.error('Errore registrazione Service Worker:', err));
    });
}

// LOGICA DEL DOM
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Riferimenti Elementi HTML ---
    const installBanner = document.getElementById('pwa-install-banner');
    const installMessage = document.getElementById('install-message');
    const installBtn = document.getElementById('pwa-install-btn');
    
    const sp = document.getElementById("splash");
    const frm = document.getElementById("insert");
    const disc = document.getElementById("disclaimer");
    const send = document.getElementById("sendform");
    
    let deferredPrompt;
    let yourname = localStorage.getItem("username");

    // --- GESTIONE INSTALLAZIONE (Android vs iOS) ---
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (!isStandalone) {
        if (isIOS) {
            // Caso Apple: Mostriamo istruzioni manuali
            installMessage.innerHTML = 'Per un accesso rapido, premi l\'icona <b>Condividi</b> <img src="assets/ios-share-icon.png" style="width:15px; vertical-align:middle;"> e poi <b>Aggiungi alla schermata Home</b>.';
            installBtn.style.display = 'none'; 
            installBanner.style.display = 'block';
        } else {
            // Caso Android/PC: Ascoltiamo il prompt nativo
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                installMessage.innerHTML = 'Aggiungi <b>Today!</b> alla tua home per un accesso rapido.';
                installBanner.style.display = 'block';
            });

            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`Risultato installazione: ${outcome}`);
                    if (outcome === 'accepted') installBanner.style.display = 'none';
                    deferredPrompt = null;
                }
            });
        }
    }

    // --- LOGICA LOGIN / SPLASH SCREEN ---
    if (yourname) {
        // Utente già registrato: vai diretto alla home
        if(frm) frm.style.display = "none";
        if(disc) disc.style.display = "none";
        sp.style.display = "block";
        sp.innerHTML = `<span id="welcome">Benvenuto/a ${yourname}</span><div class="separator"></div>`;
        
        setTimeout(() => { 
            window.location.href = "home.html"; 
        }, 2500);
    } else {
        // Nuovo utente: mostra il form di inserimento
        if(frm) frm.style.display = "block";
        if(disc) disc.style.display = "block";
    }

    // --- INVIO DEL FORM ---
    if (send) {
        send.addEventListener("click", async () => {
            const nomeInput = document.getElementById("nome").value.trim();
            const inputdate = document.getElementById("nato").value;
            const error = document.getElementById("error");
            
            const oggi = new Date();
            const dataNascita = new Date(inputdate);

            // Validazione
            if (nomeInput === "") {
                error.textContent = "Inserisci un nome valido";
                return;
            }
            if (!inputdate) {
                error.textContent = "Dimentichi la tua data di nascita";
                return;
            }
            if (dataNascita >= oggi) {
                error.textContent = "Data nel futuro? Inserisci una data passata!";
                return;
            }

            // Salvataggio dati
            localStorage.setItem("username", nomeInput);
            localStorage.setItem("data", inputdate);

            // UI Feedback
            frm.style.display = "none";
            disc.style.display = "none";
            sp.style.display = "block";
            sp.innerHTML = `<span id="welcome">Benvenuto/a ${nomeInput}</span><div class="separator"></div>`;

            // Registrazione su Firebase (tramite la funzione globale nel modulo HTML)
            try {
                if (typeof window.registraAccesso === "function") {
                    await window.registraAccesso(nomeInput, inputdate);
                }
            } catch (err) {
                console.error("Errore salvataggio DB, procedo al redirect:", err);
            }

            // Redirect alla home
            setTimeout(() => {
                window.location.href = "home.html";
            }, 2500);
        });
    }

    // Nascondi banner se installata con successo
    window.addEventListener('appinstalled', () => {
        installBanner.style.display = 'none';
        console.log('App installata correttamente!');
    });
});