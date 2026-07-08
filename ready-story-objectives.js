'use strict';

(() => {
  const S = window.S52;
  if (!S) return;

  const strip = value => String(value || '').trim().replace(/[.!?]+$/, '');
  const lower = value => value ? value.charAt(0).toLowerCase() + value.slice(1) : '';
  const cap = value => value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
  const protagonist = story => strip(story.protagonist).replace(/^(Un|Una|Due|Quattro)\s+/i, '').replace(/,$/, '');
  const storyGoal = story => lower(strip(story.objective));
  const storyProblem = story => lower(strip(story.problem));

  const make = (title, text, finale) => ({ title, text, finale });

  const objectivePlans = {
    mystery: [
      story => make(
        'Verità completa',
        `Porta la storia verso una spiegazione completa: ${storyGoal(story)}, ma senza tagliare fuori nessun indizio importante.`,
        `Il mistero di “${story.title}” si chiude con una verità pubblica, chiara e difficile da negare.`
      ),
      story => make(
        'Verità nascosta',
        `Fai in modo che ${storyProblem(story)} resti nascosto almeno fino al finale, anche se gli altri stanno arrivando alla soluzione.`,
        `La storia finisce con una verità ancora coperta: qualcuno è salvo, ma il mistero non è davvero risolto.`
      ),
      story => make(
        'Proteggi il coinvolto',
        `Spingi la storia a proteggere la persona più compromessa dagli indizi, anche se questo rallenta ${storyGoal(story)}.`,
        `Il finale salva una persona coinvolta, ma lascia agli altri il dubbio su quanto fosse innocente.`
      ),
      story => make(
        'Incastra il manipolatore',
        `Usa ogni dettaglio strano per far emergere qualcuno che stia usando ${protagonist(story)} o gli altri personaggi.`,
        `Il finale rivela un manipolatore e lo mette davanti a una prova che non può più controllare.`
      ),
      story => make(
        'Vantaggio personale',
        `Trasforma ${storyGoal(story)} in un’occasione personale: il protagonista deve ottenere qualcosa per sé prima di aiutare gli altri.`,
        `Il mistero viene risolto, ma il protagonista ne esce con un vantaggio sporco o moralmente ambiguo.`
      ),
      story => make(
        'Falsa pista utile',
        `Costruisci una falsa spiegazione credibile che serva a guadagnare tempo contro ${storyProblem(story)}.`,
        `Il finale mostra che la bugia ha funzionato, ma ora qualcuno deve pagare il prezzo della versione inventata.`
      ),
      story => make(
        'Prova distrutta',
        `Porta la storia verso la distruzione della prova più importante, ma solo perché rivelarla farebbe danni peggiori.`,
        `Il finale chiude il pericolo immediato, però cancella per sempre la possibilità di dimostrare tutta la verità.`
      ),
      story => make(
        'Confessione forzata',
        `Fai arrivare il protagonista a una scena in cui qualcuno deve confessare davanti a tutti o perdere qualcosa di decisivo.`,
        `Il finale non dipende da un indizio, ma da una confessione ottenuta sotto pressione.`
      ),
      story => make(
        'Innocente salvato',
        `Orienta la storia perché il sospetto più facile venga scagionato, anche se questo complica ${storyGoal(story)}.`,
        `Il finale ribalta l’accusa principale e salva chi sembrava colpevole.`
      ),
      story => make(
        'Scambio finale',
        `Spingi verso uno scambio: la verità viene consegnata soltanto in cambio di una rinuncia concreta.`,
        `Il mistero si risolve, ma il protagonista deve cedere qualcosa di personale per ottenere la risposta.`
      )
    ],

    relations: [
      story => make(
        'Riconciliazione vera',
        `Porta i personaggi a parlare davvero del conflitto e a scegliere il rapporto invece della vittoria personale.`,
        `Il finale ricuce il legame centrale, anche se nessuno ottiene esattamente ciò che voleva.`
      ),
      story => make(
        'Rottura necessaria',
        `Spingi la storia verso una separazione pulita: qualcuno deve ammettere che salvare il rapporto peggiorerebbe tutto.`,
        `Il finale rompe un legame importante, ma permette al protagonista di uscire dalla bugia o dal ricatto emotivo.`
      ),
      story => make(
        'Proteggi il più debole',
        `Fai scegliere al protagonista la persona più vulnerabile della storia, anche se questo rende più difficile ${storyGoal(story)}.`,
        `Il finale protegge chi aveva meno potere, ma lascia aperta una ferita nel gruppo.`
      ),
      story => make(
        'Accordo imperfetto',
        `Cerca una soluzione pratica e scomoda: nessuno vince del tutto, ma il disastro viene evitato.`,
        `Il finale trova un compromesso concreto, non romantico, che tiene in piedi la situazione.`
      ),
      story => make(
        'Tradimento scoperto',
        `Porta in superficie il tradimento, il segreto o la scorrettezza più pesante, anche se rovina la scena.`,
        `Il finale fa esplodere la verità davanti a tutti e costringe i personaggi a scegliere da che parte stare.`
      ),
      story => make(
        'Bugia protettiva',
        `Difendi una bugia se serve a evitare un danno immediato a una persona importante.`,
        `Il finale salva il momento, ma rende inevitabile una resa dei conti futura.`
      ),
      story => make(
        'Vittoria egoista',
        `Spingi un personaggio a ottenere ciò che vuole, anche a costo di danneggiare un rapporto centrale.`,
        `Il finale dà una vittoria concreta, ma lascia il protagonista più solo o meno rispettato.`
      ),
      story => make(
        'Seconda possibilità',
        `Crea le condizioni perché chi ha sbagliato possa rimediare con un’azione visibile, non solo con parole.`,
        `Il finale concede una seconda possibilità, ma solo dopo una scelta che costa davvero.`
      ),
      story => make(
        'Verità al posto della pace',
        `Rifiuta la soluzione tranquilla se richiede di nascondere ciò che è successo davvero.`,
        `Il finale sacrifica l’armonia del gruppo per una verità finalmente detta.`
      ),
      story => make(
        'Patto nuovo',
        `Fai nascere una regola nuova tra i personaggi: il vecchio rapporto non torna, ma può diventare qualcos’altro.`,
        `Il finale non ripara il passato: crea un nuovo accordo più onesto e più fragile.`
      )
    ],

    urgency: [
      story => make(
        'Salvare le persone',
        `Dai priorità alla sicurezza immediata: ${storyGoal(story)} deve servire prima di tutto a evitare feriti.`,
        `Il finale salva le persone, anche se strutture, soldi o reputazioni vengono danneggiati.`
      ),
      story => make(
        'Salvare il sistema',
        `Spingi verso una soluzione che tenga in piedi l’impianto, l’evento o l’organizzazione, anche rischiando una scelta impopolare.`,
        `Il finale evita il collasso generale, ma qualcuno accusa il protagonista di aver sacrificato troppo.`
      ),
      story => make(
        'Allarme pubblico',
        `Fai scattare l’allarme davanti a tutti prima che sia troppo tardi, anche senza avere tutte le prove.`,
        `Il finale nasce da una decisione drastica: il panico viene gestito meglio del silenzio.`
      ),
      story => make(
        'Silenzio strategico',
        `Evita il panico tenendo nascosto il pericolo finché non esiste una via d’uscita credibile.`,
        `Il finale funziona perché il protagonista controlla le informazioni, ma rischia di perdere la fiducia degli altri.`
      ),
      story => make(
        'Sacrificio materiale',
        `Accetta di perdere qualcosa di costoso o importante pur di neutralizzare ${storyProblem(story)}.`,
        `Il finale chiude l’emergenza distruggendo, bloccando o abbandonando qualcosa che sembrava indispensabile.`
      ),
      story => make(
        'Colpevole esposto',
        `Trasforma l’emergenza in una caccia a chi ha causato o coperto il problema.`,
        `Il finale non salva solo la situazione: rivela anche chi l’ha resa pericolosa.`
      ),
      story => make(
        'Soluzione tecnica',
        `Fai arrivare il protagonista a una soluzione pratica usando strumenti, luoghi o competenze già comparsi nella storia.`,
        `Il finale riesce grazie a una manovra concreta, rischiosa ma leggibile.`
      ),
      story => make(
        'Scelta impossibile',
        `Metti il protagonista davanti a due danni reali e obbligalo a sceglierne uno, senza scorciatoie pulite.`,
        `Il finale salva una parte della situazione e ne perde un’altra in modo irreversibile.`
      ),
      story => make(
        'Guida del gruppo',
        `Fai sì che il protagonista convinca persone spaventate o divise a seguire un piano unico.`,
        `Il finale funziona perché il gruppo collabora invece di muoversi ognuno per conto proprio.`
      ),
      story => make(
        'Ultimo minuto',
        `Porta tutto verso un’azione finale al limite del tempo, quando aspettare non è più possibile.`,
        `Il finale si chiude con una manovra riuscita all’ultimo secondo, ma con conseguenze visibili.`
      )
    ],

    strange: [
      story => make(
        'Capire la regola',
        `Fai emergere una regola precisa dietro l’evento impossibile e usala per inseguire ${storyGoal(story)}.`,
        `Il finale risolve lo strano perché il protagonista capisce la regola e la piega a proprio favore.`
      ),
      story => make(
        'Spezzare la regola',
        `Spingi verso un gesto che violi apertamente la logica dell’evento strano, anche se nessuno sa cosa succederà.`,
        `Il finale rompe il meccanismo impossibile, ma libera anche una conseguenza non controllata.`
      ),
      story => make(
        'Accettare l’assurdo',
        `Non cercare di normalizzare tutto: fai agire i personaggi come se l’impossibile fosse ormai parte della realtà.`,
        `Il finale non cancella lo strano, ma lo integra nella vita dei personaggi.`
      ),
      story => make(
        'Proteggere il ricordo',
        `Difendi un ricordo, un legame o un luogo personale dal prezzo richiesto dall’evento impossibile.`,
        `Il finale salva qualcosa di intimo, anche se il mistero resta in parte vivo.`
      ),
      story => make(
        'Pagare il prezzo',
        `Fai accettare al protagonista uno scambio concreto pur di raggiungere ${storyGoal(story)}.`,
        `Il finale funziona, ma il protagonista perde qualcosa che non può recuperare.`
      ),
      story => make(
        'Usare l’anomalia',
        `Trasforma l’evento strano in uno strumento utile invece di trattarlo solo come una minaccia.`,
        `Il finale sfrutta l’anomalia per ottenere un risultato impossibile in condizioni normali.`
      ),
      story => make(
        'Liberare qualcun altro',
        `Usa la stranezza per salvare o liberare una persona intrappolata dalla stessa regola.`,
        `Il finale libera qualcuno, ma sposta sul protagonista una parte del problema.`
      ),
      story => make(
        'Rifiutare la tentazione',
        `Fai comparire un vantaggio enorme offerto dall’evento strano e porta il protagonista a rifiutarlo.`,
        `Il finale vince perché il protagonista rinuncia alla scorciatoia più seducente.`
      ),
      story => make(
        'Invertire i ruoli',
        `Spingi la storia a rivelare che il protagonista non è solo vittima dell’anomalia, ma una sua parte attiva.`,
        `Il finale ribalta il punto di vista: il protagonista capisce di aver alimentato lo strano fin dall’inizio.`
      ),
      story => make(
        'Uscita incompleta',
        `Trova una via d’uscita parziale: qualcuno si salva, ma non tutto torna normale.`,
        `Il finale permette di uscire dalla situazione, lasciando però un segno impossibile nel mondo reale.`
      )
    ]
  };

  S.objectivesForReadyStory = (story, count = 4) => {
    const plans = objectivePlans[story?.category] || objectivePlans.mystery;
    return Array.from({ length: count }, (_, index) => {
      const plan = plans[index % plans.length](story);
      return {
        custom: true,
        storyId: story.id,
        slot: index % plans.length,
        title: plan.title,
        text: cap(plan.text),
        finale: plan.finale
      };
    });
  };

  const previousChooseReadyStory = S.chooseReadyStory;
  S.chooseReadyStory = (session, story) => {
    if (!story) return;
    session.objectives = S.objectivesForReadyStory(story, session.count);
    session.confirmed = Array(session.count).fill(false);
    previousChooseReadyStory(session, story);
  };
})();
