'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  const bytesToBase64Url = bytes => {
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };

  const base64UrlToBytes = value => {
    const normalized = String(value || '');
    if (!/^[A-Za-z0-9_-]*$/.test(normalized)) throw new Error('Codice invito non valido');
    const padded = normalized.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  };

  const compress = async text => {
    const safeText = String(text || '');
    if (safeText.length > S.limits.inviteDecoded) throw new Error('La partita contiene troppo testo');
    const raw = textEncoder.encode(safeText);
    if (!('CompressionStream' in window)) return `j${bytesToBase64Url(raw)}`;
    try {
      const stream = new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'));
      const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
      return compressed.length < raw.length ? `z${bytesToBase64Url(compressed)}` : `j${bytesToBase64Url(raw)}`;
    } catch { return `j${bytesToBase64Url(raw)}`; }
  };

  const decompress = async code => {
    const safeCode = String(code || '');
    if (!safeCode || safeCode.length > S.limits.inviteCode) throw new Error('Invito troppo lungo o non valido');
    const mode = safeCode[0];
    const bytes = base64UrlToBytes(safeCode.slice(1));
    let text;
    if (mode === 'j') text = textDecoder.decode(bytes);
    else {
      if (mode !== 'z' || !('DecompressionStream' in window)) throw new Error('Formato invito non supportato');
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
      text = textDecoder.decode(await new Response(stream).arrayBuffer());
    }
    if (text.length > S.limits.inviteDecoded) throw new Error('Invito non valido');
    return text;
  };

  const encodeName = name => bytesToBase64Url(textEncoder.encode(S.cleanText(name, S.limits.name)));
  const decodeName = value => S.cleanText(textDecoder.decode(base64UrlToBytes(value || '')), S.limits.name);
  const validCount = value => Math.max(2, Math.min(10, Number(value) || 2));
  const compactNames = (names, count) => Array.from({ length: count }, (_, index) => {
    const normalized = S.cleanName(names?.[index], index);
    return normalized === `Giocatore ${index + 1}` ? '' : normalized;
  });
  const restoreNames = (names, count) => Array.from({ length: count }, (_, index) => S.cleanName(names?.[index], index));

  const serializeObjective = objective => objective?.custom
    ? { t: S.cleanText(objective.title || 'Obiettivo', 80), x: S.cleanText(objective.text || '', 500, true), f: S.cleanText(objective.finale || '', 500, true) }
    : serializeCard(objective);
  const parseObjective = value => {
    if (typeof value === 'string') return parseCard(value);
    if (!value || typeof value !== 'object') return null;
    const text = S.cleanText(value.x, 500, true);
    const finale = S.cleanText(value.f, 500, true);
    if (!text || !finale) return null;
    return { custom: true, title: S.cleanText(value.t || 'Obiettivo', 80), text, finale };
  };

  S.encodeGameInvite = async session => {
    const count = validCount(session.count);
    const names = compactNames(session.names, count);
    let code;
    if (session.source === 'ready') {
      const storyIndex = S.stories.findIndex(story => story.id === session.readyStoryId);
      if (storyIndex < 0) throw new Error('Storia non disponibile');
      const namesCode = names.some(Boolean) ? await compress(JSON.stringify(names)) : '';
      code = `r2.${storyIndex.toString(36)}.${count.toString(36)}${namesCode ? `.${namesCode}` : ''}`;
    } else {
      const objectives = Array.from({ length: count }, (_, index) => serializeObjective(session.objectives?.[index]));
      if (objectives.some(objective => !objective)) throw new Error('Obiettivi non validi');
      const payload = {
        v: 2,
        n: names,
        c: serializeStory(session.story),
        x: S.cleanText(session.openingText || '', S.limits.opening, true),
        p: Boolean(session.spokenOpening),
        o: objectives
      };
      code = `c2.${await compress(JSON.stringify(payload))}`;
    }
    if (code.length > S.limits.inviteQr) throw new Error('L’invito è ancora troppo lungo: accorciate l’incipit');
    return code;
  };

  S.decodeGameInvite = async code => {
    const safeCode = String(code || '');
    if (!safeCode || safeCode.length > S.limits.inviteCode) return null;
    if (safeCode.startsWith('r2.')) {
      const parts = safeCode.split('.');
      const story = S.stories[parseInt(parts[1], 36)];
      const count = validCount(parseInt(parts[2], 36));
      if (!story || !parts[2]) return null;
      let names = [];
      if (parts.length > 3) {
        try { names = JSON.parse(await decompress(parts.slice(3).join('.'))); }
        catch { return null; }
      }
      return {
        version: 4, mode: 'autonomous', delivery: 'multi', source: 'ready', count,
        names: restoreNames(Array.isArray(names) ? names : [], count),
        objectives: S.objectivesForReadyStory?.(story, count) || [], confirmed: Array(count).fill(false),
        openingText: '', spokenOpening: false, readyStoryId: story.id, story: null, seed: 'INVITO-COMUNE'
      };
    }
    if (!safeCode.startsWith('c2.')) return null;
    let payload;
    try { payload = JSON.parse(await decompress(safeCode.slice(3))); }
    catch { return null; }
    if (!payload || payload.v !== 2 || !Array.isArray(payload.n) || !Array.isArray(payload.o)) return null;
    const count = validCount(payload.o.length);
    if (payload.o.length !== count) return null;
    const story = parseStory(payload.c);
    const objectives = payload.o.map(parseObjective);
    if (!story || objectives.some(objective => !objective)) return null;
    return {
      version: 4, mode: 'autonomous', delivery: 'multi', source: 'cards', count,
      names: restoreNames(payload.n, count), objectives, confirmed: Array(count).fill(false),
      openingText: S.cleanText(payload.x || '', S.limits.opening, true), spokenOpening: Boolean(payload.p),
      readyStoryId: '', story, seed: 'INVITO-COMUNE'
    };
  };

  // Compatibilità con gli inviti personali già condivisi.
  S.encodeInvite = async (session, index, objective) => {
    const name = S.playerName(session, index);
    if (session.source === 'ready' && objective?.custom && Number.isInteger(objective.slot)) {
      const storyIndex = S.stories.findIndex(story => story.id === session.readyStoryId);
      if (storyIndex >= 0) return `r.${storyIndex.toString(36)}.${objective.slot.toString(36)}.${encodeName(name)}`;
    }
    const payload = {
      v: 1, n: name, s: session.source,
      r: session.source === 'ready' ? session.readyStoryId : '',
      c: session.source === 'cards' ? serializeStory(session.story) : '',
      x: S.cleanText(session.openingText || '', S.limits.opening, true), p: Boolean(session.spokenOpening),
      o: serializeObjective(objective)
    };
    return compress(JSON.stringify(payload));
  };

  S.decodeInvite = async code => {
    if (!code || String(code).length > S.limits.inviteCode) return null;
    if (code.startsWith('r.')) {
      const [, storyCode, slotCode, encodedName] = code.split('.');
      const story = S.stories[parseInt(storyCode, 36)];
      const slot = parseInt(slotCode, 36);
      if (!story || !Number.isInteger(slot)) return null;
      const objective = S.objectivesForReadyStory?.(story, slot + 1)?.[slot];
      if (!objective) return null;
      return {
        version: 3, mode: 'autonomous', delivery: 'multi', source: 'ready', count: 1,
        names: [decodeName(encodedName) || 'Giocatore'], objectives: [objective], confirmed: [false],
        openingText: '', spokenOpening: false, readyStoryId: story.id, story: null, seed: 'INVITO'
      };
    }
    let payload;
    try { payload = JSON.parse(await decompress(code)); }
    catch { return null; }
    const objective = parseObjective(payload.o);
    if (!objective) return null;
    const session = {
      version: 3, mode: 'autonomous', delivery: 'multi', source: payload.s, count: 1,
      names: [S.cleanText(payload.n || 'Giocatore', S.limits.name) || 'Giocatore'], objectives: [objective], confirmed: [false],
      openingText: S.cleanText(payload.x || '', S.limits.opening, true), spokenOpening: Boolean(payload.p),
      readyStoryId: payload.s === 'ready' ? payload.r || '' : '',
      story: payload.s === 'cards' ? parseStory(payload.c) : null, seed: 'INVITO'
    };
    return payload.s === 'cards' && !session.story ? null : session;
  };
})();
