'use strict';

(() => {
  const objectives = window.STORIA52_READY_OBJECTIVES || {};
  const allowedStoryIds = new Set(['real01', 'mys02', 'sci01', 'fan02', 'hor02', 'lov01', 'adv01', 'com03']);
  const patches = {
    real01: {
      'Proteggere Marta': 'Samir firma una dichiarazione in cui si assume l’ultima serie di controlli, ma infila nel fascicolo dell’ispettore la chiavetta del tecnico licenziato. Quando viene accompagnato fuori, Marta resta al banco con il badge di Samir in mano e capisce che ora tocca a lei finire ciò che lui ha iniziato.',
      'Accettare il sistema': 'L’ispezione passa e Samir riceve il contratto stabile. La sera, mentre la pioggia batte sui vetri, sul monitor compare il primo sensore rosso con accanto la sua firma: nessuno nel reparto trova il coraggio di guardarlo.'
    },
    mys02: {
      'La galleria di Valmora': 'Le registrazioni guidano gli otto a una galleria murata sotto Vetra. Ognuno riconosce un dettaglio diverso del proprio ricordo; Lea posa la mano su una parete e dall’altra parte una voce bambina conta fino a undici.',
      'Lasciare tutto sepolto': 'Gli otto bruciano il nastro nel piazzale prima che arrivino le ruspe. Quando il deposito crolla, Enzo riceve sul vecchio telefono una chiamata di undici secondi: nessuno parla, ma in sottofondo si sente il motore dello scuolabus.'
    },
    sci01: {
      'Azzeramento completo': 'Enea avvia il reset mentre il suo doppio resta davanti alla telecamera simulata. Negli ultimi tre secondi la copia non lo supplica: gli racconta un ricordo d’infanzia che Enea non aveva mai confidato a nessuno. Poi Valma Copia Zero diventa una schermata vuota.',
      'Nasconderla fuori rete': 'Enea falsifica il registro e trasferisce il nucleo su una rete dimenticata sotto Vetra. Mesi dopo, ogni notte alle 02:17, un lampione spento davanti a casa sua si accende per pochi secondi: è l’unico modo che Copia Zero ha per dirgli che esiste ancora.'
    },
    fan02: {
      'Salvare soltanto suo fratello': 'Nalia strappa il nome del fratello dal contratto e lo pronuncia davanti alla madre. Lei lo riconosce, ma non ricorda più gli anni in cui lo aveva dimenticato; lui torna a casa portando addosso il dolore di entrambi.',
      'Un nome nuovo per i dimenticati': 'I dimenticati incidono il proprio nuovo nome sulla porta esterna di Valmora. Il mattino seguente la città non ricorda chi fossero, ma ricorda perfettamente che quella porta appartiene a loro.'
    },
    hor02: {
      'Un finale nuovo': 'La protagonista cambia l’ultima battuta e invita le figure a salire sul palco invece di restare in platea. Una dopo l’altra recitano il finale che non avevano mai avuto; l’ultima figura, identica alla nonna, le lascia il proprio anello prima di svanire.',
      'Lasciare il teatro a loro': 'La compagnia fugge e il Lanterna viene murato. Ogni anno, nella data della tragedia, otto biglietti appena stampati compaiono sotto la porta; sul retro c’è il nome degli attori che avevano scelto di andarsene.'
    },
    lov01: {
      'Vendere e lasciarsi andare': 'Nora e Karim firmano e dividono ogni cosa, compreso il vecchio quaderno. Quando arrivano all’ultima pagina scoprono una promessa scritta anni prima: «Se finisce Casa Orla, non dobbiamo finire male anche noi». La strappano a metà e si salutano sorridendo.',
      'Il luogo, non la coppia': 'Casa Orla riapre e loro lavorano insieme senza fingere di essere tornati indietro. Alla prima serata, Karim presenta Nora come «la persona con cui ho costruito questo posto»; lei risponde «e con cui ho finalmente imparato a lasciarlo libero».'
    },
    adv01: {
      'Continuare oltre il limite': 'Il gruppo supera la porta e l’ingresso crolla alle sue spalle. Nel centro delle strutture trovano il lavoratore scomparso seduto a una tavola apparecchiata da secoli; alza lo sguardo e chiede perché siano arrivati con undici minuti di ritardo.',
      'L’uscita sotto Valma': 'Le gallerie li conducono sotto una lavanderia di via Orla 18. Quando sollevano la botola, una residente anziana li guarda senza stupore e dice che la sua famiglia aspettava quel ritorno dal 1998.'
    },
    com03: {
      'La grande bugia culturale': 'Comune e guide inventano una teoria sempre più assurda sulla statua capovolta. L’artista arriva, ascolta tutto e dichiara che il vero capolavoro non è la statua, ma la città intera mentre mente con perfetta serietà.',
      'Venderla per qualcosa di utile': 'La statua viene venduta per una cifra enorme e il denaro finanzia il progetto scelto dagli abitanti. Nella piazza resta soltanto il basamento montato al contrario; in pochi mesi diventa più fotografato dell’opera originale.'
    }
  };

  for (const storyId of Object.keys(objectives)) {
    if (!allowedStoryIds.has(storyId)) delete objectives[storyId];
  }

  let changed = 0;
  for (const [storyId, storyPatches] of Object.entries(patches)) {
    const storyObjectives = objectives[storyId] || [];
    for (const objective of storyObjectives) {
      const finale = storyPatches[objective.title];
      if (!finale) continue;
      objective.finale = finale;
      changed += 1;
    }
  }

  window.STORIA52_PRIMA_SCINTILLA_REWRITTEN_OUTCOMES = changed;
  if (changed !== 16) console.error(`La Prima Scintilla: attesi 16 finali riscritti, trovati ${changed}.`);
})();
