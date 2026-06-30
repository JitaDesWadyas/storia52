'use strict';
(() => {
  const G = window.G52;
  const BANKS = window.STORIA52_COHERENT_BANKS;
  if (!G?.flow || !Array.isArray(BANKS) || BANKS.length < 20) return;

  const STEPS = [
    { key:'identity', story:'protagonist', type:'protagonist', label:'PROTAGONISTA', question:'Chi è, in questa storia?', hint:'Scegli una persona concreta. Questa prima risposta fissa anche l’ambiente narrativo delle domande successive.' },
    { key:'place', story:'situation', type:'situation', label:'SITUAZIONE', question:'Che cosa sta succedendo proprio ora?', hint:'Il fatto iniziale appartiene allo stesso scenario del protagonista scelto.' },
    { key:'opening', story:'goal', type:'objective', label:'OBIETTIVO', question:'Che cosa deve riuscire a fare?', hint:'Un obiettivo immediato e raccontabile, collegato alla situazione.' },
    { key:'stakes', story:'problem', type:'problem', label:'PROBLEMA', question:'Che cosa rende tutto difficile?', hint:'Un ostacolo concreto che rende impossibile ottenere tutto senza conseguenze.' }
  ];

  const PATTERNS = {
    aiuto:/aiut|sostegn|collabor|dipende|insieme/i, rapporto:/rapport|fiducia|persona importante|amica|amico|collega/i,
    famiglia:/famiglia|familiare|fratell|sorell|madre|padre|figli?/i, protezione:/protegg|salvare|sicurezza|pericolo|impedire/i,
    indizio:/indizio|dettaglio|chiave|messaggio|fotografia|traccia/i, prova:/prova|document|registro|campione|registrazione|ricevuta|referto/i,
    documento:/document|biglietto|passaporto|cartella|registro/i, informazione:/informazione|messaggio|comunicat|notizia/i,
    comunicazione:/comunica|lingua|telefono|messaggio|farsi capire/i, verità:/verità|causa|spiegare|ricostruire|convinzione/i,
    segreto:/segreto|nascost|silenzio|non deve sapere|non vuole parlare/i, identità:/identità|nome falso|stesso nome|chi è davvero/i,
    impresa:/impresa|completare|portare a termine|progetto|lavoro importante|grande lavoro/i, successo:/successo|vittoria|finale|occasione|finanziamento/i,
    perdita:/perd|dannegg|scompar|inutilizz|chiusura|fallimento|indenn/i, sacrificio:/sacrific|rinunci|prezzo|costo|nessuno può uscirne/i,
    scelta:/scegli|decid|incompatibil|nessuno può|una sola possibilità|conflitto deve terminare/i, errore:/errore|sbagli|modificat|scambiat|falsificat/i,
    tempo:/prima che|troppo tardi|pochi minuti|ultimo|immediata|sta per/i, responsabilità:/responsabil|incaricat|firm|colpa/i,
    comunità:/comunità|quartiere|paese|abitanti/i, gruppo:/gruppo|squadra|compagnia|equipaggio|troupe/i,
    azione:/azione|agire|tentativo|affrontare|compiere/i, scoperta:/scoperta|scoprire|ritrovamento/i,
    luogo:/stazione|aeroporto|museo|ospedale|laboratorio|edificio|luogo sconosciuto/i
  };

  const esc = value => typeof escapeHtml === 'function' ? escapeHtml(String(value)) :
    String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hash = value => { let h=2166136261; for(let i=0;i<value.length;i+=1){h^=value.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; };
  const story = session => withStoryGoal(session.story, session.seed);
  const cardTextFor = (session, step) => cardText(step.type, story(session)[step.story]);
  const signature = session => STEPS.map(step => `${step.key}:${cardLabel(story(session)[step.story])}:${cardTextFor(session,step)}`).join('|');
  const cardsText = session => STEPS.map(step => cardTextFor(session,step)).join(' ');

  const rankedBanks = session => {
    const text=cardsText(session), sig=signature(session);
    const tags=Object.entries(PATTERNS).filter(([,pattern])=>pattern.test(text)).map(([tag])=>tag);
    return BANKS.map(bank=>{
      let score=0;
      tags.forEach(tag=>{if(bank.tags.includes(tag))score+=10;});
      bank.tags.forEach(tag=>{if(PATTERNS[tag]?.test(text))score+=4;});
      if(bank.tags.includes('impresa')&&/completare una grande impresa|portare a termine un piano/i.test(text))score+=20;
      if(bank.tags.includes('errore')&&/errore/i.test(text))score+=15;
      if(bank.tags.includes('perdita')&&/perdita definitiva|perso|danneggiato|inutilizzabile/i.test(text))score+=15;
      if(bank.tags.includes('scelta')&&/nessuno può uscirne|conflitto deve terminare|sacrificio/i.test(text))score+=12;
      score+=(hash(`${sig}:${bank.id}`)%1000)/10000;
      return {bank,score};
    }).sort((a,b)=>b.score-a.score);
  };

  const blank = name => ({identity:'',name:name||'',place:'',opening:'',stakes:'',finalOpening:''});
  const migrate = session => {
    if(!session)return session;
    session.context ||= blank('');
    if(session.openingBuilderVersion!==4){
      const name=session.context.name||'';
      session.context=blank(name); session.openingV4Signature=''; session.openingV4Cluster='';
      session.openingV4IdentitySeen=[]; session.openingV4Seen={}; session.openingV4Current={};
      ['openingV3Signature','openingV3Seen','openingV3Current','openingV3Selected','openingV3Manual','openingWorld','ideaHistory'].forEach(key=>delete session[key]);
      session.openingBuilderVersion=4; session.contextStep=0; G.save(session);
    }
    return session;
  };
  const reset = session => {
    const sig=signature(session); if(session.openingV4Signature===sig)return;
    const name=session.context?.name||'';
    session.openingV4Signature=sig; session.openingV4Cluster=''; session.openingV4IdentitySeen=[];
    session.openingV4Seen={}; session.openingV4Current={}; session.context=blank(name);
    session.contextStep=0; session.openingBuilderVersion=4; G.save(session);
  };
  const bankById = id => BANKS.find(bank=>bank.id===id);
  const pick3 = items => {
    const pool=[...items],out=[];
    while(pool.length&&out.length<3){const i=G.randomIndex?G.randomIndex(pool.length):Math.floor(Math.random()*pool.length);out.push(pool.splice(i,1)[0]);}
    return out;
  };

  const identityBatch = session => {
    reset(session); session.openingV4Current||={};
    let seen=new Set(session.openingV4IdentitySeen||[]);
    const ranking=rankedBanks(session), sig=signature(session);
    const candidates = ignored => {
      const out=[];
      ranking.forEach((item,rank)=>item.bank.identity.forEach((text,index)=>{
        const token=`${item.bank.id}:${index}`;
        if(!ignored.has(token))out.push({text,cluster:item.bank.id,token,score:item.score-rank*.08+(hash(`${sig}:${token}`)%1000)/100000});
      }));
      return out.sort((a,b)=>b.score-a.score);
    };
    let available=candidates(seen);
    if(available.length<3){seen=new Set();available=candidates(seen);}
    const batch=[],clusters=new Set();
    for(const item of available){if(batch.length===3)break;if(clusters.has(item.cluster))continue;batch.push(item);clusters.add(item.cluster);}
    if(batch.length<3)for(const item of available){if(batch.length===3)break;if(!batch.some(x=>x.token===item.token))batch.push(item);}
    session.openingV4IdentitySeen=[...seen,...batch.map(x=>x.token)]; session.openingV4Current.identity=batch; G.save(session); return batch;
  };

  const clusterBatch = (session,key) => {
    session.openingV4Current||={}; session.openingV4Seen||={};
    let bank=bankById(session.openingV4Cluster);
    if(!bank){bank=rankedBanks(session)[0]?.bank;session.openingV4Cluster=bank?.id||'';}
    if(!bank)return[];
    let seen=new Set(session.openingV4Seen[key]||[]), available=bank[key].filter(text=>!seen.has(text));
    if(available.length<3){seen=new Set();available=[...bank[key]];}
    const batch=pick3(available).map(text=>({text,cluster:bank.id,token:text}));
    session.openingV4Seen[key]=[...seen,...batch.map(x=>x.text)];session.openingV4Current[key]=batch;G.save(session);return batch;
  };

  const currentBatch = (session,key) => {
    session.openingV4Current||={}; const current=session.openingV4Current[key];
    return Array.isArray(current)&&current.length===3?current:(key==='identity'?identityBatch(session):clusterBatch(session,key));
  };
  const sentence = value => {const clean=String(value||'').trim().replace(/[.!?]+$/,'');return clean?`${clean.charAt(0).toUpperCase()}${clean.slice(1)}.`:'';};
  const preview = session => STEPS.map(step=>sentence(session.context?.[step.key])).filter(Boolean).join(' ')||
    'Scegli il protagonista: da quel momento tutte le idee apparterranno alla stessa storia.';

  window.STORIA52_OPENING_V4={G,BANKS,STEPS,esc,story,cardTextFor,signature,rankedBanks,blank,migrate,reset,bankById,identityBatch,clusterBatch,currentBatch,preview};
})();
