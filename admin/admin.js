// === Config demo ===
const DEMO_USER = "admin";
const DEMO_PASS = "1234";

const AUTH_KEY = "cw_admin_auth";
const MSG_KEY = "cw_contact_messages";

// Helpers
function $(id){ return document.getElementById(id); }

function isAuthed(){
  const auth = localStorage.getItem(AUTH_KEY);
  return auth === "true";
}

function requireAuth(){
  if(!isAuthed()){
    window.location.href = "login.html";
  }
}

function logout(){
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "login.html";
}

function getMessages(){
  try{
    return JSON.parse(localStorage.getItem(MSG_KEY) || "[]");
  }catch{
    return [];
  }
}

function saveMessages(list){
  localStorage.setItem(MSG_KEY, JSON.stringify(list));
}

function formatDate(ts){
  const d = new Date(ts);
  return d.toLocaleString("es-MX");
}

function escapeHTML(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// === LOGIN PAGE ===
(function initLogin(){
  const form = $("loginForm");
  if(!form) return;

  if(isAuthed()){
    window.location.href = "dashboard.html";
    return;
  }

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const user = $("user").value.trim();
    const pass = $("pass").value.trim();
    const msg = $("loginMsg");

    if(user === DEMO_USER && pass === DEMO_PASS){
      localStorage.setItem(AUTH_KEY, "true");
      window.location.href = "dashboard.html";
    }else{
      msg.textContent = "Usuario o contraseña incorrectos.";
      msg.style.color = "#b00020";
    }
  });
})();

// === DASHBOARD PAGE ===
(function initDashboard(){
  const listEl = $("list");
  if(!listEl) return;

  requireAuth();

  const emptyEl = $("empty");
  const searchEl = $("search");
  const logoutBtn = $("logoutBtn");
  const refreshBtn = $("refreshBtn");
  const clearBtn = $("clearBtn");

  function render(){
    const q = (searchEl?.value || "").toLowerCase();
    const data = getMessages()
      .sort((a,b)=> b.created_at - a.created_at)
      .filter(m=>{
        const hay = `${m.name} ${m.email} ${m.description}`.toLowerCase();
        return hay.includes(q);
      });

    listEl.innerHTML = "";

    if(data.length === 0){
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    for(const m of data){
      const card = document.createElement("div");
      card.className = "msg-card";
      card.innerHTML = `
        <div class="msg-head">
          <div>
            <h3 class="msg-title">${escapeHTML(m.name)} <span class="badge">${escapeHTML(m.email)}</span></h3>
            <div class="msg-meta">Recibido: ${escapeHTML(formatDate(m.created_at))}</div>
          </div>
        </div>
        <p class="msg-body">${escapeHTML(m.description)}</p>
      `;
      listEl.appendChild(card);
    }
  }

  logoutBtn?.addEventListener("click", logout);
  refreshBtn?.addEventListener("click", render);
  clearBtn?.addEventListener("click", ()=>{
    saveMessages([]);
    render();
  });
  searchEl?.addEventListener("input", render);

  render();
})();
