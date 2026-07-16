'use strict';
(() => {
  const S = window.S52;
  const SAFE_QR_CODE_LENGTH = 1500;

  S.createGameInviteUrl = async session => {
    const code = await S.encodeGameInvite(session);
    if (code.length > SAFE_QR_CODE_LENGTH) throw new Error('L’invito è troppo lungo per un QR affidabile: accorciate l’incipit.');
    const url = new URL(location.href);
    url.search = '';
    url.hash = `g=${code}`;
    return url.toString();
  };

  const brandMark = () => `<svg class="epoi-qr-brand" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="8" y="11" width="29" height="39" rx="7" fill="#fff9ee" stroke="#d69820" stroke-width="4" transform="rotate(-8 22.5 30.5)"/><rect x="26" y="14" width="29" height="39" rx="7" fill="#fff9ee" stroke="#2d2418" stroke-width="4" transform="rotate(8 40.5 33.5)"/><circle cx="35" cy="29" r="2.3" fill="#d69820"/><circle cx="46" cy="30.5" r="2.3" fill="#2d2418"/><path d="M35 40c4 3 8 3 12 0" fill="none" stroke="#2d2418" stroke-width="3" stroke-linecap="round"/></svg>`;

  const qrMarkup = (label, url, compact = false) => {
    let svg;
    try { svg = window.EpoiQr.toSvg(url, { dark: '#2d2418', light: '#fff9ee', margin: 4, label: `QR della partita ${label}` }); }
    catch { svg = '<span class="qr-error">QR non disponibile. Usa “Copia link”.</span>'; }
    return `<span class="epoi-qr${compact ? ' is-compact' : ''}" data-qr-visual aria-label="QR della partita: ${S.esc(label)}">${svg}<span class="epoi-qr-logo" aria-hidden="true">${brandMark()}</span><i aria-hidden="true"></i></span>`;
  };

  S.openInviteQr = (label, url) => {
    const body = `<div class="qr-modal-content"><p class="eyebrow">SCANSIONA PER ENTRARE</p>${qrMarkup(label, url)}<h3>Apri il link e scegli il tuo nome.</h3><p>Gli altri possono inquadrare direttamente questo schermo.</p><div class="modal-actions"><button type="button" class="primary" data-copy-qr-link>Copia link</button></div></div>`;
    const modal = S.modal('QR della partita', body, { className: 'qr-modal' });
    modal.host.querySelector('[data-copy-qr-link]')?.addEventListener('click', () => S.copy(url, 'Link copiato'));
  };

  const loadingMarkup = () => `<section class="surface app-skeleton invite-skeleton" aria-busy="true" aria-label="Preparazione dell’invito"><div class="skeleton-heading"><span class="skeleton-line skeleton-kicker"></span><span class="skeleton-line skeleton-title"></span><span class="skeleton-line skeleton-copy"></span></div><div class="skeleton-invite-card"><span class="skeleton-qr"></span><div><span class="skeleton-line skeleton-subtitle"></span><span class="skeleton-line skeleton-copy"></span><span class="skeleton-button-row"><i></i><i></i></span></div></div></section>`;

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
    S.mount(loadingMarkup(), { label: 'Invito', session: true });

    const qrPromise = window.EpoiQrReady || Promise.resolve(window.EpoiQr);
    let url;
    try { url = await S.createGameInviteUrl(session); }
    catch (error) { renderInviteError(session, error); return; }
    await qrPromise.catch(() => null);

    const qrAvailable = Boolean(window.EpoiQr);
    S.mount(`<section class="surface invite-ready-screen"><div class="screen-heading invite-ready-heading"><p class="eyebrow">INVITA GLI ALTRI</p><h2>Un QR per tutta la partita.</h2><p>Mostralo agli altri oppure condividi il link. Ognuno sceglie il proprio nome e vede solo il suo obiettivo.</p></div><div class="invite-ready-card"><button type="button" class="shared-qr-button" data-open-shared-qr aria-label="Ingrandisci il QR della partita"${qrAvailable ? '' : ' disabled'}>${qrMarkup('E POI?', url, true)}</button><div class="invite-ready-copy"><p class="eyebrow">ENTRA NELLA PARTITA</p><h3>Scansiona o condividi.</h3><p>${session.count} giocatori useranno lo stesso invito.</p><div class="invite-actions"><button type="button" class="primary" data-share-game>Condividi link</button><button type="button" class="secondary" data-copy-game>Copia link</button></div></div></div><button type="button" class="primary invite-continue" data-open-host-guide>Apri la guida e inizia</button><details class="invite-story-details"><summary>Rivedi l’incipit</summary><div>${S.storyContextMarkup(session)}</div></details></section>`, { label: 'Partita autonoma', session: true });

    S.play.querySelector('[data-open-shared-qr]')?.addEventListener('click', () => S.openInviteQr('E POI?', url));
    S.play.querySelector('[data-copy-game]').addEventListener('click', () => S.copy(url, 'Link copiato'));
    S.play.querySelector('[data-share-game]').addEventListener('click', async () => {
      if (!navigator.share) { S.copy(url, 'Link copiato'); return; }
      try { await navigator.share({ title: 'E POI?', text: 'Apri l’invito alla nostra partita di E POI? e scegli il tuo giocatore.', url }); }
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
