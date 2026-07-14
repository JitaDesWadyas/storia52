'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  const bytesToBase64Url = bytes => {
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };

  const base64UrlToBytes = value => {
    const normalized = String(value || '');
    const padded = normalized.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  };

  const compress = async text => {
    const raw = textEncoder.encode(text);
    if (!('CompressionStream' in window)) return `j${bytesToBase64Url(raw)}`;
    try {
      const stream = new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'));
      const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
      return compressed.length < raw.length ? `z${bytesToBase64Url(compressed)}` : `j${bytesToBase64Url(raw)}`;
    } catch {
      return `j${bytesToBase64Url(raw)}`;
    }
  };

  const decompress = async code => {
    const mode = code[0];
    const bytes = base64UrlToBytes(code.slice(1));
    if (mode === 'j') return textDecoder.decode(bytes);
    if (mode !== 'z' || !('DecompressionStream' in window)) throw new Error('Formato invito non supportato');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
    return textDecoder.decode(await new Response(stream).arrayBuffer());
  };

  const encodeName = name => bytesToBase64Url(textEncoder.encode(String(name || 'Giocatore')));
  const decodeName = value => textDecoder.decode(base64UrlToBytes(value));

  S.encodeInvite = async (session, index, objective) => {
    const name = S.playerName(session, index);
    if (session.source === 'ready' && objective?.custom && Number.isInteger(objective.slot)) {
      const storyIndex = S.stories.findIndex(story => story.id === session.readyStoryId);
      if (storyIndex >= 0) return `r.${storyIndex.toString(36)}.${objective.slot.toString(36)}.${encodeName(name)}`;
    }

    const payload = {
      v: 1,
      n: name,
      s: session.source,
      r: session.source === 'ready' ? session.readyStoryId : '',
      c: session.source === 'cards' ? serializeStory(session.story) : '',
      x: session.openingText || '',
      p: Boolean(session.spokenOpening),
      o: objective?.custom ? { t: objective.title || 'Obiettivo', x: objective.text || '', f: objective.finale || '' } : serializeCard(objective)
    };
    return compress(JSON.stringify(payload));
  };

  S.decodeInvite = async code => {
    if (!code) return null;
    if (code.startsWith('r.')) {
      const [, storyCode, slotCode, encodedName] = code.split('.');
      const story = S.stories[parseInt(storyCode, 36)];
      const slot = parseInt(slotCode, 36);
      if (!story || !Number.isInteger(slot)) return null;
      const objective = S.objectivesForReadyStory?.(story, slot + 1)?.[slot];
      if (!objective) return null;
      return {
        version: 3,
        mode: 'autonomous',
        delivery: 'multi',
        source: 'ready',
        count: 1,
        names: [decodeName(encodedName)],
        objectives: [objective],
        confirmed: [false],
        openingText: '',
        spokenOpening: false,
        readyStoryId: story.id,
        story: null,
        seed: 'INVITO'
      };
    }

    const payload = JSON.parse(await decompress(code));
    const objective = typeof payload.o === 'string'
      ? parseCard(payload.o)
      : payload.o && { custom: true, title: payload.o.t || 'Obiettivo', text: payload.o.x || '', finale: payload.o.f || '' };
    if (!objective) return null;
    const session = {
      version: 3,
      mode: 'autonomous',
      delivery: 'multi',
      source: payload.s,
      count: 1,
      names: [payload.n || 'Giocatore'],
      objectives: [objective],
      confirmed: [false],
      openingText: payload.x || '',
      spokenOpening: Boolean(payload.p),
      readyStoryId: payload.s === 'ready' ? payload.r || '' : '',
      story: payload.s === 'cards' ? parseStory(payload.c) : null,
      seed: 'INVITO'
    };
    return payload.s === 'cards' && !session.story ? null : session;
  };
})();
