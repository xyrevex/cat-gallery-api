async function loadGallery() {
  try {
    const res = await fetch("https://92f920f6d4409b6e49817851354326d6.r2.cloudflarestorage.com/cat/gallery.json");
    const data = await res.json();
    catUrls = data.catUrls || [];
    catUrls.sort((a,b)=>new Date(b.time)-new Date(a.time));
    gallery.innerHTML = "";
    catUrls.forEach(item => {
      const username = item.username || "Anonymous";
      addCatToGallery(item.url, item.time, username);
    });
    catCount.textContent = `Total Cats: ${catUrls.length}`;
  } catch (err) {
    console.error(err);
    status.textContent = "Could not load gallery.";
  }
}
