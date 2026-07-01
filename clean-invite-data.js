'use strict';
(() => {
  const S = window.S52;
  S.inviteSessionFromUrl = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('invite') !== '1') return null;
    const objective = parseCard(params.get('objective'));
    if (!objective) return null;
    const source = params.get('source');
    const session = {
      version: 3, mode: 'autonomous', delivery: 'multi', source, count: 1,
      names: [params.get('name') || 'Giocatore'], objectives: [objective], confirmed: [false],
      openingText: params.get('opening') || '', spokenOpening: params.get('spoken') === '1',
      readyStoryId: source === 'ready' ? params.get('ready') || '' : '',
      story: source === 'cards' ? parseStory(params.get('story')) : null, seed: 'INVITO'
    };
    return source === 'cards' && !session.story ? null : session;
  };

  S.renderInviteFromUrl = () => {
    const session = S.inviteSessionFromUrl();
    if (!session) return false;
    const html = `<section class="surface"><div class="screen-heading"><p class="eyebrow">${S.esc(session.names[0])}</p><h2>La storia e la tua carta.</h2></div>${S.storyContextMarkup(session)}<div class="actions one"><button type="button" class="primary" data-show-card>Mostra la mia carta</button></div>${S.turnGuideMarkup()}<details class="accordion"><summary>Significato delle carte</summary><div class="accordion-body">${S.cardRulesMarkup()}</div></details><details class="accordion"><summary>Come si chiude la storia</summary><div class="accordion-body">${S.finalRulesMarkup()}</div></details></section>`;
    S.mount(html, { label: 'Invito personale', session: true });
    S.play.querySelector('[data-show-card]').addEventListener('click', () => S.openObjective(session, 0, true));
    return true;
  };
})();
