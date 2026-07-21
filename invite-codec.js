'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const GAME_PREFIX = 'r3.';

  const toBase64Url = value => {
    const bytes = encoder.encode(String(value || ''));
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };

  const fromBase64Url = value => {
    const normalized = String(value || '');
    if (!/^[A-Za-z0-9_-]*$/.test(normalized)) throw new Error('Codice non valido');
    const padded = normalized.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    return decoder.decode(Uint8Array.from(binary, character => character.charCodeAt(0)));
  };

  const validCount = value => Math.max(2, Math.min(8, Number(value) || 2));
  const storyById = id => S.stories.find(story => story.id === id) || null;
  const collectionId = () => S.primaryCollectionId || window.STORIA52_PRIMARY_COLLECTION_ID || 'prima-scintilla';
  const namesFor = (names, count) => Array.from({ length: count }, (_, index) => S.cleanName(names?.[index], index));
  const compactNames = (names, count) => namesFor(names, count).map((name, index) => name === `Giocatore ${index + 1}` ? '' : name);

  const validReadySession = session => {
    const story = storyById(session?.readyStoryId);
    return Boolean(
      session
      && session.source === 'ready'
      && session.collectionId === collectionId()
      && S.storyAllowedInSession?.(session, story)
    );
  };

  S.encodeGameInvite = async session => {
    S.normalizeSession?.(session);
    if (!validReadySession(session)) throw new Error('Scegliete una storia prima di creare l’invito.');

    const count = validCount(session.count);
    const names = compactNames(session.names, count);
    const namesCode = names.some(Boolean) ? `.${toBase64Url(JSON.stringify(names))}` : '';
    return `${GAME_PREFIX}${session.readyStoryId}.${count.toString(36)}${namesCode}`;
  };

  S.decodeGameInvite = async code => {
    const safeCode = String(code || '');
    if (!safeCode.startsWith(GAME_PREFIX) || safeCode.length > S.limits.inviteCode) return null;

    const parts = safeCode.split('.');
    const story = storyById(parts[1]);
    const count = validCount(parseInt(parts[2], 36));
    if (!story || !parts[2]) return null;

    let names = [];
    if (parts[3]) {
      try { names = JSON.parse(fromBase64Url(parts.slice(3).join('.'))); }
      catch { return null; }
    }

    const session = {
      version: 5,
      mode: 'autonomous',
      delivery: 'multi',
      source: 'ready',
      collectionId: collectionId(),
      stage: 'game',
      count,
      names: namesFor(Array.isArray(names) ? names : [], count),
      objectives: S.objectivesForReadyStory?.(story, count, 'INVITO-COMUNE') || [],
      confirmed: Array(count).fill(false),
      openingText: story.opening,
      spokenOpening: false,
      readyStoryId: story.id,
      story: null,
      openingNotes: { protagonist: '', setting: '', action: '', problem: '' },
      seed: 'INVITO-COMUNE'
    };

    return S.normalizeSession?.(session) || session;
  };
})();
