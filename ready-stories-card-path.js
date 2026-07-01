'use strict';
(() => {
  const G = window.G52;
  if (!G?.flow) return;

  if (!document.querySelector('#ready-card-path-style')) {
    const style = document.createElement('style');
    style.id = 'ready-card-path-style';
    style.textContent = '.card-builder-intro{display:grid;gap:5px;margin:12px 0 14px;padding:14px 15px;color:var(--card-ink);background:var(--card-bg-2);border:1px solid var(--card-line-soft);border-left:5px solid var(--amber);border-radius:8px}.card-builder-intro>span{color:var(--amber-deep);font-size:.63rem;font-weight:950;letter-spacing:.1em}.card-builder-intro>b{font:700 1.05rem Georgia,serif}.card-builder-intro>p{margin:0;color:var(--card-muted);line-height:1.45}';
    document.head.appendChild(style);
  }

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
