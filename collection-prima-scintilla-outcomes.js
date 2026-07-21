'use strict';

(() => {
  const objectives = window.STORIA52_READY_OBJECTIVES || {};
  const patches = {
    real01: {
      'Proteggere Marta': 'Samir firma una dichiarazione in cui si assume l’ultima serie di controlli, ma infila nel fascicolo dell’ispettore la chiavetta del tecnico licenziato. Quando viene accompagnato fuori, Marta resta al banco con il badge di Samir in mano e capisce che ora tocca a lei finire ciò che lui ha iniziato.',
      'Accettare il sistema': 'L’ispezione passa e Samir riceve il contratto stabile. La sera, mentre la pioggia batte sui vetri, sul monitor compare il primo sensore rosso con accanto la sua firma: nessuno nel reparto trova il coraggio di guardarlo.'
    },
    real02: {
      'Dividere il palazzo': 'Il palazzo viene separato da una nuova porta tagliafuoco: da una parte gli appartamenti venduti, dall’altra quelli rimasti ai residenti. La prima sera, gli anziani scoprono che il vecchio tavolo comune è finito esattamente sulla linea di confine e decidono di lasciarlo lì.',
      'Trasferirsi tutti': 'Il palazzo viene dichiarato inabitabile e le famiglie ottengono case equivalenti nello stesso quartiere. Prima di consegnare le chiavi, ciascuno stacca un numero dal proprio pianerottolo; mesi dopo quei numeri formano l’insegna della nuova sala comune.'
    },
    real03: {
      'Chiudere bene': 'Il Bar Aurora serve l’ultimo caffè alle cinque e ventisette, l’ora in cui il padre dei fratelli apriva ogni mattina. Elena spegne l’insegna, Paolo conserva soltanto la vecchia tazzina sbeccata e i due escono senza voltarsi, finalmente fratelli prima che soci.',
      'Passarlo a chi ci lavora': 'Elena e Paolo consegnano le chiavi a Noor, la barista che conosce per nome infermieri e visitatori. All’alba del primo giorno senza di loro, ricevono la foto della serranda alzata con un cartello scritto a mano: «Aurora continua».'
    },
    mys01: {
      'Restituita senza un colpevole': 'La maschera ricompare al centro del palco, avvolta nel vecchio sipario. Marta vede sul bordo un filo dello stesso colore del cappotto del colpevole, lo strappa prima che arrivino gli agenti e lo chiude nel proprio taccuino: il teatro è salvo, ma tra loro quattro nessuno si fiderà più davvero.',
      'Nessun furto': 'Il montacarichi risale lentamente e porta con sé la maschera, incastrata in una cesta di scena dal blackout. Per un istante tutti ridono del sospetto che li aveva divisi; poi Celeste nota che il fermaglio della teca è stato aperto a mano.'
    },
    mys02: {
      'La galleria di Valmora': 'Le registrazioni guidano gli otto a una galleria murata sotto Vetra. Ognuno riconosce un dettaglio diverso del proprio ricordo; Lea posa la mano su una parete e dall’altra parte una voce bambina conta fino a undici.',
      'Lasciare tutto sepolto': 'Gli otto bruciano il nastro nel piazzale prima che arrivino le ruspe. Quando il deposito crolla, Enzo riceve sul vecchio telefono una chiamata di undici secondi: nessuno parla, ma in sottofondo si sente il motore dello scuolabus.'
    },
    mys03: {
      'Approvare senza una risposta': 'Il tunnel viene approvato e la pagina 47 resta senza autore. La notte prima dell’avvio dei lavori, Elena trova sul parabrezza una copia nuova del foglio: la camera è stata spostata sul tracciato appena approvato.',
      'L’errore di Bruno': 'Bruno trova la pagina piegata dentro il fascicolo di un altro progetto e confessa le bugie. Mentre svuota la scrivania, si accorge che sul retro qualcuno ha disegnato l’anello aperto con inchiostro ancora fresco.'
    },
    sci01: {
      'Azzeramento completo': 'Enea avvia il reset mentre il suo doppio resta davanti alla telecamera simulata. Negli ultimi tre secondi la copia non lo supplica: gli racconta un ricordo d’infanzia che Enea non aveva mai confidato a nessuno. Poi Valma Copia Zero diventa una schermata vuota.',
      'Nasconderla fuori rete': 'Enea falsifica il registro e trasferisce il nucleo su una rete dimenticata sotto Vetra. Mesi dopo, ogni notte alle 02:17, un lampione spento davanti a casa sua si accende per pochi secondi: è l’unico modo che Copia Zero ha per dirgli che esiste ancora.'
    },
    sci02: {
      'Cambiare una sola persona': 'Ada sostituisce uno degli sconosciuti con la sorella del proprietario morto. La camera si apre comunque, ma invece di un’arma contiene una registrazione destinata a lei; nel ricordo originale non compariva perché qualcuno aveva passato anni a cancellarla dalla storia.',
      'Raggiungere il vero destinatario': 'Ada consegna il file a un vecchio che riconosce subito la voce del proprietario. Il giorno dopo lui prende il suo posto davanti alla camera e, prima che la porta si chiuda, le lascia il proprio ricordo più felice come pagamento.'
    },
    sci03: {
      'Salvare il canale, perdere il quartiere': 'Il livello inferiore viene evacuato e riempito di pilastri. Sara torna mesi dopo e trova, murato nel cemento nuovo, il disegno della scuola con tutti i nomi degli abitanti: Meridiana ha salvato l’acqua, ma non è riuscita a cancellare chi viveva sotto.',
      'Riparazione segreta': 'Sara completa i lavori durante falsi turni di manutenzione. La sera dell’ultimo intervento, gli abitanti le consegnano una chiave senza serratura e le dicono che, finché la conserverà, per il quartiere lei non sarà mai una persona di sopra.'
    },
    fan01: {
      'Liberare la voce': 'La porta si apre e la voce attraversa l’esercito come vento dentro un incendio. All’alba Valmora è salva, ma la custode trova la propria ombra rivolta verso Vetra anche quando il sole sorge alle sue spalle.',
      'Fondere le campane': 'Le sette campane diventano punte di lancia e rinforzi per le porte. Durante la vittoria, un bambino sente un ottavo rintocco provenire da sotto il palazzo; nessun adulto ammette di averlo udito.'
    },
    fan02: {
      'Salvare soltanto suo fratello': 'Nalia strappa il nome del fratello dal contratto e lo pronuncia davanti alla madre. Lei lo riconosce, ma non ricorda più gli anni in cui lo aveva dimenticato; lui torna a casa portando addosso il dolore di entrambi.',
      'Un nome nuovo per i dimenticati': 'I dimenticati incidono il proprio nuovo nome sulla porta esterna di Valmora. Il mattino seguente la città non ricorda chi fossero, ma ricorda perfettamente che quella porta appartiene a loro.'
    },
    fan03: {
      'Forzare le chiuse': 'I maghi piegano l’Orla e l’acqua torna nei canali avvolta da catene luminose. Iren beve dalla prima coppa e sente sapore di ferro; quella notte tutti i bambini nati lungo il fiume sognano la stessa porta spezzata.',
      'Acqua per tutti': 'Le fontane del palazzo vengono chiuse e la regina porta personalmente la prima brocca nel quartiere più secco. Quando l’ultima cisterna viene aperta, l’Orla oltrepassa le chiuse da sola e bagna per prima i piedi di chi aspettava da più tempo.'
    },
    hor01: {
      'Portare Arturo': 'Arturo entra nel piano zero e la porta si chiude senza rumore. Alle sei del mattino Daria riceve il suo referto: «dimesso in buone condizioni», firmato da lei con una grafia che non ha mai usato.',
      'Usare le chiamate': 'Daria segue le previsioni e salva tre pazienti prima dell’alba. Quando il turno finisce, il telefono squilla ancora: la voce le comunica con calma l’ora esatta in cui morirà lei.'
    },
    hor02: {
      'Un finale nuovo': 'La protagonista cambia l’ultima battuta e invita le figure a salire sul palco invece di restare in platea. Una dopo l’altra recitano il finale che non avevano mai avuto; l’ultima figura, identica alla nonna, le lascia il proprio anello prima di svanire.',
      'Lasciare il teatro a loro': 'La compagnia fugge e il Lanterna viene murato. Ogni anno, nella data della tragedia, otto biglietti appena stampati compaiono sotto la porta; sul retro c’è il nome degli attori che avevano scelto di andarsene.'
    },
    hor03: {
      'Aprire come previsto': 'L’ascensore supera il tetto e si apre su un corridoio arredato con oggetti presi dalle case di tutti loro. In fondo, il citofono sta registrando la conversazione che hanno appena avuto; accanto al microfono lampeggia una data del giorno successivo.',
      'Abbandonare il palazzo': 'Il palazzo viene demolito fino al quarto piano. Per sette secondi le ruspe mostrano un quinto livello pieno di finestre illuminate; dietro una di esse, gli ex abitanti vedono sé stessi ancora dentro.'
    },
    lov01: {
      'Vendere e lasciarsi andare': 'Nora e Karim firmano e dividono ogni cosa, compreso il vecchio quaderno. Quando arrivano all’ultima pagina scoprono una promessa scritta anni prima: «Se finisce Casa Orla, non dobbiamo finire male anche noi». La strappano a metà e si salutano sorridendo.',
      'Il luogo, non la coppia': 'Casa Orla riapre e loro lavorano insieme senza fingere di essere tornati indietro. Alla prima serata, Karim presenta Nora come «la persona con cui ho costruito questo posto»; lei risponde «e con cui ho finalmente imparato a lasciarlo libero».'
    },
    lov02: {
      'Lasciarlo incompiuto': 'Le luci si spengono prima della scelta finale. In platea nessuno applaude subito; poi una spettatrice grida il proprio finale e altre cento voci le rispondono. Viola ed Elia capiscono che l’opera non appartiene più alla loro separazione.',
      'Il finale di Viola': 'La protagonista parte nell’ultima scena e sul palco resta soltanto una valigia vuota. Elia applaude in piedi; nel foyer restituisce a Viola la chiave della casa che aveva conservato per otto anni.'
    },
    lov03: {
      'Scegliere i propri doveri': 'Mira e Taren testimoniano contro le menzogne delle rispettive famiglie e si separano davanti al ponte. Anni dopo, ogni carico attraversa con due sigilli, uno per corporazione; soltanto loro sanno che il simbolo centrale unisce le iniziali dei loro nomi.',
      'Fuggire prima del consiglio': 'All’alba attraversano l’Orla nascosti sotto i sacchi di una carovana. Quando Valmora scompare dietro la nebbia, Mira apre il pugno: ha portato con sé il sigillo spezzato, l’unica prova che avrebbe potuto scagionarli.'
    },
    adv01: {
      'Continuare oltre il limite': 'Il gruppo supera la porta e l’ingresso crolla alle sue spalle. Nel centro delle strutture trovano il lavoratore scomparso seduto a una tavola apparecchiata da secoli; alza lo sguardo e chiede perché siano arrivati con undici minuti di ritardo.',
      'L’uscita sotto Valma': 'Le gallerie li conducono sotto una lavanderia di via Orla 18. Quando sollevano la botola, una residente anziana li guarda senza stupore e dice che la sua famiglia aspettava quel ritorno dal 1998.'
    },
    adv02: {
      'La cava come ultima uscita': 'Il treno viene deviato nella cava e i passeggeri saltano prima dell’impatto. Enzo resta l’ultimo sul predellino per sganciare il vagone delle medicine; quando il convoglio si schianta, il carico continua da solo lungo un binario secondario verso San Rivo.',
      'Il piano di Enzo': 'Enzo apre la cabina e confessa di aver avviato il treno. Porta tutti a San Rivo, poi consegna la chiave alla polizia; prima di scendere, un bambino gli chiede se sia un eroe o un criminale e lui risponde: «Oggi tutte e due le cose».'
    },
    adv03: {
      'Evacuare il quartiere': 'I volontari lasciano Casa Orla mentre l’acqua entra dalle finestre. Karim chiude la porta per abitudine, poi ride e getta la chiave nel fiume: per la prima volta capisce che il luogo non vale più delle persone che lo avevano riempito.',
      'Il tetto della scuola': 'L’ultimo bambino sale sulla barca pochi secondi prima che il tetto ceda. Una maestra conta tutti tre volte; soltanto quando arriva sempre allo stesso numero si accorge che tra loro c’è una bambina che nessuno della scuola conosce.'
    },
    com01: {
      'Nessuno scopre l’errore': 'Le due cerimonie riescono grazie a camerieri travestiti, corridoi bloccati e una torta che cambia nome due volte. A fine notte le coppie scoprono l’errore guardando lo stesso video virale e, invece di denunciare la planner, la assumono per organizzare il loro primo anniversario insieme.',
      'Due turni perfetti': 'Il primo matrimonio esce dal retro mentre il secondo entra dal foyer. Sul palco resta però un bambino della prima festa, convinto di essere un invitato della seconda; diventa l’unica persona presente in entrambe le foto ufficiali.'
    },
    com02: {
      'La regola assurda': 'Pietro ordina che ogni riunione della giornata si tenga sui camion fermi dello sciopero, così nessuno può ignorare i netturbini. La delegazione straniera sale per curiosità, Meridiana per necessità e il consiglio per non restare solo: l’accordo nasce sul cassone di un camion dei rifiuti.',
      'Restare sindaco': 'La piazza ottiene elezioni anticipate e Pietro accetta di candidarsi. La mattina seguente torna comunque al deposito, consegna l’ultimo pacco rimasto nel furgone e trova sull’etichetta il proprio nuovo indirizzo: Municipio di Valma.'
    },
    com03: {
      'La grande bugia culturale': 'Comune e guide inventano una teoria sempre più assurda sulla statua capovolta. L’artista arriva, ascolta tutto e dichiara che il vero capolavoro non è la statua, ma la città intera mentre mente con perfetta serietà.',
      'Venderla per qualcosa di utile': 'La statua viene venduta per una cifra enorme e il denaro finanzia il progetto scelto dagli abitanti. Nella piazza resta soltanto il basamento montato al contrario; in pochi mesi diventa più fotografato dell’opera originale.'
    }
  };

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
  if (changed !== 48) console.error(`La Prima Scintilla: attesi 48 finali riscritti, trovati ${changed}.`);
})();
