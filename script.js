(function () {
  if (window.__redEmprendeLoaded) return;
  window.__redEmprendeLoaded = true;

  // =========================
  // SUPABASE CONFIG
  // =========================
  const SUPABASE_URL = "https://nbfokxmiukvxvcemeegz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_y8V67zqJMhMktE9xoyIgOQ_T3f63VNb";

  const supabase =
    window.redEmprendeSupabase ||
    window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.redEmprendeSupabase = supabase;

  // =========================
  // ELEMENTOS
  // =========================
  const list = document.getElementById("entrepreneursList");
  const publishBtn = document.getElementById("publishBtn");

  let entrepreneurs = [];

  // =========================
  // SUBIR IMAGEN
  // =========================
  async function uploadImage(file, folder = "main") {
    if (!file) return "";

    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("entrepreneurs")
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from("entrepreneurs")
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }

  // =========================
  // CARGAR EMPRENDIMIENTOS
  // =========================
  async function loadEntrepreneurs() {
    const { data, error } = await supabase
      .from("entrepreneurs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    entrepreneurs = data;
    render();
  }

  // =========================
  // PUBLICAR
  // =========================
  async function addEntrepreneur() {
    try {
      const name = document.getElementById("name").value;
      const brand = document.getElementById("brand").value;
      const category = document.getElementById("category").value;

      if (!name || !brand || !category) {
        alert("Completá nombre, emprendimiento y rubro");
        return;
      }

      const photoFile = document.getElementById("photoFile")?.files?.[0];

      const photoUrl = photoFile
        ? await uploadImage(photoFile)
        : "";

      const payload = {
        name,
        brand,
        category,
        location: document.getElementById("location").value,
        alias: document.getElementById("alias").value,
        whatsapp: document.getElementById("whatsapp").value,
        instagram: document.getElementById("instagram").value,
        facebook: document.getElementById("facebook").value,
        tiktok: document.getElementById("tiktok").value,
        website: document.getElementById("website").value,
        photo_url: photoUrl,
        services: document.getElementById("services").value,
        story: document.getElementById("story").value,
      };

      const { error } = await supabase
        .from("entrepreneurs")
        .insert([payload]);

      if (error) throw error;

      alert("Publicado con éxito");

      loadEntrepreneurs();
    } catch (err) {
      console.error(err);
      alert("Error al publicar");
    }
  }

  // =========================
  // RENDER
  // =========================
  function render() {
    list.innerHTML = "";

    entrepreneurs.forEach((e) => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <img src="${e.photo_url || ""}" />
        <h3>${e.brand}</h3>
        <p>${e.category}</p>
        <small>${e.location || ""}</small>
      `;

      list.appendChild(div);
    });
  }

  // =========================
  // EVENTOS
  // =========================
  publishBtn.addEventListener("click", addEntrepreneur);

  // =========================
  // INIT
  // =========================
  loadEntrepreneurs();
})();