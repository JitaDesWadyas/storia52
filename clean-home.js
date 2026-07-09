'use strict';

(() => {
  const S = window.S52;

  S.homeMarkup = () => {
    const saved = S.load();
    return `<section class="surface hero"><p class="eyebrow">GIOCO NARRATIVO CON UN MAZZO DI CARTE</p><h2>Guida la storia verso il tuo obiettivo segreto.</h2><p>Ogni carta cambia ciò che succede. Ogni giocatore prova a portare la storia al proprio finale.</p></section><div class="home-grid">${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}<button type="button" class="choice-card play-card" data-home-play><span class="index">▶</span><span><b>Gioca</b><small>Scegliete una storia pronta, leggete gli obiettivi segreti e iniziate subito.</small></span><i>→</i></button></div>`;
  };

  S.renderHome = () => {
    S.currentSession = null;
    S.mount(S.homeMarkup(), { session: false });
    S.play.querySelector('[data-home-play]').addEventListener('click', () => S.renderSetup('play'));
    S.play.querySelector('[data-home-resume]')?.addEventListener('click', () => S.resume(S.load()));
  };

})();