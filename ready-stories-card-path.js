'use strict';
(() => {
  const G = window.G52;
  if (!G?.flow) return;
  const previous = G.flow.story;
  G.flow.story = session => {
    previous(session);
    if (session?.openingSource !== 'cards-manual') return;
    const heading = G.game.querySelector('.screen-heading');
    const eyebrow = heading?.querySelector('.eyebrow');
    const title = heading?.querySelector('h2');
    if (eyebrow) eyebrow.textContent = 'FASE 1 · INVENTATE L’INCIPIT';
    if (title) title.textContent = 'Queste quattro carte sono il materiale della vostra storia.';
    const reference = G.game.querySelector('.story-reference');
    if (reference && !G.game.querySelector('.card-builder-intro')) {
      const note = document.createElement('section');
      note.className = 'card-builder-intro';
      note.innerHTML = '<span>COME FUNZIONA</span><b>Non sono quattro frasi da incollare.</b><p>Decidete chi è concretamente il protagonista, dove comincia la scena, che cosa sta facendo per raggiungere l’obiettivo e come il problema lo blocca. L’app ve lo chiederà un passaggio alla volta.</p>';
      reference.after(note);
    }
    const button = G.game.querySelector('#buildOpening');
    if (button) button.textContent = 'Costruiamo il nostro incipit';
  };
})();
