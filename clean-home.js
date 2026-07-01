'use strict';

(() => {
  const S = window.S52;

  S.homeMarkup = () => {
    const saved = S.load();
    return `<section class="surface hero"><p class="eyebrow">GIOCO NARRATIVO CON UN MAZZO DI CARTE</p><h2>Usa la creatività per guidare la storia verso il tuo obiettivo segreto.</h2><p>Giocate le carte, continuate ciò che è successo e costruite insieme la conclusione.</p></section><div class="home-grid">${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}<button type="button" class="choice-card" data-home-mode="guided"><span class="index">1</span><span><b>Partita con assistente</b><small>L’app prepara la storia, gli obiettivi e una guida chiara per continuare.</small></span><i>→</i></button><button type="button" class="choice-card" data-home-mode="autonomous"><span class="index">2</span><span><b>Partita autonoma</b><small>Scegliete come usare i telefoni; le regole restano disponibili durante il gioco.</small></span><i>→</i></button></div>`;
  };

  S.renderHome = () => {
    S.currentSession = null;
    S.mount(S.homeMarkup(), { session: false });
    S.play.querySelector('[data-home-mode="guided"]').addEventListener('click', () => S.renderSetup('guided'));
    S.play.querySelector('[data-home-mode="autonomous"]').addEventListener('click', () => S.renderSetup('autonomous'));
    S.play.querySelector('[data-home-resume]')?.addEventListener('click', () => S.resume(S.load()));
  };

})();
