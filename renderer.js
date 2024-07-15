window.addEventListener('DOMContentLoaded', async () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector);
      if (element) element.innerText = text;
    };
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type]);
    }
  
    const events = await window.electronAPI.getEvents();
  
    events.forEach(event => {
      const element = document.getElementById(event.name);
      if (element) {
        element.addEventListener(event.type, async () => {
          await event.run(element);
        });
      }
    });
  });
  