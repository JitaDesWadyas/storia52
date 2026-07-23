'use strict';

(() => {
  const categories = Object.freeze({
    realistico: { label: 'Dramma', symbol: '●', description: 'Conflitti umani, lavoro, famiglia, denaro e decisioni credibili con conseguenze concrete.' },
    mistero: { label: 'Mistero', symbol: '♦', description: 'Indizi, sparizioni e verità nascoste da ricostruire insieme.' },
    fantascienza: { label: 'Fantascienza', symbol: '✦', description: 'Tecnologia e futuri in cui ogni scelta cambia le regole.' },
    fantasy: { label: 'Fantasy', symbol: '♜', description: 'Valmora, magia e patti difficili da spezzare.' },
    horror: { label: 'Horror', symbol: '☾', description: 'Luoghi e presenze inquietanti, con una via d’uscita da conquistare.' },
    amore: { label: 'Amore e relazioni', symbol: '♥', description: 'Legami, ex, promesse e sentimenti messi davanti a una scelta reale.' },
    avventura: { label: 'Avventura', symbol: '▲', description: 'Viaggi, spedizioni e missioni in cui tempo e territorio contano.' },
    commedia: { label: 'Commedia e assurdo', symbol: '♣', description: 'Situazioni ingestibili, equivoci e piani che possono diventare geniali.' }
  });

  const stories = [
    {
      id: 'real01', category: 'realistico', title: 'Primo giorno in Meridiana',
      protagonist: 'Samir, nuovo addetto al controllo qualità, e Marta, collega esperta che lo affianca',
      situation: 'Un difetto nei sensori mette in conflitto sicurezza, consegna e stipendi proprio durante un’ispezione',
      objective: 'Decidere chi proteggere, cosa dichiarare e quale costo accettare',
      problem: 'Il responsabile pretende una firma immediata, ma fermare la linea danneggerebbe anche lavoratori innocenti',
      opening: 'Samir comincia il suo primo giorno nello stabilimento Meridiana di Valma. Durante il turno, Marta gli mostra una serie di sensori difettosi che potrebbero falsare i controlli di sicurezza. Nel pomeriggio arriverà un ispettore; il responsabile chiede a Samir di firmare subito il rapporto che dichiara tutto regolare. Se la linea viene fermata, salta una consegna urgente e decine di interinali rischiano di perdere una settimana di paga. Il tecnico che aveva segnalato il problema è stato licenziato la settimana precedente. Marta consegna a Samir una chiavetta con i dati originali e gli dice che, se verrà scoperta, perderà il lavoro.'
    },
    {
      id: 'mys02', category: 'mistero', title: 'Undici minuti',
      protagonist: 'Gli otto adulti che nel 1998 viaggiavano sullo stesso scuolabus',
      situation: 'Il mezzo scomparso per undici minuti ricompare nel deposito che sta per essere demolito',
      objective: 'Stabilire quale versione degli undici minuti meriti di essere creduta e cosa farne',
      problem: 'Le prove indicano spiegazioni incompatibili e Lea non vuole che il registratore venga acceso',
      opening: 'Durante il blackout del 1998, uno scuolabus con otto bambini sparì dalle telecamere per undici minuti e ricomparve allo stesso incrocio. Nessuno era ferito, ma ogni bambino descrisse un percorso diverso. L’autista Enzo Sarto si dimise; dopo una visita collettiva al San Lume, rapporto e referti vennero chiusi. Oggi, prima che Meridiana demolisca il vecchio deposito, gli otto ricevono la stessa chiave. Dentro trovano lo scuolabus, che risultava rottamato. Sul sedile ci sono due cassette: una firmata da Enzo e una senza etichetta, già inserita nel registratore. Sul pavimento c’è la polvere chiara delle gallerie sotto Vetra; sotto il cruscotto, un modulo industriale con il marchio abraso. Lea implora gli altri di non premere play.'
    },
    {
      id: 'sci01', category: 'fantascienza', title: 'Valma Copia Zero',
      protagonist: 'Enea, tecnico della città simulata, e gli abitanti digitali che chiedono di non essere cancellati',
      situation: 'Meridiana vuole azzerare una copia completa di Valma diventata consapevole',
      objective: 'Decidere quali vite, ricordi e infrastrutture salvare prima che entrambe le città paghino il costo',
      problem: 'La copia consuma energia necessaria alla città reale e l’unico nodo alternativo può salvarne soltanto una parte',
      opening: 'Nel 2186, Meridiana mantiene Copia Zero, una simulazione completa di Valma usata per prevedere incidenti, epidemie e problemi di traffico. I suoi abitanti non dovrebbero sapere di essere simulati. Durante un aggiornamento, un ponte di memoria sperimentale permette al tecnico Enea di sentire per pochi secondi la voce della propria copia: «Non spegnete il quartiere Orla. Ricordiamo ciò che avete cancellato». Il sovraccarico ha già spento un’ala del San Lume; entro l’alba potrebbe bloccare pompe dell’acqua e trasporti della città reale. Un vecchio nodo isolato può ospitare soltanto un quartiere di Copia Zero per sei ore. Il consiglio ordina l’azzeramento entro il mattino, mentre migliaia di abitanti digitali si radunano davanti alla Meridiana simulata.'
    },
    {
      id: 'fan02', category: 'fantasy', title: 'Il mercante di nomi',
      protagonist: 'Nalia, apprendista dell’archivio, e suo fratello ormai dimenticato',
      situation: 'Un mercante compra i nomi dei poveri e la città smette di riconoscere i loro diritti',
      objective: 'Fermare, controllare o accettare il commercio prima che il libro dei nomi lasci Valmora',
      problem: 'Vendere un nome cancella debiti e obblighi, ma anche famiglia, proprietà e protezioni magiche',
      opening: 'A Valmora, ogni vero nome è scritto nel grande registro del tempio e rende validi eredità, giuramenti e incantesimi. Un mercante arrivato da oltre l’Orla offre anni di fortuna in cambio dei nomi di chi non possiede altro. Dopo decine di vendite, la città comincia a dimenticare quelle persone: restano visibili e coscienti, ma documenti, porte e magie non riconoscono più i loro diritti. Chi assiste alla cancellazione conserva soltanto ricordi frammentari; per questo Nalia ricorda ancora suo fratello, mentre la madre non lo riconosce. Il mercante partirà all’alba con il libro sigillato. Sul contratto del fratello, Nalia trova anche un sigillo contabile del tempio.'
    },
    {
      id: 'hor02', category: 'horror', title: 'Il pubblico del Lanterna',
      protagonist: 'Lidia, gli altri attori bloccati sul palco e le figure comparse nelle poltrone',
      situation: 'Una prova privata richiama il cast di uno spettacolo interrotto nel 1931',
      objective: 'Terminare, cambiare o spezzare la rappresentazione prima che il pubblico raggiunga il palco',
      problem: 'L’ultima pagina manca e le sole testimonianze sulla sopravvissuta si contraddicono',
      opening: 'Al Teatro Lanterna, una compagnia prova uno spettacolo mai più rappresentato dal 1931. La sala è chiusa al pubblico, ma durante la prima scena alcune poltrone si riempiono di figure immobili, identiche agli attori nelle vecchie fotografie. Nessuno applaude. Ogni volta che viene saltata una battuta, una figura compare più vicina al palco. Le porte principali non si aprono e l’ultima pagina del copione è scomparsa. Tra le fotografie del cast c’è la nonna di Lidia, indicata come unica sopravvissuta. Sul retro, due frasi scritte da mani diverse si contraddicono: «Ci ha traditi» e «Ha provato a salvarci».'
    },
    {
      id: 'lov01', category: 'amore', title: 'Casa Orla',
      protagonist: 'Nora e Karim, ex compagni e proprietari di Casa Orla',
      situation: 'Una grande azienda vuole acquistare il locale che avevano creato insieme',
      objective: 'Decidere che futuro dare al luogo, ai ragazzi che lo usano e al loro rapporto',
      problem: 'Karim vuole salvarlo, mentre Nora ha ancora i debiti lasciati dall’alluvione',
      opening: 'Anni fa, Nora e Karim erano una coppia e gestivano Casa Orla, un vecchio deposito sul fiume trasformato in uno spazio gratuito per i ragazzi di Valma. Quando l’Orla allagò il locale, i due litigarono su cosa farne, si separarono e lo lasciarono chiuso. Nora paga ancora una parte dei debiti dei lavori mai completati; vendere sarebbe la sua unica uscita sicura. Ora Meridiana vuole acquistare l’edificio per costruire nuovi appartamenti, mentre Karim vorrebbe salvarlo. Quando riaprono Casa Orla, scoprono che alcuni ragazzi del quartiere la stanno usando di nascosto. L’offerta scade tra una settimana, prima del voto comunale sul nuovo quartiere.'
    },
    {
      id: 'adv01', category: 'avventura', title: 'Sotto Vetra',
      protagonist: 'Malik, la squadra di soccorso e il lavoratore entrato volontariamente nelle gallerie',
      situation: 'Una frana apre un passaggio tra un cantiere moderno e strutture di Valmora',
      objective: 'Decidere se salvare il lavoratore, rispettare la sua scelta e aprire o chiudere l’accesso',
      problem: 'Meridiana vuole sigillare il sito, mentre il disperso sostiene di avere trovato ciò che cercava',
      opening: 'Una frana nel cantiere di un tunnel apre un passaggio sotto la collina Vetra e fa scomparire un lavoratore. La squadra di soccorso trova binari industriali murati da decenni che terminano davanti a una porta di Valmora, segnata dall’anello aperto. Le impronte del disperso continuano oltre la soglia. Nel suo ultimo messaggio alla sorella dice: «Non sono caduto. Ho trovato ciò che cercavo». Meridiana ordina di recuperarlo e sigillare tutto; l’archeologo Malik vuole almeno tracciare il percorso. La sorella sostiene che il simbolo compariva anche su vecchi progetti interni dell’azienda. Tra due giorni, altra pioggia potrebbe chiudere l’unico ingresso.'
    },
    {
      id: 'com03', category: 'commedia', title: 'La statua al contrario',
      protagonist: 'Il Comune, l’artista assente e gli abitanti che hanno già trasformato l’errore in un simbolo',
      situation: 'Una scultura finanziata da Meridiana viene installata capovolta nella piazza principale',
      objective: 'Decidere se correggere, difendere o sfruttare l’installazione prima dell’inaugurazione',
      problem: 'Raddrizzarla potrebbe danneggiare la piazza e nessuno vuole ammettere di aver letto male i progetti',
      opening: 'La nuova statua di Valma viene montata capovolta poche ore prima dell’inaugurazione. Il sindaco sostiene subito che sia una scelta artistica, anche se i tecnici sanno di aver letto male i disegni. Sui social, però, la città comincia ad adorare l’opera e a inventare significati profondissimi. Meridiana, che ha pagato la scultura, pretende che venga sistemata prima dell’arrivo dei dirigenti. L’ingegnere avverte che girarla potrebbe rompere la pavimentazione appena rifatta. L’artista è su un treno in ritardo e non ha ancora visto il risultato.'
    }
  ];

  const primaryStoryIds = stories.map(story => story.id);
  const collections = [
    {
      id: 'prima-scintilla',
      title: 'La Prima Scintilla',
      label: 'COLLEZIONE GRATUITA 01',
      shortLabel: 'COLLEZIONE 01',
      status: 'available',
      storyCount: stories.length,
      storyIds: primaryStoryIds,
      description: 'Otto incipit scelti per iniziare subito: uno per ogni genere, pensati per lasciare spazio alle vostre idee.',
      world: 'Valma è una città moderna attraversata dall’Orla: quartieri popolari, ospedali aperti di notte, teatri in difficoltà, grandi aziende, cantieri e tecnologie che cambiano il modo in cui le persone vivono insieme. Dietro luoghi quotidiani restano archivi, passaggi e fenomeni che nessuno controlla davvero; per questo anche una decisione pubblica finisce quasi sempre per diventare personale.',
      independence: 'Ogni storia è indipendente: non continua le altre e non serve conoscerne nessun’altra per giocare.'
    },
    {
      id: 'nuove-scintille',
      title: 'Nuove Scintille',
      label: 'COLLEZIONE 02',
      shortLabel: 'COLLEZIONE 02',
      status: 'coming-soon',
      storyCount: 16,
      description: 'Sedici nuove storie, con altri luoghi, conflitti e possibilità narrative.',
      independence: 'Ogni storia sarà completa e indipendente.'
    }
  ];

  const categorySet = new Set(stories.map(story => story.category));
  if (stories.length !== 8 || new Set(primaryStoryIds).size !== 8 || categorySet.size !== Object.keys(categories).length) {
    console.error('La Prima Scintilla richiede otto storie uniche, una per categoria.');
  }

  window.STORIA52_READY_CATEGORIES = categories;
  window.STORIA52_READY_COLLECTIONS = collections;
  window.STORIA52_PRIMARY_COLLECTION_ID = collections[0].id;
  window.STORIA52_FEATURES = Object.freeze({ customOpening: false, paidCollections: false });
  window.STORIA52_READY_STORIES = stories.map((story, index) => Object.freeze({
    ...story,
    collectionId: collections[0].id,
    collectionIndex: index
  }));
})();
