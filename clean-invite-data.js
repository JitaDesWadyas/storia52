'use strict';
(() => {
  const S = window.S52;

  const objectiveFromParams = params => {
    if (params.get('objectiveType') === 'custom') {
      const text = S.cleanText(params.get('objectiveText') || '', 500, true);
      const finale = S.cleanText(params.get('objectiveFinale') || '', 500, true);
      if (!text || !finale) return null;
      return { custom: true, title: S.cleanText(params.get('objectiveTitle') || 'Obiettivo', 80), text, finale };
    }
    return parseCard(params.get('objective'));
  };

  const legacyInvite = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('invite') !== '1') return null;
    const objective = objectiveFromParams(params);
    if (!objective) return null;
    const source = params.get('source');
    const session = {
      version: 3, mode: 'autonomous', delivery: 'multi', source, count: 1,
      names: [S.cleanText(params.get('name') || 'Giocatore', S.limits.name) || 'Giocatore'], objectives: [objective], confirmed: [false],
      openingText: S.cleanText(params.get('opening') || '', S.limits.opening, true), spokenOpening: params.get('spoken') === '1',
      readyStoryId: source === 'ready' ? params.get('ready') || '' : '',
      story: source === 'cards' ? parseStory(params.get('story')) : null, seed: 'INVITO'
    };
    return source === 'cards' && !session.story ? null : session;
  };

  S.inviteSessionFromUrl = async () => {
    const gameMatch = location.hash.match(/^#g=([A-Za-z0-9._-]+)$/);
    if (gameMatch) {
      try {
        const session = await S.decodeGameInvite(gameMatch[1]);
        return session ? { kind: 'game', session } : null;
      } catch { return null; }
    }
    const personalMatch = location.hash.match(/^#i=([A-Za-z0-9._-]+)$/);
    if (personalMatch) {
      try {
        const session = await S.decodeInvite(personalMatch[1]);
        return session ? { kind: 'personal', session } : null;
      } catch { return null; }
    }
    const legacy = legacyInvite();
    return legacy ? { kind: 'personal', session: legacy } : null;
  };

  const personalInviteMarkup = (session, index) => {
    const objectiveButton = session.confirmed?.[index] ? 'Obiettivo letto · Riapri' : 'Mostra il mio obiettivo';
    return `<section class="surface"><div class="screen-heading"><p class="eyebrow">${S.esc(S.playerName(session, index))}</p><h2>La storia e il tuo obiettivo.</h2><p>Apri la carta soltanto quando gli altri non stanno guardando.</p></div>${S.storyContextMarkup(session)}<div class="actions one"><button type="button" class="primary" data-show-card>${objectiveButton}</button>${session.count > 1 ? '<button type="button" class="text-button" data-change-player>Cambia giocatore</button>' : ''}</div>${S.turnGuideMarkup()}<details class="accordion"><summary>Significato delle carte</summary><div class="accordion-body">${S.cardRulesMarkup()}</div></details><details class="accordion"><summary>Come si chiude la storia</summary><div class="accordion-body">${S.finalRulesMarkup()}</div></details></section>`;
  };

  S.renderSharedPlayer = (session, index) => {
    if (!Number.isInteger(index) || index < 0 || index >= session.count) return S.renderSharedInvitePicker(session);
    session.confirmed ||= Array(session.count).fill(false);
    S.mount(personalInviteMarkup(session, index), { label: 'Invito personale', session: true, preserveHash: true });
    S.play.querySelector('[data-show-card]').addEventListener('click', () => S.openObjective(session, index, true));
    S.play.querySelector('[data-change-player]')?.addEventListener('click', () => S.renderSharedInvitePicker(session));
  };

  const confirmPlayer = (session, index) => {
    const name = S.playerName(session, index);
    const modal = S.modal('Conferma giocatore', `<div class="join-confirm"><p class="eyebrow">GIOCATORE ${index + 1}</p><h3>Sei ${S.esc(name)}?</h3><p>Conferma soltanto quando hai il telefono in mano e gli altri non stanno guardando.</p><div class="modal-actions"><button type="button" class="primary" data-confirm-player>Sì, apri il mio invito</button><button type="button" class="secondary" data-cancel-player>Annulla</button></div></div>`, { className: 'join-confirm-modal' });
    modal.host.querySelector('[data-confirm-player]').addEventListener('click', () => { modal.close(); setTimeout(() => S.renderSharedPlayer(session, index), 150); });
    modal.host.querySelector('[data-cancel-player]').addEventListener('click', modal.close);
  };

  S.renderSharedInvitePicker = session => {
    S.mount(`<section class="surface join-surface"><div class="screen-heading"><p class="eyebrow">INVITO ALLA PARTITA</p><h2>Scegli il tuo giocatore.</h2><p>Tutti aprono lo stesso link. Seleziona soltanto il tuo nome: l’obiettivo resta nascosto finché non lo riveli.</p></div>${S.storyContextMarkup(session)}<div class="join-player-list">${session.names.map((_, index) => `<button type="button" class="player-button" data-join-player="${index}"><span>${index + 1}</span><div><b>${S.esc(S.playerName(session, index))}</b><small>Apri il tuo invito personale</small></div><i>→</i></button>`).join('')}</div><div class="privacy-inline"><span aria-hidden="true">i</span><p>I nomi servono solo per distinguere i giocatori. Non è necessario inserire nome e cognome reali.</p></div></section>`, { label: 'Invito alla partita', session: true, preserveHash: true });
    S.play.querySelectorAll('[data-join-player]').forEach(button => button.addEventListener('click', () => confirmPlayer(session, Number(button.dataset.joinPlayer))));
  };

  S.renderInviteFromUrl = async () => {
    const invite = await S.inviteSessionFromUrl();
    if (!invite) {
      if (/^#(?:g|i)=/.test(location.hash)) {
        S.mount(`<section class="surface invite-invalid"><div class="screen-heading"><p class="eyebrow">INVITO NON VALIDO</p><h2>Questo link è incompleto o danneggiato.</h2><p>Chiedi a chi ospita la partita di condividere nuovamente l’invito.</p></div><div class="actions one"><button type="button" class="primary" data-invalid-home>Torna alla home</button></div></section>`);
        S.play.querySelector('[data-invalid-home]').addEventListener('click', S.renderHome);
        return true;
      }
      return false;
    }
    if (invite.kind === 'game') S.renderSharedInvitePicker(invite.session);
    else S.renderSharedPlayer(invite.session, 0);
    return true;
  };
})();
