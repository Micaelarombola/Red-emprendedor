const SUPABASE_URL = "https://ltcoeivvcrkgtkprqzb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_2CNWKNbS0O2ydd3DNq3_Rw_8XfoWCwD";

window.supabaseClient = window.supabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = window.supabaseClient;

const list = document.getElementById("entrepreneursList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const helpChips = document.querySelectorAll(".chip");

const publishBtn = document.getElementById("publishBtn");
const statTotal = document.getElementById("statTotal");
const statCategories = document.getElementById("statCategories");
const statComments = document.getElementById("statComments");
const resultsCount = document.getElementById("resultsCount");

const heroTotal = document.getElementById("heroTotal");
const heroCategories = document.getElementById("heroCategories");
const heroComments = document.getElementById("heroComments");

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

const helpBoardList = document.getElementById("helpBoardList");
const needCards = document.querySelectorAll(".need-card");

const planModal = document.getElementById("planModal");
const modalPlanName = document.getElementById("modalPlanName");
const modalPlanPrice = document.getElementById("modalPlanPrice");
const modalPlanPeriod = document.getElementById("modalPlanPeriod");
const modalWhatsappBtn = document.getElementById("modalWhatsappBtn");
const modalAliasBox = document.querySelector(".modal-pay-box");
const mpAliasText = document.getElementById("mpAliasText");

const myWhatsapp = "5491127887082";
const myMercadoPagoAlias = "webmic.mp";

const fallbackPhoto =
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80";

const communityNeeds = [
  {
    type: "Diseño",
    title: "Busco diseñador para logo",
    text: "Emprendimiento de cosmética busca ayuda para crear una identidad visual más profesional."
  },
  {
    type: "Proveedor",
    title: "Necesito proveedor de packaging",
    text: "Marca de velas busca cajas, stickers y bolsas para mejorar la presentación."
  },
  {
    type: "Colaboración",
    title: "Quiero colaborar con fotógrafa",
    text: "Tienda de indumentaria busca sesión de fotos para nueva colección."
  },
  {
    type: "Difusión",
    title: "Busco difusión para mi emprendimiento",
    text: "Marca de accesorios quiere llegar a más personas en redes y sumar visibilidad."
  }
];

const initialEntrepreneurs = [
  {
    id: crypto.randomUUID(),
    name: "Micaela",
    brand: "WebMic",
    category: "Diseño web y contenido digital",
    location: "Buenos Aires",
    alias: "webmic.mp",
    whatsapp: "5491127887082",
    instagram: "@webmic",
    facebook: "",
    tiktok: "",
    website: "",
    photo: "assets/webmic/portada.jpg",
    gallery: [
      "assets/webmic/foto1.jpg",
      "assets/webmic/foto2.jpg",
      "assets/webmic/foto3.jpg"
    ],
    services: "Páginas web, tiendas online, diseño visual, contenido y presencia digital para marcas y emprendedores.",
    story: "WebMic nace para ayudar a emprendedores a verse más profesionales en internet. La idea es crear páginas y presencia digital que vendan, conecten y hagan crecer marcas reales.",
    help: "Colaboraciones",
    helpText: "Podés apoyarme contratando mis servicios, recomendándome o compartiendo mi trabajo.",
    shipping: "Sí",
    comments: [],
    messages: []
  }
];

let entrepreneurs = [...initialEntrepreneurs];
let selectedHelp = "all";

function normalize(value) {
  return (value || "").toLowerCase().trim();
}

function uniqueCategories() {
  const categories = [...new Set(entrepreneurs.map(item => item.category).filter(Boolean))];
  return categories.sort((a, b) => a.localeCompare(b));
}

function totalCommentsCount() {
  return entrepreneurs.reduce((acc, item) => acc + (item.comments?.length || 0), 0);
}

function fillCategoryFilter() {
  if (!categoryFilter) return;

  const current = categoryFilter.value;
  const categories = uniqueCategories();

  categoryFilter.innerHTML = `<option value="all">Todos</option>`;
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  if ([...categoryFilter.options].some(opt => opt.value === current)) {
    categoryFilter.value = current;
  }
}

function buildInstagramUrl(value) {
  if (!value) return "";
  const clean = value.replace("@", "").trim();
  if (clean.startsWith("http")) return clean;
  return `https://instagram.com/${clean}`;
}

function buildSimpleUrl(value, base) {
  if (!value) return "";
  const clean = value.trim();
  if (clean.startsWith("http")) return clean;
  return `${base}${clean.replace("@", "")}`;
}

function buildWhatsappUrl(value) {
  if (!value) return "";
  const onlyNumbers = value.replace(/\D/g, "");
  if (!onlyNumbers) return "";
  return `https://wa.me/${onlyNumbers}`;
}

function renderSocialButtons(e) {
  const items = [];

  const instagramUrl = buildInstagramUrl(e.instagram);
  const facebookUrl = buildSimpleUrl(e.facebook, "https://facebook.com/");
  const tiktokUrl = buildSimpleUrl(e.tiktok, "https://www.tiktok.com/@");
  const whatsappUrl = buildWhatsappUrl(e.whatsapp);

  if (instagramUrl) {
    items.push(`<a class="small-btn" href="${instagramUrl}" target="_blank" rel="noopener noreferrer">Instagram</a>`);
  }
  if (facebookUrl) {
    items.push(`<a class="small-btn" href="${facebookUrl}" target="_blank" rel="noopener noreferrer">Facebook</a>`);
  }
  if (tiktokUrl) {
    items.push(`<a class="small-btn" href="${tiktokUrl}" target="_blank" rel="noopener noreferrer">TikTok</a>`);
  }
  if (e.website) {
    items.push(`<a class="small-btn" href="${e.website}" target="_blank" rel="noopener noreferrer">Página web</a>`);
  }
  if (whatsappUrl) {
    items.push(`<a class="small-btn primary" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`);
  }

  return items.join("");
}

function renderComments(comments) {
  if (!comments || !comments.length) {
    return `<div class="empty-state-small">Todavía no tiene comentarios. Sé la primera persona en dejarle uno.</div>`;
  }

  return comments.map(comment => `
    <div class="comment-item">
      <strong>${comment.author}</strong>
      <div>${comment.text}</div>
    </div>
  `).join("");
}

function renderMessages(messages) {
  if (!messages || !messages.length) {
    return `<div class="empty-state-small">Todavía no tiene mensajes desde la comunidad.</div>`;
  }

  return messages.map(message => `
    <div class="message-item">
      <strong>${message.author}</strong>
      <div>${message.text}</div>
    </div>
  `).join("");
}

function renderGallery(images = []) {
  const filtered = images.filter(Boolean);

  if (!filtered.length) {
    return `<div class="empty-state-small">Todavía no cargó fotos de sus trabajos.</div>`;
  }

  return `
    <div class="gallery-grid">
      ${filtered.map(img => `
        <button
          class="gallery-item"
          type="button"
          onclick="openImageModal('${img}')"
        >
          <img
            src="${img}"
            alt="Trabajo del emprendimiento"
            onerror="this.src='${fallbackPhoto}'"
          />
        </button>
      `).join("")}
    </div>
  `;
}
function openImageModal(src) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("imageModalImg");

  if (!modal || !modalImg) return;

  modalImg.src = src;
  modal.classList.add("open");
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("imageModalImg");

  if (!modal || !modalImg) return;

  modal.classList.remove("open");
  modalImg.src = "";
}
function cardTemplate(e) {
  const slug = e.brand.toLowerCase().replace(/\s+/g, "-");

  return `
    <article class="entrepreneur-card" id="${slug}">
      <div class="card-preview">
        <div class="card-photo-wrap">
          <img
            class="card-photo"
            src="${e.photo || fallbackPhoto}"
            alt="${e.brand}"
            onerror="this.src='${fallbackPhoto}'"
          />
          <div class="photo-badge">Emprendimiento destacado</div>
        </div>

        <div class="card-main">
          <h4>${e.brand}</h4>
          <p>${e.services || e.category}</p>

          <div class="preview-badges">
            <span class="preview-badge">${e.category || "Sin rubro"}</span>
            <span class="preview-badge">${e.location || "Sin zona"}</span>
            <span class="preview-badge">${e.shipping || "Sin dato de envío"}</span>
          </div>

          <div class="social-row">
            ${renderSocialButtons(e)}
          </div>
        </div>

        <div class="preview-side">
          <div class="status-badge">${e.help || "Activo"}</div>

          <div class="alias-box">
            <span>Alias</span>

            <div class="alias-row">
              <strong id="alias-${e.id}">
                ${e.alias || "No cargado"}
              </strong>

              <div class="alias-actions">
                <button class="see-alias-btn" onclick="showAliasOnly('${e.id}')" type="button">
                  Ver alias
                </button>

                <button class="copy-btn" onclick="copyAlias('${e.id}')" type="button">
                  Copiar
                </button>
              </div>
            </div>
          </div>

          <button class="expand-btn" type="button" onclick="toggleExpand('${e.id}')">
            Ver más
          </button>
        </div>
      </div>

      <div class="card-expanded" id="expanded-${e.id}">
        <div class="expanded-grid">
          <div>
            <div class="info-panel">
              <strong>Emprendedor/a:</strong> ${e.name || "No cargado"}<br />
              <strong>Rubro:</strong> ${e.category || "No cargado"}<br />
              <strong>Zona:</strong> ${e.location || "Sin especificar"}<br />
              <strong>Alias:</strong> ${e.alias || "No cargado"}<br />
              <strong>WhatsApp:</strong> ${e.whatsapp || "No cargado"}<br />
              <strong>Necesita:</strong> ${e.help || "No especificado"}<br />
<strong>Cómo ayudar:</strong> ${e.helpText || e.help_text || "Podés apoyarlo compartiendo, recomendando o comprando."}            </div>

            <div class="story-box">
              <strong>Historia:</strong><br />
              ${e.story || "Sin historia cargada todavía."}
            </div>

            <div class="gallery-box">
              <strong>Trabajos / fotos del emprendimiento</strong>
              ${renderGallery(e.gallery)}
            </div>

            <div class="comments-box">
              <strong>Comentarios</strong>
              <div id="comments-${e.id}">
                ${renderComments(e.comments)}
              </div>

              <div class="comment-form">
                <input type="text" id="comment-author-${e.id}" class="input" placeholder="Tu nombre" />
                <textarea id="comment-text-${e.id}" class="input" placeholder="Dejale un comentario lindo o una recomendación"></textarea>
                <button class="small-btn primary" type="button" onclick="addComment('${e.id}')">Dejar comentario</button>
              </div>
            </div>
          </div>

          <div>
            <div class="message-box">
              <strong>Escribirle desde la página</strong>
              <div id="messages-${e.id}">
                ${renderMessages(e.messages)}
              </div>

              <div class="message-form">
                <input type="text" id="message-author-${e.id}" class="input" placeholder="Tu nombre" />
                <textarea id="message-text-${e.id}" class="input" placeholder="Escribile un mensaje al emprendedor"></textarea>
                <button class="small-btn" type="button" onclick="addMessage('${e.id}')">Enviar mensaje</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderHelpBoard() {
  if (!helpBoardList) return;

  helpBoardList.innerHTML = communityNeeds.map(item => `
    <article class="help-post">
      <span>${item.type}</span>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function applyFilters() {
  const search = normalize(searchInput?.value || "");
  const category = categoryFilter?.value || "all";

  const filtered = entrepreneurs.filter(e => {
    const matchesSearch =
      !search ||
      normalize(e.name).includes(search) ||
      normalize(e.brand).includes(search) ||
      normalize(e.category).includes(search) ||
      normalize(e.location).includes(search) ||
      normalize(e.services).includes(search);

    const matchesCategory = category === "all" || e.category === category;
    const matchesHelp = selectedHelp === "all" || e.help === selectedHelp;

    return matchesSearch && matchesCategory && matchesHelp;
  });

  renderList(filtered);
  updateStats(filtered);
}

function renderList(items) {
  if (!list) return;
  list.innerHTML = items.map(cardTemplate).join("");
  if (resultsCount) resultsCount.textContent = items.length;
}

function updateStats(items = entrepreneurs) {
  const total = entrepreneurs.length;
  const categories = uniqueCategories().length || 0;
  const comments = totalCommentsCount();

  if (statTotal) statTotal.textContent = total;
  if (statCategories) statCategories.textContent = categories;
  if (statComments) statComments.textContent = comments;
  if (resultsCount) resultsCount.textContent = items.length;

  if (heroTotal) heroTotal.textContent = total;
  if (heroCategories) heroCategories.textContent = categories;
  if (heroComments) heroComments.textContent = comments;
}



async function uploadImage(file, folder = "uploads") {
  if (!file) return "";

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, "-")}`;
  const filePath = `${folder}/${safeName}`;

  const { error: uploadError } = await supabase

    .storage
    .from("entrepreneurs")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase
    .storage
    .from("entrepreneurs")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

async function loadEntrepreneurs() {
  const { data, error } = await supabase
    .from("entrepreneurs")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando emprendimientos:", error);
    return;
  }

  entrepreneurs = [
    ...initialEntrepreneurs,
    ...(data || []).map(item => ({
      ...item,
      helpText: item.help_text || item.helpText || "",
      comments: item.comments || [],
      messages: item.messages || []
    }))
  ];

  fillCategoryFilter();
  applyFilters();
}

async function addEntrepreneur() {
  try {
    const photoFile = document.getElementById("photoFile")?.files?.[0] || null;
    const galleryFile1 = document.getElementById("galleryFile1")?.files?.[0] || null;
    const galleryFile2 = document.getElementById("galleryFile2")?.files?.[0] || null;
    const galleryFile3 = document.getElementById("galleryFile3")?.files?.[0] || null;

    const data = {
      name: document.getElementById("name")?.value.trim() || "",
      brand: document.getElementById("brand")?.value.trim() || "",
      category: document.getElementById("category")?.value.trim() || "",
      location: document.getElementById("location")?.value.trim() || "",
      alias: document.getElementById("alias")?.value.trim() || "",
      whatsapp: document.getElementById("whatsapp")?.value.trim() || "",
      instagram: document.getElementById("instagram")?.value.trim() || "",
      facebook: document.getElementById("facebook")?.value.trim() || "",
      tiktok: document.getElementById("tiktok")?.value.trim() || "",
      website: document.getElementById("website")?.value.trim() || "",
      services: document.getElementById("services")?.value.trim() || "",
      story: document.getElementById("story")?.value.trim() || "",
      help_text: document.getElementById("helpText")?.value.trim() || "",
      help: document.getElementById("help")?.value || "",
      shipping: document.getElementById("shipping")?.value || "",
      approved: true
    };

    if (!data.name || !data.brand || !data.category) {
      alert("Completá al menos nombre, emprendimiento y rubro.");
      return;
    }

    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.textContent = "Publicando...";
    }

    const photoUrl = photoFile ? await uploadImage(photoFile, "main") : fallbackPhoto;

    const galleryUrls = [];
    if (galleryFile1) galleryUrls.push(await uploadImage(galleryFile1, "gallery"));
    if (galleryFile2) galleryUrls.push(await uploadImage(galleryFile2, "gallery"));
    if (galleryFile3) galleryUrls.push(await uploadImage(galleryFile3, "gallery"));

    const payload = {
      ...data,
      photo: photoUrl,
      gallery: galleryUrls
    };

    const { error } = await supabase
      .from("entrepreneurs")
      .insert([payload]);

    if (error) {
      console.error("Error insertando:", error);
      alert("Hubo un error al guardar en Supabase.");
      return;
    }

    clearForm();
    await loadEntrepreneurs();
    alert("¡Emprendimiento publicado con éxito!");
  } catch (error) {
    console.error("Error general:", error);
    alert("No se pudo publicar.");
  } finally {
    if (publishBtn) {
      publishBtn.disabled = false;
      publishBtn.textContent = "Publicar emprendimiento";
    }
  }
}

function clearForm() {
  [
    "name", "brand", "category", "location", "alias", "whatsapp",
    "instagram", "facebook", "tiktok", "website",
    "services", "story", "helpText", "help", "shipping"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  ["photoFile", "galleryFile1", "galleryFile2", "galleryFile3"].forEach(id => {
    const fileInput = document.getElementById(id);
    if (fileInput) fileInput.value = "";
  });

  document.querySelectorAll(".upload small").forEach((small) => {
    small.textContent = "Ningún archivo seleccionado";
  });
}

function addComment(id) {
  const entrepreneur = entrepreneurs.find(item => item.id === id);
  if (!entrepreneur) return;

  const authorInput = document.getElementById(`comment-author-${id}`);
  const textInput = document.getElementById(`comment-text-${id}`);

  const author = authorInput?.value.trim() || "";
  const text = textInput?.value.trim() || "";

  if (!author || !text) {
    alert("Completá tu nombre y el comentario.");
    return;
  }

  entrepreneur.comments.unshift({ author, text });
  applyFilters();
}

function addMessage(id) {
  const entrepreneur = entrepreneurs.find(item => item.id === id);
  if (!entrepreneur) return;

  const authorInput = document.getElementById(`message-author-${id}`);
  const textInput = document.getElementById(`message-text-${id}`);

  const author = authorInput?.value.trim() || "";
  const text = textInput?.value.trim() || "";

  if (!author || !text) {
    alert("Completá tu nombre y el mensaje.");
    return;
  }

  entrepreneur.messages.unshift({ author, text });
  applyFilters();
}

function toggleExpand(id) {
  const block = document.getElementById(`expanded-${id}`);
  if (!block) return;
  block.classList.toggle("open");
}

function activateHelpFilter(helpValue) {
  const redSection = document.querySelector("#red");
  selectedHelp = helpValue;

  helpChips.forEach(item => {
    item.classList.toggle("active-chip", item.dataset.help === helpValue);
  });

  applyFilters();

  if (redSection) {
    redSection.scrollIntoView({ behavior: "smooth" });
  }
}

function copyAlias(id) {
  const aliasElement = document.getElementById(`alias-${id}`);
  if (!aliasElement) return;

  const text = aliasElement.textContent.trim();

  navigator.clipboard.writeText(text).then(() => {
    alert("Alias copiado: " + text);
  }).catch(() => {
    alert("No se pudo copiar el alias");
  });
}

function showAliasOnly(id) {
  const aliasElement = document.getElementById(`alias-${id}`);
  if (!aliasElement) return;

  const text = aliasElement.textContent.trim();
  alert("Alias: " + text);
}

function openPlanModal(planName, price, period) {
  if (!planModal) return;

  modalPlanName.textContent = planName;
  modalPlanPrice.textContent = price;
  modalPlanPeriod.textContent = period;
  mpAliasText.textContent = myMercadoPagoAlias;

  const message = `Hola! Quiero contratar el plan ${planName} de Red Emprende.`;
  const encoded = encodeURIComponent(message);
  modalWhatsappBtn.href = `https://wa.me/${myWhatsapp}?text=${encoded}`;

  modalAliasBox.classList.remove("open");
  planModal.classList.add("open");
}

