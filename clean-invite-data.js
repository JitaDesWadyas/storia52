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
})();
