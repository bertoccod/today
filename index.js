if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrato:', reg))
      .catch(err => console.error('Errore nella registrazione:', err));
  });
}

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