console.log(1);

module.exports = {
    name: "navegator-search",
    type: "click",
    run: async (event) => { 

        console.log("1234")

    const query = event.value;
    const result = await window.electronAPI.play(query);

      if (result.success) {
        const encoded = result.track.encoded;
            
            // Intentar con diferentes tipos MIME
            const mimeTypes = [
                'audio/mp4',
                'audio/mpeg',
                'audio/ogg',
                'audio/wav'
            ];
            
            let audio;
            let supported = false;
            
            for (let i = 0; i < mimeTypes.length; i++) {
                const audioSrc = `data:${mimeTypes[i]};base64,${encoded}`;
                audio = new Audio(audioSrc);
                
                if (audio.canPlayType(mimeTypes[i])) {
                    supported = true;
                    break;
                }
            }
            
            if (supported) {
                audio.play().catch(error => {
                    console.error('Error al reproducir el audio:', error);
                    console.log(error);
                });
            } else {
                console.error('Ningún tipo MIME compatible encontrado para el audio.');
            }
        console.log('Playing track:', result.track);
      } else {
        console.error('Error:', result.error);
      }

    }
}