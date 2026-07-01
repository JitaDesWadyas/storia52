'use strict';
(() => {
  const S = window.S52;
  S.renderPreparation = session => {
    session.stage = 'prep';
    S.save(session);
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">PREPARAZIONE</p><h2>Preparate il tavolo.</h2></div>${S.storyContextMarkup(session)}<div class="section-title"><span>PRIMA DI INIZIARE</span><h3>Tre cose.</h3></div><div class="prep-grid"><article class="prep-step"><span>1</span><div><b>Togliete i jolly e mescolate.</b></div></article><article class="prep-step"><span>2</span><div><b>Date 5 carte a ogni giocatore.</b></div></article><article class="prep-step"><span>3</span><div><b>Mettete mazzo e scarti al centro.</b></div></article></div><div class="actions one"><button type="button" class="primary" data-ready-to-play>Siamo pronti</button></div></section>`, { label: session.mode === 'guided' ? 'Partita con assistente' : 'Partita autonoma', session: true });
    S.play.querySelector('[data-ready-to-play]').addEventListener('click', () => S.renderGame(session));
  };

  S.renderGame = session => {
    session.stage = 'game';
    S.save(session);
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">PARTITA IN CORSO</p><h2>Continuate la storia.</h2></div><div class="game-layout"><main class="game-main">${S.storyContextMarkup(session)}${S.turnGuideMarkup()}<details class="accordion"><summary>Significato delle carte</summary><div class="accordion-body">${S.cardRulesMarkup()}</div></details><details class="accordion"><summary>Come si chiude la storia</summary><div class="accordion-body">${S.finalRulesMarkup()}</div></details></main><aside class="game-side"><section class="game-card"><h3>Obiettivi segreti</h3><div class="compact-player-list">${session.objectives.map((_, index) => `<button type="button" data-game-objective="${index}"><span>${S.esc(S.playerName(session, index))}</span><span>Apri</span></button>`).join('')}</div></section><section class="game-card"><h3>Strumenti</h3><div class="actions one"><button type="button" class="secondary" data-copy-story>Copia l’incipit</button><button type="button" class="secondary" data-print-story>Stampa / salva PDF</button></div></section></aside></div></section>`, { label: session.mode === 'guided' ? 'Partita con assistente' : 'Partita autonoma', session: true });
    S.play.querySelectorAll('[data-game-objective]').forEach(button => button.addEventListener('click', () => S.openObjective(session, Number(button.dataset.gameObjective), true)));
    S.play.querySelector('[data-copy-story]').addEventListener('click', () => S.copy(S.storyText(session), 'Incipit copiato'));
    S.play.querySelector('[data-print-story]').addEventListener('click', () => S.printStory(session));
  };
})();
