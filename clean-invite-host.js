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

  const qrUrl = url => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(url)}`;

  S.openInviteQr = (name, url) => {
    const body = `<div class="qr-modal-content"><p class="eyebrow">${S.esc(name)}</p><img src="${qrUrl(url)}" alt="QR personale per ${S.esc(name)}"><p>Scansiona questo QR con il telefono del giocatore. Contiene <strong>storia e obiettivo personale</strong>.</p><div class="modal-actions"><button type="button" class="primary" data-copy-qr-link>Copia link</button></div></div>`;
    const modal = S.modal('QR personale', body, { className: 'qr-modal' });
    modal.host.querySelector('[data-copy-qr-link]')?.addEventListener('click', () => S.copy(url, 'Link copiato'));
  };

  S.renderInvites = session => {
    session.stage = 'invites';
    S.save(session);
    const links = session.objectives.map((objective, index) => S.createInviteUrl(session, index, objective));
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">TELEFONI SEPARATI</p><h2>Un link personale per ogni giocatore.</h2><p>Ogni riga ha <strong>QR ingrandibile</strong> e link personale. Nessuno vede l'obiettivo degli altri.</p></div>${S.storyContextMarkup(session)}<div class="invite-list qr-invite-list">${session.names.map((name, index) => `<div class="invite-row qr-invite-row"><div><b>${S.esc(name)}</b><small>Storia + obiettivo segreto personale</small></div><button type="button" class="qr-thumb" data-qr-index="${index}" aria-label="Ingrandisci QR di ${S.esc(name)}"><img src="${qrUrl(links[index])}" alt=""></button><div class="invite-actions"><button type="button" data-invite-index="${index}">Condividi</button><button type="button" data-copy-index="${index}">Copia</button></div></div>`).join('')}</div><div class="actions one"><button type="button" class="primary" data-open-host-guide>Apri la guida di gioco</button></div></section>`, { label: 'Partita autonoma', session: true });
    S.play.querySelectorAll('[data-invite-index]').forEach(button => button.addEventListener('click', async () => {
      const index = Number(button.dataset.inviteIndex);
      const url = links[index];
      if (navigator.share) {
        try { await navigator.share({ title: 'E POI?', text: `Invito per ${session.names[index]}`, url }); }
        catch { /* Condivisione annullata. */ }
      } else S.copy(url, 'Link copiato');
    }));
    S.play.querySelectorAll('[data-copy-index]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.copyIndex);
      S.copy(links[index], 'Link copiato');
    }));
    S.play.querySelectorAll('[data-qr-index]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.qrIndex);
      S.openInviteQr(session.names[index], links[index]);
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