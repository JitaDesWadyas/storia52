'use strict';

(() => {
  const S = window.S52;

  const copyableStoryContext = session => S.storyContextMarkup(session).replace(
    'class="ready-story context-story-preview"',
    'class="ready-story context-story-preview copyable-opening" data-copy-opening role="button" tabindex="0" aria-label="Copia l’incipit"'
  );

  const scrollTopButton = () => '<button type="button" class="game-scroll-top" data-game-scroll-top aria-label="Torna in alto">↑</button>';

  const bindGameUtilities = session => {
    const opening = S.play.querySelector('[data-copy-opening]');
    const copyOpening = () => S.copy(S.storyText(session), 'Incipit copiato');
    opening?.addEventListener('click', copyOpening);
    opening?.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      copyOpening();
    });
    S.play.querySelector('[data-game-scroll-top]')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  S.renderPreparation = (session, scroll = true) => {
    if (session.delivery === 'multi') {
      S.renderInvites(session);
      return;
    }
    session.cardMode = 'physical';
    session.stage = 'prep';
    S.save(session);
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">PREPARAZIONE</p><h2>Preparate il tavolo.</h2><p>Serve un normale mazzo francese da 52 carte: uno dei mazzi usati, per esempio, a Scala 40.</p></div>${S.storyContextMarkup(session)}<div class="section-title"><span>PRIMA DI INIZIARE</span><h3>Tre cose.</h3></div><div class="prep-grid"><article class="prep-step"><span>1</span><div><b>Togliete i jolly e mescolate le 52 carte.</b></div></article><article class="prep-step"><span>2</span><div><b>Date 5 carte a ogni giocatore.</b></div></article><article class="prep-step"><span>3</span><div><b>Mettete mazzo e scarti al centro.</b></div></article></div><div class="actions one"><button type="button" class="primary" data-ready-to-play>Siamo pronti</button></div></section>`, { session: true, scroll });
    S.play.querySelector('[data-ready-to-play]')?.addEventListener('click', () => S.renderGame(session));
  };

  S.renderGame = session => {
    session.stage = 'game';
    S.save(session);
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">PARTITA IN CORSO</p><h2>Continuate la storia.</h2></div><div class="game-layout"><main class="game-main">${copyableStoryContext(session)}${S.turnGuideMarkup()}<details class="accordion"><summary>Significato delle carte</summary><div class="accordion-body">${S.cardRulesMarkup()}</div></details><details class="accordion"><summary>Come si chiude la storia</summary><div class="accordion-body">${S.finalRulesMarkup()}</div></details></main><aside class="game-side"><section class="game-card"><h3>Obiettivi segreti</h3><div class="compact-player-list">${session.objectives.map((_, index) => `<button type="button" data-game-objective="${index}"><span>${S.esc(S.playerName(session, index))}</span><span>Apri</span></button>`).join('')}</div></section></aside></div>${scrollTopButton()}</section>`, { session: true });
    S.play.querySelectorAll('[data-game-objective]').forEach(button => button.addEventListener('click', () => S.openObjective(session, Number(button.dataset.gameObjective), true)));
    bindGameUtilities(session);
  };
})();
