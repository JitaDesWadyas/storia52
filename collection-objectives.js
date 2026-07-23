'use strict';

(() => {
  const objectives = window.STORIA52_READY_OBJECTIVES || {};
  const allowedStoryIds = new Set(['real01', 'mys02', 'sci01', 'fan02', 'hor02', 'lov01', 'adv01', 'com03']);
  const patches = {
    real01: {
      'Rapporti resi pubblici': {
        text: 'Fai usare a Samir i dati originali e l’ispezione per dimostrare che i controlli dei sensori sono stati falsificati e rendere pubblica la responsabilità di Meridiana.',
        finale: 'Samir consegna all’ispettore chiavetta, rapporti e orari reali. La linea viene fermata e i documenti arrivano anche ai lavoratori: Meridiana deve spiegare pubblicamente chi ordinò di firmare controlli mai eseguiti.'
      },
      'Riparare tutto in tempo': {
        text: 'Fai organizzare il reparto per mettere in sicurezza i sensori essenziali prima dell’ispezione, senza firmare falsi e senza fermare l’intera consegna.',
        finale: 'Samir, Marta e gli interinali dividono le zone più rischiose e riparano i sensori indispensabili. L’ispettore trova ritardi e procedure sbagliate, ma anche una consegna ridotta che può partire senza mettere nessuno in pericolo.'
      },
      'Proteggere Marta': {
        text: 'Fai assumere a Samir la responsabilità della chiavetta e dei documenti per impedire che Marta venga licenziata o usata come capro espiatorio.',
        finale: 'Samir dichiara di avere ricevuto e custodito lui i dati originali. Mentre viene accompagnato fuori, Marta invia l’ultima copia all’ispettore e resta nel reparto abbastanza a lungo da testimoniare ciò che è successo.'
      },
      'Accettare il sistema': {
        text: 'Fai firmare a Samir i controlli e portalo a ottenere il posto stabile, mantenendo nascosto il problema per non bloccare stipendi e consegna.',
        finale: 'L’ispezione passa e Samir riceve il contratto stabile. A fine turno, sul monitor compare il primo sensore rosso con accanto la sua firma; il reparto continua a lavorare, ma nessuno riesce più a fingere che quella scelta sia senza costo.'
      },
      'Il lavoro del tecnico licenziato': {
        title: 'Riabilitare il tecnico licenziato',
        text: 'Fai rintracciare il tecnico, dimostrare che la sua segnalazione era corretta e ottenere che il suo lavoro venga riconosciuto o che possa tornare nel reparto.',
        finale: 'Il tecnico entra durante l’ispezione con la propria mappa dei guasti e dimostra che gli avvisi ignorati coincidevano con i sensori difettosi. Meridiana deve ritirare il licenziamento o affrontare l’indagine con lui come testimone.'
      },
      'Il reparto si rifiuta': {
        title: 'Il reparto si ferma',
        text: 'Fai unire i lavoratori contro le firme false e porta il reparto a fermare la linea, accettando il rischio immediato per consegna e paga.',
        finale: 'Marta, Samir e gli altri posano i moduli vuoti sul banco e spengono la linea. La consegna salta, ma la direzione non può sostituire un intero turno prima dell’arrivo dell’ispettore ed è costretta ad aprire una trattativa.'
      },
      'Andarsene con le prove': {
        title: 'Salvare la consegna',
        text: 'Fai trovare a Samir una soluzione temporanea ma realmente sicura che mantenga attiva parte della linea e protegga gli stipendi, rinviando lo scontro pubblico con Meridiana.',
        finale: 'Il reparto isola i sensori difettosi, riduce la produzione e completa soltanto la parte verificabile della consegna. Samir non firma il falso e nessuno perde la settimana di paga, ma la chiavetta resta nascosta per una battaglia successiva.'
      },
      'La pressione viene dall’alto': {
        text: 'Fai dimostrare che anche il responsabile sta coprendo obiettivi impossibili imposti dalla direzione e ottieni una riforma senza trasformarlo nell’unico colpevole.',
        finale: 'Le comunicazioni interne mostrano minacce, tagli e scadenze decisi ai livelli superiori. Il responsabile ammette le firme false insieme al reparto; Meridiana accetta controlli esterni e nuove scadenze invece di sacrificare una sola persona.'
      }
    },
    mys02: {
      'Enzo li ha salvati': {
        text: 'Fai dimostrare che Enzo deviò il percorso per sottrarre i bambini a un pericolo reale e che non conosceva né esperimenti né gallerie anomale.',
        finale: 'La cassetta firmata da Enzo e una vecchia mappa stradale provano che evitò un crollo segnalato pochi minuti prima. Il deposito fu soltanto il rifugio più vicino; il rapporto ufficiale trasformò il suo salvataggio in una colpa.'
      },
      'Un test coperto da Meridiana': {
        title: 'Un esperimento industriale',
        text: 'Fai provare che il bus venne coinvolto senza il consenso di Enzo in un test industriale che oscurò telecamere e ricordi, escludendo una causa soprannaturale.',
        finale: 'Il modulo sotto il cruscotto e i registri del San Lume ricostruiscono un test di interferenza condotto dall’azienda che precedette Meridiana. Enzo cercò soltanto un’uscita, mentre gli undici minuti vennero cancellati dai sistemi e poi dalle testimonianze.'
      },
      'Lea ha mandato le chiavi': {
        title: 'Lea vuole confessare',
        text: 'Fai emergere che Lea ha recuperato bus e chiavi perché ricorda una verità personale che non ha mai avuto il coraggio di raccontare agli altri.',
        finale: 'Lea ammette di averli riuniti e avvia la seconda cassetta: da bambina aveva sentito Enzo chiederle di ricordare un nome. Dopo ventotto anni lo pronuncia davanti agli altri e consegna ogni prova senza chiedere nulla in cambio.'
      },
      'Un ricatto costruito oggi': {
        title: 'Lea ha costruito il ricatto',
        text: 'Fai dimostrare che Lea ha spostato il bus e montato la seconda registrazione per ottenere denaro o silenzio da Meridiana, senza risolvere il mistero del 1998.',
        finale: 'Tracce recenti, tagli nell’audio e pagamenti richiesti a Meridiana conducono a Lea. Il gruppo smaschera il ricatto prima che le prove vengano vendute, ma ciò che accadde davvero negli undici minuti resta ancora aperto.'
      },
      'Ricordi alterati': {
        title: 'Enzo provocò la deviazione',
        text: 'Fai provare che Enzo organizzò da solo la scomparsa del bus e guidò volontariamente nel deposito, escludendo esperimenti e anomalie.',
        finale: 'La prima cassetta contiene le istruzioni registrate da Enzo e il suo accordo con una persona rimasta senza nome. Gli undici minuti furono una messinscena preparata da lui; ora gli otto devono decidere perché li coinvolse e chi lo pagò.'
      },
      'La galleria di Valmora': {
        title: 'Una galleria fuori dal tempo',
        text: 'Fai dimostrare che nessuno organizzò la scomparsa: il bus attraversò una struttura sotto Vetra in cui tempo e ricordi seguirono percorsi diversi.',
        finale: 'La polvere, i fotogrammi e gli orari delle due cassette conducono a una galleria murata. Il bus risulta uscito prima di entrarvi; sulle pareti, otto impronte infantili seguono direzioni incompatibili ma tutte reali.'
      },
      'Lasciare tutto sepolto': {
        text: 'Fai distruggere registrazioni e prove, convincendo il gruppo che qualunque versione pubblica danneggerebbe più persone di quante ne aiuterebbe.',
        finale: 'Gli otto bruciano le cassette nel piazzale e lasciano il bus alle ruspe. Quando il deposito crolla, sul vecchio telefono di Enzo arriva una chiamata di undici secondi: nessuno risponde e nessuno rompe il patto.'
      },
      'Un archivio pubblico': {
        text: 'Fai fermare la demolizione e rendere pubbliche tutte le versioni, senza obbligare la città ad accettarne una sola come definitiva.',
        finale: 'Il deposito viene salvato con il bus, le cassette e otto testimonianze incompatibili esposte una accanto all’altra. Valma ottiene un archivio degli Undici Minuti in cui anche le contraddizioni restano parte della prova.'
      }
    },
    sci01: {
      'Azzeramento completo': {
        finale: 'Enea avvia il reset mentre il suo doppio resta davanti alla telecamera simulata. Negli ultimi tre secondi la copia non lo supplica: gli racconta un ricordo d’infanzia che Enea non aveva mai confidato a nessuno. Poi Copia Zero diventa una schermata vuota e il San Lume torna ad avere corrente.'
      },
      'Nasconderla fuori rete': {
        text: 'Fai fingere l’azzeramento e trasferisci sul nodo isolato un solo quartiere di Copia Zero, accettando che il resto della città digitale non possa seguirlo.',
        finale: 'Enea sceglie il quartiere Orla e falsifica il registro mentre il resto di Copia Zero viene cancellato. Per sei ore il nodo resta muto; poi un solo lampione simulato si accende e la copia di Enea gli comunica che quel frammento di città è ancora vivo.'
      }
    },
    fan02: {
      'Salvare soltanto suo fratello': {
        finale: 'Nalia strappa il nome del fratello dal contratto e lo pronuncia davanti alla madre. Lei lo riconosce, ma non ricorda più gli anni in cui lo aveva dimenticato; lui torna a casa portando addosso il dolore di entrambi.'
      },
      'Un nome nuovo per i dimenticati': {
        finale: 'I dimenticati incidono il proprio nuovo nome sulla porta esterna di Valmora. Il mattino seguente la città non ricorda chi fossero, ma documenti e incantesimi riconoscono finalmente che quella porta e la comunità dietro di essa appartengono a loro.'
      }
    },
    hor02: {
      'Un finale nuovo': {
        finale: 'Lidia cambia l’ultima battuta e invita le figure a salire sul palco invece di restare in platea. Una dopo l’altra recitano il finale che non avevano mai avuto; la figura identica alla nonna conclude la scena con lei e finalmente si inchina.'
      },
      'La verità del 1931': {
        title: 'La nonna li tradì',
        text: 'Fai dimostrare che la nonna di Lidia causò volontariamente la tragedia del 1931 e porta Lidia a pronunciarne la confessione sul palco.',
        finale: 'Le battute cancellate e una nota dietro la fotografia ricostruiscono il tradimento. Lidia interpreta la nonna e confessa davanti alle figure ciò che lei nascose; il vecchio cast lascia la sala senza applaudirla.'
      },
      'Il ruolo della nonna': {
        title: 'La nonna provò a salvarli',
        text: 'Fai dimostrare che la nonna tentò di interrompere un finale mortale e venne accusata dagli altri, poi completa il gesto che non riuscì a terminare.',
        finale: 'Lidia trova nelle quinte la parte strappata che prova il tentativo della nonna. Ripete il segnale con cui voleva fermare lo spettacolo; le figure riconoscono l’errore, arretrano dal palco e la lasciano chiudere il sipario.'
      },
      'Fuggire senza finire': {
        title: 'Uno di loro resta sul palco',
        text: 'Fai accettare a un attore di prendere il posto lasciato vuoto nel 1931, permettendo al resto della compagnia di uscire senza completare il copione.',
        finale: 'Un attore resta sotto il riflettore e pronuncia il nome del personaggio mancante. Le porte si aprono per gli altri, poi si richiudono; dalla strada la compagnia sente un solo applauso continuare dentro il Lanterna.'
      },
      'Lasciare il teatro a loro': {
        finale: 'La compagnia fugge e il Lanterna viene murato. Ogni anno, nella data della tragedia, sotto la porta compare un biglietto appena stampato per ciascun attore che scelse di andarsene.'
      },
      'Mostrare il pubblico a Valma': {
        text: 'Fai coinvolgere la città con una diretta o aprendo un collegamento verso l’esterno, così che altre persone possano aiutare a completare le battute mancanti.',
        finale: 'La diretta raggiunge tutta Valma. Centinaia di spettatori ripetono da telefoni e piazza l’ultima battuta ricostruita; per la prima volta il pubblico del 1931 risponde a un pubblico vivo, applaude e libera il teatro.'
      }
    },
    lov01: {
      'Vendere e lasciarsi andare': {
        finale: 'Nora e Karim firmano e dividono ogni cosa, compreso il vecchio quaderno. Quando arrivano all’ultima pagina scoprono una promessa scritta anni prima: «Se finisce Casa Orla, non dobbiamo finire male anche noi». La strappano a metà e si salutano sorridendo.'
      },
      'Il luogo, non la coppia': {
        finale: 'Casa Orla riapre e loro lavorano insieme senza fingere di essere tornati indietro. Alla prima serata, Karim presenta Nora come «la persona con cui ho costruito questo posto»; lei risponde «e con cui ho finalmente imparato a lasciarlo libero».'
      }
    },
    adv01: {
      'Riportarlo fuori': {
        text: 'Fai ritrovare il lavoratore, convincilo a rinunciare a ciò che cercava e conduci l’intera squadra in superficie prima che l’ingresso crolli.',
        finale: 'La squadra raggiunge il lavoratore davanti a un meccanismo ancora attivo. Malik gli dimostra che restare significherebbe intrappolare anche i soccorritori; lui spegne il dispositivo e torna in superficie con loro mentre la pioggia chiude il passaggio.'
      },
      'La prima mappa completa': {
        title: 'Tornare con la mappa',
        text: 'Fai tracciare un percorso completo fino alla porta e riporta tutti indietro prima della pioggia, senza proseguire verso il centro delle strutture.',
        finale: 'Malik segna camere, pozzi e deviazioni fino alla soglia più profonda, poi ordina il ritorno. La squadra esce con una mappa utilizzabile pochi minuti prima del crollo, lasciando il centro di Vetra ancora irraggiunto.'
      },
      'Le prove contro Meridiana': {
        text: 'Fai recuperare documenti che dimostrino che Meridiana conosceva porta e simbolo prima della frana, rifiutando qualunque accordo riservato.',
        finale: 'Nel campo del lavoratore vengono trovati rilievi interni con date e firme dell’azienda. La squadra li porta direttamente all’esterno e li rende pubblici prima che Meridiana possa chiudere il cantiere.'
      },
      'Chiudere la porta': {
        text: 'Fai mettere in salvo la squadra e sigilla la porta antica dall’interno, impedendo a chiunque di trasformarla in un nuovo accesso.',
        finale: 'Il lavoratore indica il meccanismo e la squadra lo aziona prima di ritirarsi. La porta si chiude senza crollare; quando tornano al cantiere, il simbolo dell’anello aperto è diventato un cerchio completo.'
      },
      'Continuare oltre il limite': {
        text: 'Fai scegliere alla squadra di rinunciare al ritorno immediato e proseguire fino al centro delle strutture, anche se l’ingresso potrebbe chiudersi.',
        finale: 'Il gruppo supera la porta e raggiunge una sala che controlla passaggi e acqua sotto Vetra. Il lavoratore li aspettava lì per attivarla; alle loro spalle l’ingresso cede e la nuova missione diventa trovare un’altra uscita.'
      },
      'Un sito di Valma': {
        title: 'Aprire un accesso pubblico',
        text: 'Fai stabilizzare la porta e affidare l’accesso a Comune, soccorritori e comunità, impedendo sia il sigillo definitivo sia il controllo esclusivo di Meridiana.',
        finale: 'La squadra porta fuori prove sufficienti e una via sicura. Il cantiere viene sospeso, ma la porta resta aperta sotto una gestione pubblica con ingressi registrati e nessun proprietario unico.'
      },
      'L’accordo con Meridiana': {
        title: 'Un accordo riservato con Meridiana',
        text: 'Fai consegnare all’azienda mappa e prove in cambio dei mezzi necessari al soccorso, mantenendo segreta l’esistenza della porta.',
        finale: 'Meridiana invia strutture e personale che permettono di recuperare la squadra. Il lavoratore torna a casa, ma Malik consegna i rilievi e firma il silenzio mentre cancelli aziendali chiudono l’accesso.'
      },
      'L’uscita sotto Valma': {
        title: 'Rispettare la sua scelta di restare',
        text: 'Fai trovare il lavoratore vivo e consapevole, poi convinci la squadra a lasciargli viverne le conseguenze senza trascinarlo fuori.',
        finale: 'Il lavoratore spiega di essere entrato per custodire il meccanismo che la frana ha risvegliato. La squadra gli lascia viveri, una radio e un segnale per chiedere aiuto, poi torna indietro senza dichiararlo disperso contro la sua volontà.'
      }
    },
    com03: {
      'La grande bugia culturale': {
        finale: 'L’artista arriva, conferma che la statua è capovolta e rifiuta di firmare la versione del sindaco. Comune, guide e abitanti mantengono comunque la teoria inventata: il vero spettacolo diventa la città intera mentre difende una bugia con perfetta serietà.'
      },
      'Venderla per qualcosa di utile': {
        finale: 'La statua viene venduta per una cifra enorme e il denaro finanzia il progetto scelto dagli abitanti. Nella piazza resta soltanto il basamento montato al contrario; in pochi mesi diventa più fotografato dell’opera originale.'
      },
      'Non esiste un verso giusto': {
        title: 'Nessuno vuole più raddrizzarla',
        text: 'Fai diventare irrilevante il verso previsto dai progetti e porta abitanti, Comune e artista ad accettare che l’errore abbia ormai acquistato un significato proprio.',
        finale: 'I tecnici ammettono l’errore, ma una consultazione lampo mostra che quasi nessuno vuole correggerlo. L’artista aggiunge una targa con entrambe le orientazioni e lascia alla città la versione che ha scelto di riconoscere.'
      }
    }
  };

  for (const storyId of Object.keys(objectives)) {
    if (!allowedStoryIds.has(storyId)) delete objectives[storyId];
  }

  const expected = Object.values(patches).reduce((total, storyPatches) => total + Object.keys(storyPatches).length, 0);
  let changed = 0;
  for (const [storyId, storyPatches] of Object.entries(patches)) {
    for (const objective of objectives[storyId] || []) {
      const patch = storyPatches[objective.title];
      if (!patch) continue;
      Object.assign(objective, patch);
      changed += 1;
    }
  }

  window.STORIA52_COLLECTION_BALANCE_PATCHES = changed;
  if (changed !== expected) console.error(`La Prima Scintilla: attese ${expected} correzioni di bilanciamento, trovate ${changed}.`);
})();
