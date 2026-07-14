'use strict';
(() => {
  const S = window.S52;

  S.createInviteUrl = async (session, index, objective) => {
    const url = new URL(location.href);
    url.search = '';
    url.hash = `i=${await S.encodeInvite(session, index, objective)}`;
    return url.toString();
  };

  const qrUrl = url => `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=14&ecc=M&format=svg&color=2D2418&bgcolor=FFF9EE&data=${encodeURIComponent(url)}`;
  const qrMarkup = (name, url, compact = false) => `<span class="epoi-qr${compact ? ' is-compact' : ''}"><img src="${qrUrl(url)}" alt="QR personale per ${S.esc(name)}"><span class="epoi-qr-logo" aria-hidden="true"><img src="storia52-cards-logo.svg" alt=""></span><i aria-hidden="true"></i></span>`;

  S.openInviteQr = (name, url) => {
    const body = `<div class="qr-modal-content"><p class="eyebrow">INVITO DI ${S.esc(name).toUpperCase()}</p>${qrMarkup(name, url)}<h3>Scansiona e gioca.</h3><p>Il link contiene soltanto ciò che serve a questo giocatore: <strong>storia e obiettivo personale</strong>.</p><div class="modal-actions"><button type="button" class="primary" data-copy-qr-link>Copia link</button></div></div>`;
    const modal = S.modal('QR personale', body, { className: 'qr-modal' });
    modal.host.querySelector('[data-copy-qr-link]')?.addEventListener('click', () => S.copy(url, 'Link copiato'));
  };

  S.renderInvites = async session => {
    session.stage = 'invites';
    S.save(session);
    S.mount('<section class="surface invite-loading"><span class="invite-loading-mark">?</span><h2>Creo gli inviti.</h2><p>Sto preparando link compatti e QR personali.</p></section>', { label: 'Inviti', session: true });
    const links = await Promise.all(session.objectives.map((objective, index) => S.createInviteUrl(session, index, objective)));
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">TELEFONI SEPARATI</p><h2>Un invito per ogni giocatore.</h2><p>Ogni QR apre soltanto la storia e l’obiettivo della persona indicata.</p></div>${S.storyContextMarkup(session)}<div class="invite-list qr-invite-list">${session.names.map((name, index) => `<div class="invite-row qr-invite-row"><div class="invite-person"><span>${index + 1}</span><div><b>${S.esc(name)}</b><small>Obiettivo segreto personale</small></div></div><button type="button" class="qr-thumb" data-qr-index="${index}" aria-label="Ingrandisci QR di ${S.esc(name)}">${qrMarkup(name, links[index], true)}</button><div class="invite-actions"><button type="button" data-invite-index="${index}">Condividi</button><button type="button" data-copy-index="${index}">Copia link</button></div></div>`).join('')}</div><div class="actions one"><button type="button" class="primary" data-open-host-guide>Apri la guida di gioco</button></div></section>`, { label: 'Partita autonoma', session: true });

    S.play.querySelectorAll('[data-invite-index]').forEach(button => button.addEventListener('click', async () => {
      const index = Number(button.dataset.inviteIndex);
      const url = links[index];
      if (navigator.share) {
        try { await navigator.share({ title: 'E POI?', text: `${session.names[index]}, questo è il tuo invito personale a E POI?`, url }); }
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
