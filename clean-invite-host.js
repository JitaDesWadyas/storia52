'use strict';
(() => {
  const S = window.S52;

  S.createGameInviteUrl = async session => {
    const url = new URL(location.href);
    url.search = '';
    url.hash = `g=${await S.encodeGameInvite(session)}`;
    return url.toString();
  };

  const qrMarkup = (label, url, compact = false) => {
    let svg;
    try { svg = window.EpoiQr.toSvg(url, { dark: '#2d2418', light: '#fff9ee', margin: 4 }); }
    catch { svg = '<span class="qr-error">QR non disponibile</span>'; }
    return `<span class="epoi-qr${compact ? ' is-compact' : ''}" data-qr-visual aria-label="QR della partita: ${S.esc(label)}">${svg}<span class="epoi-qr-logo" aria-hidden="true"><img src="storia52-cards-logo.svg" alt="" draggable="false"></span><i aria-hidden="true"></i></span>`;
  };

  S.openInviteQr = (label, url) => {
    const body = `<div class="qr-modal-content"><p class="eyebrow">INVITO UNICO</p>${qrMarkup(label, url)}<h3>Scansiona, scegli il tuo nome, gioca.</h3><p>Il QR viene generato direttamente su questo dispositivo. Non passa da servizi esterni.</p><div class="modal-actions"><button type="button" class="primary" data-copy-qr-link>Copia link</button></div></div>`;
    const modal = S.modal('QR della partita', body, { className: 'qr-modal' });
    modal.host.querySelector('[data-copy-qr-link]')?.addEventListener('click', () => S.copy(url, 'Link copiato'));
  };

  const playerListMarkup = session => `<div class="shared-invite-players"><p class="eyebrow">GIOCATORI</p><div>${session.names.map((name, index) => `<span><b>${index + 1}</b>${S.esc(S.cleanName(name, index))}</span>`).join('')}</div></div>`;

  const renderInviteError = (session, error) => {
    S.mount(`<section class="surface invite-error"><div class="screen-heading"><p class="eyebrow">INVITO NON CREATO</p><h2>Il contenuto è troppo lungo.</h2><p>${S.esc(error?.message || 'Riducete il testo dell’incipit e riprovate.')}</p></div><div class="hint"><b>Nessun dato è stato perso.</b> Tornate indietro, accorciate il riassunto e ricreate l’invito.</div><div class="actions"><button type="button" class="secondary" data-back-source>Modifica incipit</button><button type="button" class="primary" data-retry-invite>Riprova</button></div></section>`, { label: 'Invito', session: true });
    S.play.querySelector('[data-back-source]').addEventListener('click', () => session.source === 'cards' ? S.renderCardsSource(session) : S.renderSetup('play', session));
    S.play.querySelector('[data-retry-invite]').addEventListener('click', () => S.renderInvites(session));
  };

  S.renderInvites = async session => {
    session.stage = 'invites';
    session.names = S.normalizeNames(session.count, session.names);
    session.openingText = S.cleanText(session.openingText || '', S.limits.opening, true);
    S.save(session);
    S.mount('<section class="surface invite-loading"><span class="invite-loading-mark">?</span><h2>Creo l’invito unico.</h2><p>Storia, giocatori e obiettivi vengono preparati sul dispositivo.</p></section>', { label: 'Invito', session: true });
    let url;
    try { url = await S.createGameInviteUrl(session); }
    catch (error) { renderInviteError(session, error); return; }

    const linkSize = new TextEncoder().encode(url).length;
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">TELEFONI SEPARATI</p><h2>Un solo invito per tutta la partita.</h2><p>Condividete questo link o QR nel gruppo. Ogni persona seleziona il proprio nome e apre soltanto il proprio obiettivo.</p></div>${S.storyContextMarkup(session)}<div class="shared-invite-card"><button type="button" class="shared-qr-button" data-open-shared-qr aria-label="Ingrandisci il QR della partita">${qrMarkup('E POI?', url, true)}</button><div class="shared-invite-copy"><p class="eyebrow">INVITO DELLA PARTITA</p><h3>Un link. ${session.count} giocatori.</h3><p>Niente inviti duplicati e nessun nome chilometrico nel messaggio. Il codice pesa <strong>${linkSize} byte</strong>.</p><div class="invite-actions"><button type="button" class="primary" data-share-game>Condividi</button><button type="button" class="secondary" data-copy-game>Copia link</button></div></div></div>${playerListMarkup(session)}<div class="privacy-inline"><span aria-hidden="true">✓</span><p><b>QR locale.</b> L’immagine viene costruita nel browser; il contenuto dell’invito non viene inviato a un generatore QR esterno.</p></div><div class="actions one"><button type="button" class="primary" data-open-host-guide>Apri la guida di gioco</button></div></section>`, { label: 'Partita autonoma', session: true });

    S.play.querySelector('[data-open-shared-qr]').addEventListener('click', () => S.openInviteQr('E POI?', url));
    S.play.querySelector('[data-copy-game]').addEventListener('click', () => S.copy(url, 'Link copiato'));
    S.play.querySelector('[data-share-game]').addEventListener('click', async () => {
      if (!navigator.share) { S.copy(url, 'Link copiato'); return; }
      try { await navigator.share({ title: 'E POI?', text: 'Questo è l’invito alla nostra partita di E POI?. Aprilo e scegli il tuo giocatore.', url }); }
      catch { /* Condivisione annullata. */ }
    });
    S.play.querySelector('[data-open-host-guide]').addEventListener('click', () => S.renderHostGame(session));
  };

  S.renderHostGame = session => {
    session.stage = 'game';
    S.save(session);
    S.mount(`<section class="surface"><div class="screen-heading"><p class="eyebrow">PARTITA AUTONOMA</p><h2>Continuate la storia.</h2></div>${S.storyContextMarkup(session)}${S.turnGuideMarkup()}<details class="accordion"><summary>Significato delle carte</summary><div class="accordion-body">${S.cardRulesMarkup()}</div></details><details class="accordion"><summary>Come si chiude la storia</summary><div class="accordion-body">${S.finalRulesMarkup()}</div></details><div class="actions one"><button type="button" class="secondary" data-return-invites>Torna all’invito</button></div></section>`, { label: 'Partita autonoma', session: true });
    S.play.querySelector('[data-return-invites]').addEventListener('click', () => S.renderInvites(session));
  };
})();
