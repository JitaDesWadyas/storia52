'use strict';
(() => {
  const S = window.S52;
  S.createInviteUrl = (session, index, objective) => {
    const url = new URL(location.href);
    url.search = '';
    url.hash = 'play';
    url.searchParams.set('invite', '1');
    url.searchParams.set('name', session.names[index]);
    if (objective?.custom) {
      url.searchParams.set('objectiveType', 'custom');
      url.searchParams.set('objectiveTitle', objective.title || 'Obiettivo');
      url.searchParams.set('objectiveText', objective.text || '');
      url.searchParams.set('objectiveFinale', objective.finale || '');
    } else {
      url.searchParams.set('objective', serializeCard(objective));
    }
    url.searchParams.set('source', session.source);
    if (session.source === 'ready') url.searchParams.set('ready', session.readyStoryId);
    else url.searchParams.set('story', serializeStory(session.story));
    if (session.openingText) url.searchParams.set('opening', session.openingText);
    if (session.spokenOpening) url.searchParams.set('spoken', '1');
    return url.toString();
  };

  S.renderInvites = session => {
    session.stage = 'invites';
    S.save(session);
    const links = session.objectives.map((objective, index) => S.createInviteUrl(session, index, objective));
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">UN TELEFONO A TESTA</p><h2>Condividete un link a ogni giocatore.</h2><p>Ogni link contiene la stessa storia, un obiettivo personale e le regole per continuare.</p></div>${S.storyContextMarkup(session)}<div class="invite-list">${session.names.map((name, index) => `<div class="invite-row"><b>${S.esc(name)}</b><button type="button" data-invite-index="${index}">Condividi link</button></div>`).join('')}</div><div class="actions one"><button type="button" class="primary" data-open-host-guide>Apri la guida di gioco</button></div></section>`, { label: 'Partita autonoma', session: true });
    S.play.querySelectorAll('[data-invite-index]').forEach(button => button.addEventListener('click', async () => {
      const index = Number(button.dataset.inviteIndex);
      const url = links[index];
      if (navigator.share) {
        try { await navigator.share({ title: 'STORIA 52', text: `Invito per ${session.names[index]}`, url }); }
        catch { /* Condivisione annullata. */ }
      } else S.copy(url, 'Link copiato');
    }));
    S.play.querySelector('[data-open-host-guide]').addEventListener('click', () => S.renderHostGame(session));
  };

  S.renderHostGame = session => {
    session.stage = 'game';
    S.save(session);
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">PARTITA AUTONOMA</p><h2>Continuate la storia.</h2></div>${S.storyContextMarkup(session)}${S.turnGuideMarkup()}<details class="accordion"><summary>Significato delle carte</summary><div class="accordion-body">${S.cardRulesMarkup()}</div></details><details class="accordion"><summary>Come si chiude la storia</summary><div class="accordion-body">${S.finalRulesMarkup()}</div></details><div class="actions one"><button type="button" class="secondary" data-return-invites>Torna agli inviti</button></div></section>`, { label: 'Partita autonoma', session: true });
    S.play.querySelector('[data-return-invites]').addEventListener('click', () => S.renderInvites(session));
  };
})();
