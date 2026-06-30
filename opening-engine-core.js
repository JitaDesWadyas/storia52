'use strict';
(() => {
  const G = window.G52;
  if (!G) return;
  const E = window.OPENING_ENGINE = {};
  E.keys = ['identity','place','opening','stakes'];
  E.types = {identity:['protagonist','protagonist'],place:['situation','situation'],opening:['goal','objective'],stakes:['problem','problem']};
  E.pick = list => list[(G.randomIndex ? G.randomIndex(list.length) : Math.floor(Math.random()*list.length))];
  E.cap = value => value ? value.charAt(0).toUpperCase()+value.slice(1) : '';
  E.strip = value => String(value||'').trim().replace(/[.!?]+$/,'');
  E.escape = value => typeof escapeHtml === 'function' ? escapeHtml(String(value)) : String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  E.cardText = (session,key) => {
    const [storyKey,type] = E.types[key];
    try { return cardText(type,session.story[storyKey]); } catch { return ''; }
  };
  const contains = (text,words) => words.some(word => String(text||'').toLowerCase().includes(word));
  E.theme = (key,text) => {
    if (key==='identity') {
      if (contains(text,['protegg'])) return 'protect';
      if (contains(text,['famiglia','rapporto','fidarsi','accettat'])) return 'relation';
      if (contains(text,['indizio','verità','informazione','scopr'])) return 'truth';
      if (contains(text,['agire','piano','impresa','ostacolo'])) return 'action';
      if (contains(text,['perdita','occasione','errore','sacrificat'])) return 'loss';
    }
    if (key==='place') {
      if (contains(text,['indizio','prova','dettaglio'])) return 'clue';
      if (contains(text,['verità','avvertimento','informazioni','segreti'])) return 'truth';
      if (contains(text,['persona','gruppo','famiglia','relazione','conflitto'])) return 'relation';
      if (contains(text,['piano','azione','tentativo','occasione'])) return 'action';
      if (contains(text,['perso','danneggiato','scomparire','sacrificio'])) return 'loss';
    }
    if (key==='opening') {
      if (contains(text,['salvare','proteggere','tenere unita'])) return 'protect';
      if (contains(text,['scoprire','capire','verità','indizio','prova'])) return 'truth';
      if (contains(text,['fiducia','rapporto','accettato','riunire'])) return 'relation';
      if (contains(text,['sacrificio','prezzo','rinunciare'])) return 'sacrifice';
      if (contains(text,['impedire','evitando','limitando'])) return 'prevent';
      return 'action';
    }
    if (contains(text,['occasione','tempo','troppo tardi'])) return 'time';
    if (contains(text,['persona','rapporto','fiducia','comunicare'])) return 'person';
    if (contains(text,['verità','prova','indizio','informazioni'])) return 'evidence';
    if (contains(text,['sacrificio','prezzo','rinuncia'])) return 'sacrifice';
    if (contains(text,['perdita','distrutta','danno','indispensabile'])) return 'loss';
    return 'fallback';
  };
})();