function closePlanModal() {
  if (!planModal) return;
  planModal.classList.remove("open");
}

function toggleModalAlias() {
  if (!modalAliasBox) return;
  modalAliasBox.classList.toggle("open");
}

function copyPaymentAlias() {
  const text = myMercadoPagoAlias;

  navigator.clipboard.writeText(text).then(() => {
    alert("Alias copiado: " + text);
  }).catch(() => {
    alert("No se pudo copiar el alias");
  });
}

if (publishBtn) {
  publishBtn.addEventListener("click", addEntrepreneur);
}

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", applyFilters);
}

helpChips.forEach(chip => {
  chip.addEventListener("click", () => {
    helpChips.forEach(item => item.classList.remove("active-chip"));
    chip.classList.add("active-chip");
    selectedHelp = chip.dataset.help;
    applyFilters();
  });
});

document.querySelectorAll('.upload input[type="file"]').forEach((input) => {
  input.addEventListener('change', () => {
    const small = input.parentElement.querySelector('small');
    if (input.files.length > 0) {
      small.textContent = input.files[0].name;
    } else {
      small.textContent = 'Ningún archivo seleccionado';
    }
  });
});

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });

  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
    });
  });
}

needCards.forEach(card => {
  card.addEventListener("click", () => {
    const helpTarget = card.dataset.helpTarget;
    const scrollTarget = card.dataset.scroll;

    if (helpTarget) {
      activateHelpFilter(helpTarget);
    }

    if (scrollTarget) {
      const target = document.querySelector(scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});

if (planModal) {
  planModal.addEventListener("click", (e) => {
    if (e.target === planModal) {
      closePlanModal();
    }
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeImageModal();
  }
});

renderHelpBoard();
loadEntrepreneurs();

window.addComment = addComment;
window.addMessage = addMessage;
window.toggleExpand = toggleExpand;
window.copyAlias = copyAlias;
window.showAliasOnly = showAliasOnly;
window.openPlanModal = openPlanModal;
window.closePlanModal = closePlanModal;
window.toggleModalAlias = toggleModalAlias;
window.copyPaymentAlias = copyPaymentAlias;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;