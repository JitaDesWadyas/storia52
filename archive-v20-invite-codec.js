'use strict';
(() => {
  const S = window.S52;
  if (!S) return;

  const baseEncodeGameInvite = S.encodeGameInvite;
  const baseDecodeGameInvite = S.decodeGameInvite;
  const baseEncodeInvite = S.encodeInvite;
  const baseDecodeInvite = S.decodeInvite;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const toBase64Url = value => {
    const bytes = encoder.encode(String(value || ''));
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
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
  const namesFor = (names, count) => Array.from({ length: count }, (_, index) => S.cleanName(names?.[index], index));
  const compactNames = (names, count) => namesFor(names, count).map((name, index) => name === `Giocatore ${index + 1}` ? '' : name);

  S.encodeGameInvite = async session => {
    if (session.source !== 'ready') return baseEncodeGameInvite(session);
    const story = storyById(session.readyStoryId);
    if (!story) throw new Error('Storia non disponibile');
    const count = validCount(session.count);
    const names = compactNames(session.names, count);
    const namesCode = names.some(Boolean) ? `.${toBase64Url(JSON.stringify(names))}` : '';
    return `r3.${story.id}.${count.toString(36)}${namesCode}`;
  };

  S.decodeGameInvite = async code => {
    const safeCode = String(code || '');
    if (safeCode.startsWith('r2.')) return null;
    if (!safeCode.startsWith('r3.')) return baseDecodeGameInvite(code);
    const parts = safeCode.split('.');
    const story = storyById(parts[1]);
    const count = validCount(parseInt(parts[2], 36));
    if (!story || !parts[2]) return null;
    let names = [];
    if (parts[3]) {
      try { names = JSON.parse(fromBase64Url(parts.slice(3).join('.'))); }
      catch { return null; }
    }
    return {
      version: 5,
      mode: 'autonomous',
      delivery: 'multi',
      source: 'ready',
      count,
      names: namesFor(Array.isArray(names) ? names : [], count),
      objectives: S.objectivesForReadyStory?.(story, count, 'INVITO-COMUNE') || [],
      confirmed: Array(count).fill(false),
      openingText: '',
      spokenOpening: false,
      readyStoryId: story.id,
      story: null,
      seed: 'INVITO-COMUNE'
    };
  };

  S.encodeInvite = async (session, index, objective) => {
    if (session.source !== 'ready' || !objective?.custom || !Number.isInteger(objective.slot)) {
      return baseEncodeInvite(session, index, objective);
    }
    const story = storyById(session.readyStoryId);
    if (!story) throw new Error('Storia non disponibile');
    return `p3.${story.id}.${objective.slot.toString(36)}.${toBase64Url(S.playerName(session, index))}`;
  };

  S.decodeInvite = async code => {
    const safeCode = String(code || '');
    if (safeCode.startsWith('r.')) return null;
    if (!safeCode.startsWith('p3.')) return baseDecodeInvite(code);
    const [, storyId, slotCode, nameCode] = safeCode.split('.');
    const story = storyById(storyId);
    const slot = parseInt(slotCode, 36);
    const objective = S.objectiveForReadyStorySlot?.(story, slot);
    if (!story || !objective) return null;
    let name = 'Giocatore';
    try { name = S.cleanText(fromBase64Url(nameCode), S.limits.name) || name; }
    catch { return null; }
    return {
      version: 5,
      mode: 'autonomous',
      delivery: 'multi',
      source: 'ready',
      count: 1,
      names: [name],
      objectives: [objective],
      confirmed: [false],
      openingText: '',
      spokenOpening: false,
      readyStoryId: story.id,
      story: null,
      seed: 'INVITO'
    };
  };
})();
