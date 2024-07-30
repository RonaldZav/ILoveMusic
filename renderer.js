window.electronAPI.onButtonClick(async (buttonId) => {
  if (!buttonId) return;

  if (buttonId === "navegator-search") {
    const query = document.getElementById('query').value.trim();
    if (query) {
      console.log('Button clicked, sending query:', query);
      window.electronAPI.sendQuery(query);
    } else {
      console.log('La consulta está vacía.');
    }
  }

  console.log('[DEV]: Button clicked:', buttonId);
});


// https://www.youtube.com/watch?v=3_zaJtjd914