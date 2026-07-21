'use strict';

(() => {
  const S = window.S52;

  S.inviteSessionFromUrl = async () => {
    const gameMatch = location.hash.match(/^#g=([A-Za-z0-9._-]+)$/);
    if (!gameMatch) return null;
    try {
      const session = await S.decodeGameInvite(gameMatch[1]);
      return session ? { kind: 'game', session } : null;
    } catch {
      return null;
    }
  };

  const copyableStoryContext = session => S.storyContextMarkup(session).replace(
    'class="ready-story context-story-preview"',
    'class="ready-story context-story-preview copyable-opening" data-copy-opening role="button" tabindex="0" aria-label="Copia l’incipit"'
  );
  const scrollTopButton = () => '<button type="button" class="game-scroll-top" data-game-scroll-top aria-label="Torna in alto">↑</button>';

  const personalInviteMarkup = (session, index) => {
    const objectiveButton = session.confirmed?.[index] ? 'Obiettivo letto · Riapri' : 'Mostra il mio obiettivo';
    const changePlayer = session.count > 1 ? '<button type="button" class="text-button" data-change-player>Cambia giocatore</button>' : '';
    return `<section class="surface"><div class="screen-heading"><p class="eyebrow">${S.esc(S.playerName(session, index))}</p><h2>La storia e il tuo obiettivo.</h2><p>Apri la carta soltanto quando gli altri non stanno guardando.</p></div>${copyableStoryContext(session)}<div class="actions one"><button type="button" class="primary" data-show-card>${objectiveButton}</button>${changePlayer}</div>${S.turnGuideMarkup()}<details class="accordion"><summary>Significato delle carte</summary><div class="accordion-body">${S.cardRulesMarkup()}</div></details><details class="accordion"><summary>Come si chiude la storia</summary><div class="accordion-body">${S.finalRulesMarkup()}</div></details>${scrollTopButton()}</section>`;
  };

  S.renderSharedPlayer = (session, index) => {
    if (!Number.isInteger(index) || index < 0 || index >= session.count) {
      S.renderSharedInvitePicker(session);
      return;
    }
    session.confirmed ||= Array(session.count).fill(false);
    S.mount(personalInviteMarkup(session, index), { session: true, preserveHash: true });
    S.play.querySelector('[data-show-card]')?.addEventListener('click', () => S.openObjective(session, index, true));
    S.play.querySelector('[data-change-player]')?.addEventListener('click', () => S.renderSharedInvitePicker(session));

    const opening = S.play.querySelector('[data-copy-opening]');
    const copyOpening = () => S.copy(S.storyText(session), 'Incipit copiato');
    opening?.addEventListener('click', copyOpening);
    opening?.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      copyOpening();
    });
    S.play.querySelector('[data-game-scroll-top]')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const confirmPlayer = (session, index) => {
    const name = S.playerName(session, index);
    const modal = S.modal('Conferma giocatore', `<div class="join-confirm"><p class="eyebrow">GIOCATORE ${index + 1}</p><h3>Sei ${S.esc(name)}?</h3><p>Conferma soltanto quando hai il telefono in mano e gli altri non stanno guardando.</p><div class="modal-actions"><button type="button" class="primary" data-confirm-player>Sì, apri il mio invito</button><button type="button" class="secondary" data-cancel-player>Annulla</button></div></div>`, { className: 'join-confirm-modal' });
    modal.host.querySelector('[data-confirm-player]')?.addEventListener('click', () => {
      modal.close();
      setTimeout(() => S.renderSharedPlayer(session, index), 150);
    });
    modal.host.querySelector('[data-cancel-player]')?.addEventListener('click', modal.close);
  };

  S.renderSharedInvitePicker = session => {
    const players = session.names.map((_, index) => `<button type="button" class="player-button" data-join-player="${index}"><span>${index + 1}</span><div><b>${S.esc(S.playerName(session, index))}</b><small>Apri il tuo invito personale</small></div><i>→</i></button>`).join('');
    S.mount(`<section class="surface join-surface"><div class="screen-heading"><p class="eyebrow">INVITO ALLA PARTITA</p><h2>Scegli il tuo giocatore.</h2><p>Tutti aprono lo stesso link. Seleziona soltanto il tuo nome: l’obiettivo resta nascosto finché non lo riveli.</p></div>${S.storyContextMarkup(session)}<div class="join-player-list">${players}</div><div class="privacy-inline"><span aria-hidden="true">i</span><p>I nomi servono solo per distinguere i giocatori. Non è necessario inserire nome e cognome reali.</p></div></section>`, { session: true, preserveHash: true });
    S.play.querySelectorAll('[data-join-player]').forEach(button => button.addEventListener('click', () => {
      confirmPlayer(session, Number(button.dataset.joinPlayer));
    }));
  };

  S.renderInviteFromUrl = async () => {
    const invite = await S.inviteSessionFromUrl();
    if (!invite) {
      if (/^#g=/.test(location.hash)) {
        S.mount(`<section class="surface invite-invalid"><div class="screen-heading"><p class="eyebrow">INVITO NON VALIDO</p><h2>Questo link è incompleto o danneggiato.</h2><p>Chiedi a chi ospita la partita di condividere nuovamente l’invito.</p></div><div class="actions one"><button type="button" class="primary" data-invalid-home>Torna alla home</button></div></section>`);
        S.play.querySelector('[data-invalid-home]')?.addEventListener('click', S.renderHome);
        return true;
      }
      return false;
    }
    S.renderSharedInvitePicker(invite.session);
    return true;
  };
})();
