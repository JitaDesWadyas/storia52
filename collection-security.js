'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const availableCollectionId = window.STORIA52_PRIMARY_COLLECTION_ID || 'prima-scintilla';
  const validReadySession = session => {
    const story = S.readyStory(session || {});
    return Boolean(session && session.source === 'ready' && session.collectionId === availableCollectionId && S.storyAllowedInSession?.(session, story));
  };

  const originalSave = S.save;
  S.save = session => {
    if (!session || typeof session !== 'object') return;
    S.secureCollectionSession?.(session);
    session.source = 'ready';
    session.spokenOpening = false;
    session.story = null;
    session.openingNotes = { protagonist: '', setting: '', action: '', problem: '' };
    originalSave(session);
  };

  const originalEncodeGameInvite = S.encodeGameInvite;
  S.encodeGameInvite = async session => {
    S.secureCollectionSession?.(session);
    if (!validReadySession(session)) throw new Error('Seleziona una storia disponibile prima di creare l’invito');
    return originalEncodeGameInvite(session);
  };

  const originalDecodeGameInvite = S.decodeGameInvite;
  S.decodeGameInvite = async code => {
    const safeCode = String(code || '');
    if (!safeCode.startsWith('r2.')) return null;
    const session = await originalDecodeGameInvite(safeCode);
    if (!session || session.source !== 'ready') return null;
    session.collectionId = availableCollectionId;
    session.stage = 'game';
    session.story = null;
    S.secureCollectionSession?.(session);
    return validReadySession(session) ? session : null;
  };

  const originalEncodeInvite = S.encodeInvite;
  S.encodeInvite = async (session, index, objective) => {
    S.secureCollectionSession?.(session);
    if (!validReadySession(session)) throw new Error('Storia non disponibile');
    return originalEncodeInvite(session, index, objective);
  };

  const originalDecodeInvite = S.decodeInvite;
  S.decodeInvite = async code => {
    const session = await originalDecodeInvite(code);
    if (!session || session.source !== 'ready') return null;
    session.collectionId = availableCollectionId;
    session.story = null;
    S.secureCollectionSession?.(session);
    return validReadySession(session) ? session : null;
  };

  Object.freeze(window.STORIA52_FEATURES);
})();
