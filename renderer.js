
window.electronAPI.onButtonClick(async (buttonId) => {
  if (!buttonId) return;
  
  // #region Barra de Busqueda
  if (buttonId === "navegator-search") {
    let player = window.player;
    
    const query = document.getElementById('query').value;

    try {
      const res = await player.search({
          query: query,
          source: "ytmsearch"
      }, { id: "2008", username: "ILoveMusic" });
      
      const track = res.tracks[0];

      console.log(track);

      if (track) {
          return { success: true, track };
      } else {
          return { success: false, error: 'Track not found' };
      }
  } catch (error) {
      console.error('Error playing track:', error);
      return { success: false, error: 'An error occurred while playing the track.' };
  }

  }

  console.log('[DEV]: Button clicked:', buttonId);
});
