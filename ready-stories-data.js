'use strict';

(() => {
  const categories = {
    mystery: { label: 'Mistero e scoperta', symbol: '♦', description: 'Indizi, segreti e verità che cambiano il significato di ciò che sembrava normale.' },
    relations: { label: 'Relazioni e conflitti', symbol: '♥', description: 'Promesse, rivalità e legami messi alla prova da una scelta difficile.' },
    urgency: { label: 'Pericolo e urgenza', symbol: '♠', description: 'Situazioni già in movimento, con poco tempo e conseguenze concrete.' },
    strange: { label: 'Strano e imprevedibile', symbol: '♣', description: 'Regole impossibili, eventi assurdi e realtà che smette di comportarsi normalmente.' }
  };

  const stories = [
    {
      id: 'm01', category: 'mystery', title: 'Il registro nell’archivio',
      protagonist: 'Elena, una tirocinante che può entrare nell’archivio soltanto grazie a un collega.',
      situation: 'Durante un’ispezione trova finalmente incustodito il registro che cercava da settimane.',
      objective: 'Fotografare le pagine mancanti e capire chi ha modificato l’inventario.',
      problem: 'Qualcuno ha ordinato di distruggere il registro e il collega che doveva aiutarla non risponde.',
      opening: 'Elena, una tirocinante che può entrare nell’archivio soltanto grazie a un collega, trova finalmente incustodito il registro che cercava da settimane. Deve fotografare le pagine mancanti e uscire prima dell’ispezione, ma qualcuno ha già ordinato di distruggerlo e il collega che doveva aiutarla non risponde. Quando apre il registro, scopre che l’ultima firma appartiene proprio a lui.'
    },
    {
      id: 'm02', category: 'mystery', title: 'La stanza già occupata',
      protagonist: 'Nicolò, receptionist al suo primo turno di notte.',
      situation: 'Consegna per errore la stessa chiave a due ospiti che non risultano essersi mai incontrati.',
      objective: 'Trovare entrambi e capire a chi appartenga davvero la stanza.',
      problem: 'Dentro trova una valigia aperta, nessuno dei due ospiti e una registrazione che il direttore vuole cancellare.',
      opening: 'Al suo primo turno di notte, Nicolò consegna per errore la stessa chiave a due ospiti. Quando raggiunge la stanza trova una valigia aperta e nessuno dei due, mentre il direttore gli ordina di cancellare la registrazione prima dell’arrivo della polizia. Nicolò deve capire chi occupava davvero la camera, ma sul registro uno dei due nomi è stato aggiunto con la sua stessa firma.'
    },
    {
      id: 'm03', category: 'mystery', title: 'L’ultimo treno vuoto',
      protagonist: 'Marta, pendolare che conosce a memoria ogni fermata della linea.',
      situation: 'L’ultimo treno arriva senza passeggeri, ma con tutte le porte aperte e le luci accese.',
      objective: 'Ritrovare suo fratello, che le aveva scritto di essere a bordo.',
      problem: 'Il capotreno nega che il convoglio abbia effettuato servizio e vuole riportarlo subito al deposito.',
      opening: 'Marta aspetta suo fratello sull’ultimo binario, ma il treno arriva completamente vuoto. Il suo telefono è ancora collegato alla rete del convoglio e continua a inviarle messaggi dalla carrozza sei. Il capotreno sostiene che quel treno non abbia trasportato nessuno e vuole riportarlo al deposito. Marta sale prima che le porte si chiudano e trova il posto di suo fratello ancora caldo.'
    },
    {
      id: 'm04', category: 'mystery', title: 'Il quadro sotto il quadro',
      protagonist: 'Samira, restauratrice incaricata di preparare un dipinto per una mostra.',
      situation: 'Durante la pulizia scopre un secondo volto nascosto sotto la figura principale.',
      objective: 'Documentare il ritrovamento e stabilire chi sia la persona cancellata.',
      problem: 'Il proprietario pretende che il restauro prosegua senza registrare la scoperta.',
      opening: 'Mentre pulisce un ritratto destinato a una mostra, Samira scopre sotto la vernice il volto di una seconda persona. Il proprietario le ordina di coprirlo e le ricorda che il museo dipende dalla sua donazione. Samira vuole documentare il ritrovamento, ma la fotografia d’epoca appesa nel laboratorio mostra lo stesso quadro con entrambi i volti e una data successiva alla morte del pittore.'
    },
    {
      id: 'm05', category: 'mystery', title: 'La voce dal piano chiuso',
      protagonist: 'Dario, tecnico addetto agli impianti di un centro commerciale.',
      situation: 'Durante la chiusura sente una richiesta d’aiuto provenire dagli altoparlanti del piano demolito anni prima.',
      objective: 'Individuare l’origine del segnale e verificare che nessuno sia rimasto dentro.',
      problem: 'La sicurezza vuole spegnere l’intero sistema prima dell’arrivo dei proprietari.',
      opening: 'Dario sta controllando gli impianti dopo la chiusura quando dagli altoparlanti arriva una voce che chiede di aprire una porta al quarto piano. Quel piano è stato murato dopo un incendio e non compare più nelle mappe dell’edificio. La sicurezza vuole spegnere tutto e archiviare il fatto come interferenza, ma la voce pronuncia il nome di Dario e descrive l’attrezzo che tiene in mano.'
    },
    {
      id: 'm06', category: 'mystery', title: 'Il pacco senza mittente',
      protagonist: 'Irene, corriere che non ha mai mancato una consegna.',
      situation: 'Nel furgone trova un pacco non registrato indirizzato a lei stessa.',
      objective: 'Capire chi lo abbia caricato e perché debba essere consegnato entro un’ora.',
      problem: 'Il destinatario indicato sul secondo cartellino risulta morto da cinque anni.',
      opening: 'Alla fine del giro Irene trova nel furgone un pacco che non compare nel sistema. È indirizzato a lei, ma sotto l’etichetta ce n’è un’altra con un indirizzo poco distante e il nome di un uomo morto cinque anni prima. Dentro qualcosa continua a vibrare e sul cartone è scritto che la consegna deve avvenire entro un’ora. La centrale sostiene che quel pacco non sia mai entrato nel deposito.'
    },
    {
      id: 'm07', category: 'mystery', title: 'L’invitato che nessuno ricorda',
      protagonist: 'Lea, organizzatrice della festa per il pensionamento di suo padre.',
      situation: 'Un uomo sconosciuto arriva con fotografie private e viene salutato come un vecchio amico.',
      objective: 'Scoprire chi sia senza rovinare la serata o allarmare suo padre.',
      problem: 'Ogni invitato ricorda una storia diversa su di lui e nelle foto Lea compare accanto all’uomo da bambina.',
      opening: 'Durante la festa per il pensionamento di suo padre, Lea nota un uomo che nessuno ha invitato. Porta fotografie di famiglia e tutti sembrano riconoscerlo, ma ciascuno racconta di averlo conosciuto in un periodo diverso. Suo padre impallidisce e gli chiede di andarsene. Prima di uscire, l’uomo lascia a Lea una foto in cui lei, ancora bambina, gli tiene la mano davanti a una casa che non ricorda.'
    },
    {
      id: 'm08', category: 'mystery', title: 'La mappa sotto il pavimento',
      protagonist: 'Tommaso, falegname che sta ristrutturando la vecchia scuola del paese.',
      situation: 'Sollevando una tavola trova una mappa aggiornata di passaggi che non risultano nei progetti.',
      objective: 'Capire dove conduca il percorso segnato e perché termini sotto casa sua.',
      problem: 'Il sindaco vuole chiudere il cantiere appena viene a sapere del ritrovamento.',
      opening: 'Durante i lavori nella vecchia scuola, Tommaso trova sotto il pavimento una mappa disegnata di recente. Segna corridoi sotterranei assenti dai progetti e termina sotto la casa in cui vive con sua madre. Il sindaco ordina di sigillare tutto per motivi di sicurezza, ma una delle gallerie è già aperta e dal buio arriva il suono della campanella scolastica, rimossa dall’edificio molti anni prima.'
    },
    {
      id: 'm09', category: 'mystery', title: 'La telecamera in anticipo',
      protagonist: 'Rachele, guardia notturna in un deposito di opere d’arte.',
      situation: 'Una telecamera mostra eventi che avvengono alcuni minuti dopo.',
      objective: 'Usare le immagini per impedire il furto che vede sul monitor.',
      problem: 'Nelle riprese future è lei ad aprire la porta ai ladri.',
      opening: 'Rachele nota che la telecamera del corridoio est mostra l’orologio avanti di sette minuti. Sul monitor vede due persone entrare nel deposito e se stessa disattivare l’allarme. Ha pochi minuti per capire se le immagini siano una previsione o una registrazione manipolata. Quando prova a chiamare il responsabile, sullo schermo appare il suo telefono già abbandonato a terra davanti alla porta blindata.'
    },
    {
      id: 'm10', category: 'mystery', title: 'Il libro mai prestato',
      protagonist: 'Arianna, bibliotecaria incaricata di chiudere una sede destinata al trasferimento.',
      situation: 'Un uomo restituisce un libro che non compare nel catalogo e porta il timbro della biblioteca.',
      objective: 'Scoprire da quale sezione provenga prima che gli archivi vengano imballati.',
      problem: 'Tra le pagine trova annotazioni scritte da sua madre molti anni dopo la sua scomparsa.',
      opening: 'Poco prima della chiusura, un uomo restituisce ad Arianna un libro che sostiene di aver preso in prestito trent’anni prima. Il volume non esiste nel catalogo, ma porta timbri autentici e il numero di una sala mai costruita. Tra le pagine Arianna trova appunti firmati da sua madre, scomparsa quando lei era bambina, con date recenti. L’uomo se ne va lasciandole una chiave e dicendo che la sala verrà chiusa quella notte.'
    },
    {
      id: 'm11', category: 'mystery', title: 'Il faro spento',
      protagonist: 'Pietro, giovane guardiano arrivato sull’isola per sostituire suo zio.',
      situation: 'La luce del faro smette di funzionare nonostante l’impianto risulti acceso.',
      objective: 'Riattivare il segnale prima che una nave raggiunga gli scogli.',
      problem: 'Nel diario trova istruzioni per non accendere mai il faro durante quella notte.',
      opening: 'Alla sua prima notte sull’isola, Pietro scopre che la lampada del faro è accesa ma dal mare non si vede alcuna luce. Una nave cargo sta entrando nella baia e non risponde alla radio. Nel diario dello zio trova una pagina piegata con un solo ordine: non accendere il faro il primo giorno di luna nuova. Fuori, qualcuno comincia a salire la scala esterna dalla parte del mare.'
    },
    {
      id: 'm12', category: 'mystery', title: 'La fotografia di domani',
      protagonist: 'Giulia, fotografa di cronaca in cerca dello scatto che possa rilanciare la sua carriera.',
      situation: 'Sviluppando un vecchio rullino trova una foto di un incidente che non è ancora avvenuto.',
      objective: 'Identificare il luogo e impedire che qualcuno si faccia male.',
      problem: 'Nella foto compare lei mentre osserva senza intervenire.',
      opening: 'Giulia sviluppa un rullino trovato dentro una macchina fotografica usata. L’ultima immagine mostra un autobus rovesciato davanti a un edificio riconoscibile, con la data del giorno successivo. Tra i soccorritori c’è anche lei, immobile e senza macchina fotografica. Giulia deve capire se la foto sia autentica e come evitare l’incidente, ma il numero dell’autobus corrisponde alla linea che sua sorella prende ogni mattina.'
    },
    {
      id: 'm13', category: 'mystery', title: 'La stanza che non compare',
      protagonist: 'Edoardo, geometra incaricato di misurare una villa prima della vendita.',
      situation: 'Le misure esterne indicano uno spazio vuoto tra due camere, ma non esiste alcun accesso.',
      objective: 'Trovare la stanza nascosta e verificare che la planimetria non sia stata falsificata.',
      problem: 'Il proprietario gli offre denaro per ignorare la differenza e concludere subito il sopralluogo.',
      opening: 'Durante il sopralluogo di una villa, Edoardo scopre che tra due camere dovrebbero esserci quasi quattro metri di spazio. La planimetria è stata modificata e il proprietario gli offre denaro per firmare senza fare domande. Battendo sulla parete, Edoardo sente dall’altra parte un telefono squillare. Quando chiama il proprio numero, lo squillo si interrompe e una voce sussurra il suo nome attraverso il muro.'
    },

    {
      id: 'r01', category: 'relations', title: 'Il posto apparecchiato',
      protagonist: 'Michele, figlio maggiore che ha organizzato la prima cena di famiglia dopo anni.',
      situation: 'A tavola compare un posto per la sorella che nessuno vede da molto tempo.',
      objective: 'Convincere i genitori a parlare finalmente di ciò che è successo.',
      problem: 'La sorella manda un messaggio dicendo di essere davanti alla porta, ma la madre vieta di aprire.',
      opening: 'Michele organizza una cena per riunire la famiglia dopo anni di silenzio. La madre apparecchia anche per sua sorella, poi sostiene di averlo fatto per abitudine. Poco prima di sedersi, Michele riceve un messaggio: sua sorella è davanti alla porta e vuole entrare. Il padre si alza per aprire, ma la madre blocca la serratura e dice che, se quella ragazza entra, lei racconterà a tutti perché se n’è andata davvero.'
    },
    {
      id: 'r02', category: 'relations', title: 'L’ultima volontà a metà',
      protagonist: 'Due cugini cresciuti insieme e diventati rivali dopo la morte del nonno.',
      situation: 'Il testamento divide l’eredità, ma manca la pagina che assegna l’unica cosa desiderata da entrambi.',
      objective: 'Ricostruire l’ultima volontà senza distruggere definitivamente il rapporto.',
      problem: 'Ognuno possiede una registrazione diversa in cui il nonno promette l’oggetto proprio a lui.',
      opening: 'Durante la lettura del testamento, Silvia e Marco scoprono che manca la pagina relativa alla vecchia officina del nonno. Entrambi vogliono salvarla, ma per ragioni opposte: lei vuole riaprirla, lui deve venderla per pagare un debito. Ognuno mostra una registrazione in cui il nonno gli promette l’edificio. Le due voci sembrano autentiche, ma in sottofondo si sente la stessa conversazione avvenuta in giorni diversi.'
    },
    {
      id: 'r03', category: 'relations', title: 'Il messaggio prima del sì',
      protagonist: 'Sara, testimone di nozze e migliore amica della sposa.',
      situation: 'Pochi minuti prima della cerimonia riceve un messaggio che potrebbe cambiare il matrimonio.',
      objective: 'Capire se dire tutto alla sposa o proteggere una promessa fatta anni prima.',
      problem: 'Il messaggio proviene dallo sposo, che le chiede di mentire ancora una volta.',
      opening: 'Mentre aiuta la sua migliore amica a prepararsi, Sara riceve un messaggio dallo sposo: le chiede di cancellare una vecchia fotografia e di non raccontare ciò che accadde durante un viaggio che fecero insieme. La sposa nota il suo nervosismo e le affida il telefono per rispondere a una chiamata. Sara deve decidere se fermare la cerimonia, ma sa che la verità coinvolgerebbe anche lei.'
    },
    {
      id: 'r04', category: 'relations', title: 'Una canzone mai finita',
      protagonist: 'Luca, ex cantante di una band sciolta dopo un litigio mai chiarito.',
      situation: 'Il gruppo viene invitato a esibirsi insieme per salvare il locale in cui aveva iniziato.',
      objective: 'Finire la canzone lasciata incompleta e convincere gli altri a salire sul palco.',
      problem: 'Il vecchio chitarrista sostiene che il brano gli sia stato rubato e vuole suonarlo da solo.',
      opening: 'Il locale dove Luca e i suoi amici formarono la band sta per chiudere. Il proprietario propone un ultimo concerto, ma nessuno dei musicisti si parla da anni. Luca trova una registrazione della canzone incompleta che causò la rottura del gruppo. Quando la fa ascoltare agli altri, il chitarrista riconosce una strofa che dice di aver scritto lui e minaccia di esibirsi da solo se Luca non ammette pubblicamente di avergliela rubata.'
    },
    {
      id: 'r05', category: 'relations', title: 'Il colloquio degli amici',
      protagonist: 'Due amici che hanno preparato insieme lo stesso concorso per mesi.',
      situation: 'Arrivano al colloquio finale e scoprono che il posto disponibile è uno solo.',
      objective: 'Ottenere il lavoro senza tradire l’accordo di aiutarsi fino alla fine.',
      problem: 'Uno dei due riceve per errore le domande del colloquio e deve decidere se condividerle.',
      opening: 'Davide e Karim hanno studiato insieme per mesi promettendo che, qualunque cosa accada, nessuno ostacolerà l’altro. Poco prima del colloquio finale, Davide riceve una mail interna con le domande e la valutazione negativa già preparata per Karim. Può avvertirlo e rischiare l’esclusione di entrambi, oppure tacere e ottenere probabilmente l’unico posto. Karim entra nella stanza convinto che l’amico sappia qualcosa che lui non sa.'
    },
    {
      id: 'r06', category: 'relations', title: 'Il laboratorio di famiglia',
      protagonist: 'Marta, giovane chimica tornata a lavorare nel laboratorio fondato da suo padre.',
      situation: 'Un investimento potrebbe salvare l’attività, ma richiede di licenziare metà del personale.',
      objective: 'Trovare un accordo che mantenga aperto il laboratorio senza sacrificare chi vi lavora.',
      problem: 'Il padre ha già firmato un documento usando il nome di Marta come responsabile.',
      opening: 'Marta torna nel laboratorio di famiglia pensando di aiutare per qualche settimana. Scopre che suo padre ha accettato un investimento che salverà l’azienda soltanto licenziando metà dei dipendenti storici. Il contratto porta anche la sua firma digitale, inserita senza consenso. Marta deve fermare l’accordo o renderlo sostenibile, mentre il padre le confessa di averlo fatto perché nessun altro della famiglia voleva assumersi la responsabilità.'
    },
    {
      id: 'r07', category: 'relations', title: 'Il voto del condominio',
      protagonist: 'Anna, nuova amministratrice di un palazzo diviso da vecchi rancori.',
      situation: 'Un unico voto deciderà se vendere il cortile comune a un costruttore.',
      objective: 'Evitare che la riunione degeneri e trovare una soluzione accettabile per tutti.',
      problem: 'La persona che possiede il voto decisivo è scomparsa lasciando due deleghe contraddittorie.',
      opening: 'Alla sua prima assemblea, Anna deve gestire il voto sulla vendita del cortile. Metà dei residenti ha bisogno del denaro, l’altra metà vuole conservarlo. Il proprietario decisivo non si presenta, ma lascia una delega a favore della vendita e un’altra contro, entrambe firmate. Mentre tutti si accusano, Anna riceve un messaggio vocale dell’assente: dice di essere chiuso in uno degli appartamenti e di non fidarsi di nessuno dei vicini.'
    },
    {
      id: 'r08', category: 'relations', title: 'Il negozio delle sorelle',
      protagonist: 'Due sorelle che hanno ereditato il piccolo negozio della madre.',
      situation: 'Una vuole venderlo, l’altra vuole riaprirlo il giorno dell’anniversario.',
      objective: 'Decidere il futuro del negozio senza spezzare il loro rapporto.',
      problem: 'Tra i conti emerge un debito firmato da una delle due e mai confessato all’altra.',
      opening: 'Nel giorno in cui dovrebbero firmare la vendita del negozio di famiglia, Elisa trova una scatola con le insegne restaurate e scopre che sua sorella Nadia ha già annunciato la riapertura. Nadia, però, trova tra i documenti un debito contratto da Elisa usando il negozio come garanzia. Hanno poche ore per scegliere se vendere, riaprire o affrontare il creditore, mentre ciascuna è convinta che l’altra abbia tradito il progetto della madre.'
    },
    {
      id: 'r09', category: 'relations', title: 'La gara che non può correre',
      protagonist: 'Andrea, giovane atleta che deve la propria carriera al suo allenatore.',
      situation: 'Poco prima della finale scopre un infortunio che potrebbe diventare permanente.',
      objective: 'Proteggere il futuro senza abbandonare la squadra nel momento decisivo.',
      problem: 'L’allenatore nasconde il referto e gli chiede di gareggiare un’ultima volta.',
      opening: 'Andrea arriva alla finale convinto di poter correre nonostante il dolore. Una fisioterapista gli mostra il referto che l’allenatore gli aveva nascosto: un’altra gara potrebbe compromettere definitivamente la gamba. La squadra dipende dal suo risultato e l’allenatore, che lo ha cresciuto come un figlio, gli chiede di fidarsi ancora una volta. Andrea deve decidere che cosa deve al gruppo e che cosa deve a se stesso.'
    },
    {
      id: 'r10', category: 'relations', title: 'La lettera tradotta male',
      protagonist: 'Mina, interprete chiamata a mediare tra due famiglie che non parlano la stessa lingua.',
      situation: 'Una vecchia lettera dovrebbe chiarire una disputa, ma contiene una frase ambigua.',
      objective: 'Restituire il significato corretto senza favorire nessuna delle due parti.',
      problem: 'Sua nonna aveva tradotto la stessa frase anni prima in modo opposto.',
      opening: 'Mina viene chiamata a tradurre una lettera che potrebbe chiudere una disputa tra due famiglie. Una frase decisiva può significare sia “la casa appartiene a chi ritorna” sia “la casa appartiene a chi resta”. Tra i documenti trova la traduzione fatta anni prima da sua nonna, che scelse una versione e cambiò la vita di entrambe le famiglie. Ora tutti aspettano che Mina confermi quella scelta, ma lei non è certa che fosse corretta.'
    },
    {
      id: 'r11', category: 'relations', title: 'Il viaggio senza invito',
      protagonist: 'Un gruppo di amici in partenza per il viaggio organizzato da mesi.',
      situation: 'Alla stazione si presenta una persona che il gruppo aveva deciso di escludere.',
      objective: 'Partire senza trasformare il viaggio in una resa dei conti.',
      problem: 'La prenotazione principale è a nome della persona esclusa e nessun altro può usarla senza di lei.',
      opening: 'Cinque amici stanno per partire quando arriva Laura, l’unica persona che avevano deciso di non invitare dopo un litigio. Mostra la conferma dell’hotel: la prenotazione e il pagamento sono ancora a suo nome. Senza di lei perderanno quasi tutto il viaggio. Laura dice che partirà soltanto se ognuno ammetterà perché l’ha esclusa, ma nel gruppo nessuno racconta la stessa versione di quella notte.'
    },
    {
      id: 'r12', category: 'relations', title: 'Il progetto rubato',
      protagonist: 'Chiara, giovane designer che ha lavorato in segreto con il suo collega più fidato.',
      situation: 'Durante la presentazione scopre che il collega ha registrato il progetto soltanto a proprio nome.',
      objective: 'Dimostrare il proprio contributo senza distruggere il lavoro costruito insieme.',
      problem: 'L’unica prova è una conversazione che rivelerebbe anche una scorrettezza commessa da Chiara.',
      opening: 'Chiara entra nella sala della presentazione e vede il progetto sviluppato con Matteo attribuito soltanto a lui. Matteo sostiene di averlo fatto per evitare che l’azienda lo rifiutasse, promettendo di sistemare tutto dopo il contratto. Chiara può dimostrare il proprio contributo mostrando una chat privata, ma quei messaggi rivelano che ha usato dati riservati di un cliente. Deve scegliere se proteggere il progetto, la propria carriera o la fiducia che aveva nel collega.'
    },
    {
      id: 'r13', category: 'relations', title: 'Il cane tra due case',
      protagonist: 'Una coppia separata che condivide ancora la cura del cane adottato insieme.',
      situation: 'L’animale scompare proprio nel giorno in cui uno dei due deve trasferirsi lontano.',
      objective: 'Ritrovarlo prima della partenza e decidere con chi debba vivere.',
      problem: 'Le tracce portano alla casa che avevano progettato di comprare prima della separazione.',
      opening: 'Nel giorno in cui Paolo deve trasferirsi in un’altra città, il cane che divide con Marta scompare. Seguendo il localizzatore, i due arrivano davanti alla casa che volevano comprare quando stavano ancora insieme. La porta è aperta e dentro trovano le vecchie fotografie che avevano buttato, disposte sul pavimento. Il cane non c’è, ma dal piano superiore arriva il suono del suo collare.'
    },

    {
      id: 'u01', category: 'urgency', title: 'La macchina che non deve fermarsi',
      protagonist: 'Riccardo, tecnico responsabile della linea principale di una fabbrica appena riaperta.',
      situation: 'La macchina comincia a cedere durante la visita dei nuovi investitori.',
      objective: 'Evitare feriti e salvare la riapertura dello stabilimento.',
      problem: 'Fermare l’impianto annullerebbe il contratto che tiene in vita l’intera fabbrica.',
      opening: 'Riccardo scopre che la macchina principale sta per cedere proprio quando la direzione annuncia la riapertura dello stabilimento. Può fermarla e mettere al sicuro gli operai, ma il blocco farebbe perdere il contratto che tiene in vita l’intera fabbrica. Il direttore gli ordina di attendere la fine della visita, mentre un sensore mostra che qualcuno ha già disattivato il sistema automatico di emergenza.'
    },
    {
      id: 'u02', category: 'urgency', title: 'L’acqua dietro la diga',
      protagonist: 'Valentina, ingegnera rientrata nel paese dove suo padre progettò la diga.',
      situation: 'Dopo giorni di pioggia trova una crepa che non compare nei rapporti ufficiali.',
      objective: 'Far evacuare la valle o stabilizzare la struttura prima che il livello salga ancora.',
      problem: 'L’unica strada di fuga attraversa proprio la zona che rischia di essere travolta.',
      opening: 'Valentina ispeziona la diga costruita da suo padre e trova una crepa nascosta dietro pannelli appena installati. Il livello dell’acqua continua a salire e il sindaco rifiuta di evacuare il paese durante la festa annuale senza una prova definitiva. L’unica strada verso l’esterno passa sotto il versante più instabile. Valentina deve scegliere quando dare l’allarme, mentre qualcuno cancella in tempo reale i dati dai sensori.'
    },
    {
      id: 'u03', category: 'urgency', title: 'Il reparto senza corrente',
      protagonist: 'Omar, infermiere rimasto responsabile del reparto durante il turno notturno.',
      situation: 'Un blackout isola l’ospedale e il generatore alimenta soltanto metà delle stanze.',
      objective: 'Trasferire i pazienti più fragili e ripristinare l’energia.',
      problem: 'Le porte di sicurezza si bloccano e un paziente appena operato scompare dal letto.',
      opening: 'Un blackout spegne l’ospedale mentre Omar è l’unico infermiere esperto nel reparto. Il generatore mantiene attive soltanto alcune apparecchiature e le porte antincendio non si aprono. Durante il trasferimento dei pazienti, Omar scopre che un uomo appena operato non è più nel suo letto e che il suo monitor continua a trasmettere battiti da una stanza chiusa. Il tecnico avverte che il generatore reggerà meno di venti minuti.'
    },
    {
      id: 'u04', category: 'urgency', title: 'L’autobus sul passo',
      protagonist: 'Mauro, autista sostituto su una linea di montagna che non conosce bene.',
      situation: 'Una frana chiude la strada davanti e il ghiaccio impedisce di tornare indietro.',
      objective: 'Portare i passeggeri in un luogo sicuro prima che inizi la tormenta.',
      problem: 'Una passeggera sostiene che esista una strada secondaria, ma nessun altro ricorda quella deviazione.',
      opening: 'Mauro ferma l’autobus davanti a una frana mentre il ghiaccio rende impossibile tornare indietro. La radio non prende e la tormenta arriverà entro un’ora. Una passeggera anziana indica una strada forestale che, secondo lei, conduce a un rifugio, ma non appare sulla mappa e gli altri abitanti negano che sia mai esistita. Nel frattempo un ragazzo sul mezzo comincia a mostrare i sintomi di una grave reazione allergica.'
    },
    {
      id: 'u05', category: 'urgency', title: 'Il tunnel che si riempie',
      protagonist: 'Beatrice, geologa in visita al cantiere della nuova metropolitana.',
      situation: 'Una parete cede e l’acqua comincia a entrare nel tunnel.',
      objective: 'Raggiungere la squadra rimasta oltre il crollo e trovare un’uscita alternativa.',
      problem: 'Il progetto segnala una vecchia galleria, ma aprirla potrebbe allagare un quartiere soprastante.',
      opening: 'Durante un sopralluogo, Beatrice sente cedere la parete del tunnel e vede l’acqua invadere il cantiere. Cinque operai restano bloccati oltre il crollo. Una vecchia galleria potrebbe permettere di raggiungerli, ma i calcoli indicano che aprirla devierebbe l’acqua sotto le fondamenta delle case vicine. Il capocantiere vuole sigillare il tratto e aspettare i soccorsi, mentre i colpi degli operai diventano sempre più deboli.'
    },
    {
      id: 'u06', category: 'urgency', title: 'Il concerto evacuato',
      protagonist: 'Noemi, responsabile della sicurezza al suo primo grande evento.',
      situation: 'Pochi minuti prima dell’apertura riceve due allarmi opposti su aree diverse del palazzetto.',
      objective: 'Proteggere il pubblico senza provocare panico o bloccare tutte le uscite.',
      problem: 'Una delle segnalazioni proviene dal badge del collega che non riesce più a contattare.',
      opening: 'Mentre migliaia di persone aspettano fuori dal palazzetto, Noemi riceve un allarme incendio nel settore nord e una segnalazione di oggetto sospetto presso l’uscita sud. Evacuare da una parte potrebbe spingere la folla verso l’altro pericolo. Il suo collega, incaricato di verificare, non risponde e il suo badge continua a muoversi tra zone vietate. L’organizzatore le dà cinque minuti per decidere se aprire i cancelli o annullare tutto.'
    },
    {
      id: 'u07', category: 'urgency', title: 'Il container che perde',
      protagonist: 'Lorenzo, addetto portuale vicino alla fine del turno.',
      situation: 'Da un container non registrato fuoriesce una sostanza sconosciuta.',
      objective: 'Isolare l’area e identificare il contenuto prima che venga caricato sulla nave.',
      problem: 'Il container porta il codice di una spedizione già partita e qualcuno sta modificando i registri.',
      opening: 'Lorenzo nota un liquido scuro uscire da un container che non compare nel piano di carico. Il codice appartiene a una spedizione partita il giorno prima e il sistema cambia i dati ogni volta che prova ad aprire la scheda. La nave salperà tra quaranta minuti e il responsabile gli ordina di spostare il container senza creare ritardi. Quando Lorenzo avvicina il lettore, il dispositivo segnala materiale biologico e il lucchetto si apre da solo.'
    },
    {
      id: 'u08', category: 'urgency', title: 'Il rifugio nella tormenta',
      protagonist: 'Francesca, volontaria che gestisce un rifugio alpino durante il fine settimana.',
      situation: 'Una tormenta anticipata blocca il gruppo e un bambino non rientra dall’esterno.',
      objective: 'Trovarlo prima che la visibilità scompaia del tutto.',
      problem: 'Le sue impronte si dividono in due direzioni e una conduce verso un pendio instabile.',
      opening: 'La tormenta arriva prima del previsto e Francesca chiude il rifugio con dodici persone dentro. Al conteggio manca un bambino che era uscito pochi minuti prima. Le impronte fuori si dividono: una pista sale verso il bosco, l’altra porta al pendio già segnalato per rischio valanghe. Il padre vuole seguirne una, la guida l’altra. Francesca deve decidere come dividere le poche persone attrezzate prima che il vento cancelli entrambe le tracce.'
    },
    {
      id: 'u09', category: 'urgency', title: 'Il centro dati bollente',
      protagonist: 'Davide, tecnico reperibile durante la notte più calda dell’anno.',
      situation: 'Il sistema di raffreddamento del centro dati smette di funzionare.',
      objective: 'Salvare i server essenziali e impedire un incendio.',
      problem: 'Spegnere le macchine interromperebbe i servizi di emergenza di tutta la città.',
      opening: 'Davide arriva nel centro dati e trova la temperatura già oltre il limite. Il raffreddamento è stato disattivato manualmente e i server gestiscono anche comunicazioni sanitarie e semafori. Può spegnerli per evitare l’incendio, ma bloccherebbe servizi essenziali durante la notte. Mentre cerca l’accesso tecnico, riceve una chiamata da un numero interno: qualcuno chiuso nella sala server gli dice di non aprire la porta.'
    },
    {
      id: 'u10', category: 'urgency', title: 'La pista occupata',
      protagonist: 'Elisa, addetta di torre durante il suo ultimo turno prima del trasferimento.',
      situation: 'Un piccolo aereo chiede un atterraggio d’emergenza mentre un veicolo resta fermo sulla pista.',
      objective: 'Liberare la pista o trovare un’alternativa prima che il carburante finisca.',
      problem: 'Il veicolo non risponde e il pilota dell’aereo rifiuta di dichiarare chi trasporta.',
      opening: 'Elisa riceve la richiesta di atterraggio urgente da un piccolo aereo con carburante quasi esaurito. Sulla pista principale, però, un mezzo di manutenzione è fermo senza luci e nessuno risponde alla radio. L’aeroporto vicino è chiuso per nebbia. Il pilota insiste per atterrare ma evita ogni domanda sui passeggeri, mentre dal veicolo arriva un segnale automatico che indica la presenza di qualcuno a bordo.'
    },
    {
      id: 'u11', category: 'urgency', title: 'Il raccolto contaminato',
      protagonist: 'Federico, giovane agronomo che lavora nella cooperativa del paese.',
      situation: 'Alla vigilia della raccolta scopre una contaminazione nei campi principali.',
      objective: 'Fermare la distribuzione e individuare l’origine prima che il prodotto venga spedito.',
      problem: 'Bloccare tutto manderebbe in fallimento decine di famiglie e il presidente vuole nascondere i risultati.',
      opening: 'Federico riceve analisi che mostrano una contaminazione nei campi destinati alla spedizione del mattino. Il presidente della cooperativa gli ordina di ripetere i test dopo la partenza dei camion, perché un blocco immediato farebbe perdere l’intera stagione. Federico deve proteggere chi mangerà quei prodotti senza condannare il paese, mentre scopre che il campione contaminato proviene dal terreno della sua stessa famiglia.'
    },
    {
      id: 'u12', category: 'urgency', title: 'Il ponte durante la festa',
      protagonist: 'Giada, ingegnera comunale responsabile della sicurezza della festa cittadina.',
      situation: 'Durante la processione nota vibrazioni anomale sul vecchio ponte pedonale.',
      objective: 'Svuotarlo senza creare una corsa pericolosa tra la folla.',
      problem: 'Il ponte è l’unica via aperta e sotto passa il corteo con centinaia di persone.',
      opening: 'Giada sente il ponte vibrare in modo irregolare mentre centinaia di persone lo attraversano per la festa. I sensori non trasmettono più e l’unica uscita alternativa è bloccata dai carri del corteo. Fermare la folla sul ponte potrebbe aumentare il carico, ma lasciarla avanzare significa ignorare una possibile frattura. Quando cerca il responsabile, scopre che qualcuno ha rimosso da poche ore i limiti di accesso dal sistema.'
    },
    {
      id: 'u13', category: 'urgency', title: 'Il sipario che sta cedendo',
      protagonist: 'Alessio, macchinista teatrale chiamato a sostituire il responsabile durante la prima.',
      situation: 'Poco prima della scena principale il sistema che sostiene le scenografie comincia a cedere.',
      objective: 'Proteggere attori e pubblico senza provocare il panico.',
      problem: 'La protagonista è già sotto la struttura e il regista rifiuta di interrompere lo spettacolo.',
      opening: 'Durante la prima, Alessio sente uno dei cavi principali spezzarsi sopra il palco. La scenografia più pesante resta sospesa proprio sulla protagonista, che non può vedere il pericolo. Il regista gli ordina di aspettare la fine della scena per non scatenare il panico. Alessio può abbassare il sipario d’emergenza, ma il comando bloccherebbe anche le uscite laterali e nessuno sa dove sia finito il responsabile tecnico.'
    },

    {
      id: 's01', category: 'strange', title: 'L’ora ferma per uno solo',
      protagonist: 'Matteo, impiegato che arriva sempre in ritardo e controlla continuamente l’orologio.',
      situation: 'A mezzogiorno tutti gli orologi intorno a lui si fermano, ma il resto della città continua a muoversi.',
      objective: 'Capire perché soltanto alcune persone sembrino accorgersi del tempo mancante.',
      problem: 'Ogni volta che prova ad allontanarsi, torna nello stesso luogo un minuto prima.',
      opening: 'A mezzogiorno tutti gli orologi intorno a Matteo si fermano. Le persone continuano a camminare, ma ripetono gli stessi gesti e soltanto una donna dall’altra parte della strada sembra accorgersene. Matteo prova a raggiungerla, ma ogni percorso lo riporta davanti allo stesso bar un minuto prima. Sul suo telefono compare un conto alla rovescia e un messaggio: per far ripartire il tempo deve convincere qualcuno a rinunciare a un ricordo.'
    },
    {
      id: 's02', category: 'strange', title: 'Il paese senza ombre',
      protagonist: 'Lidia, illustratrice arrivata in un paese per dipingere un murale.',
      situation: 'Al tramonto si accorge che nessun abitante proietta un’ombra.',
      objective: 'Capire perché soltanto la sua ombra esista ancora e perché tutti la evitino.',
      problem: 'Durante la notte la sua ombra si stacca dal muro e comincia a seguire qualcun altro.',
      opening: 'Lidia arriva nel paese per dipingere un murale e nota che gli abitanti evitano il sole. Al tramonto capisce il motivo: nessuno di loro proietta un’ombra, mentre la sua è lunga e perfettamente visibile. Il sindaco le offre denaro per partire prima di notte. Quando Lidia rientra nella stanza, la sua ombra resta nel corridoio, si stacca dalla parete e segue una bambina che sembra aspettarla.'
    },
    {
      id: 's03', category: 'strange', title: 'L’ascensore del piano sbagliato',
      protagonist: 'Claudio, fattorino che deve consegnare una busta al dodicesimo piano.',
      situation: 'L’ascensore apre su piani che non appartengono all’edificio.',
      objective: 'Raggiungere il destinatario e tornare all’ingresso.',
      problem: 'A ogni apertura una persona diversa sostiene che la busta appartenga a lei.',
      opening: 'Claudio entra nell’ascensore per una consegna al dodicesimo piano, ma le porte si aprono su una spiaggia deserta. Al piano successivo trova una cucina piena di persone che conoscono il suo nome; poi un corridoio identico a quello di casa sua. A ogni fermata qualcuno reclama la busta e gli offre una ragione convincente per consegnarla. Il pulsante del piano terra è scomparso e sulla busta compare lentamente il suo indirizzo.'
    },
    {
      id: 's04', category: 'strange', title: 'La radio di domani',
      protagonist: 'Caterina, conduttrice di una piccola radio locale durante il turno notturno.',
      situation: 'La frequenza riceve il programma che lei dovrebbe trasmettere il giorno successivo.',
      objective: 'Capire se gli annunci possano evitare gli eventi descritti.',
      problem: 'La voce futura le ordina di non rispondere alla prossima telefonata in diretta.',
      opening: 'Durante il turno di notte, Caterina sente sulla frequenza la propria voce presentare il programma del giorno successivo. La trasmissione anticipa piccoli eventi che cominciano ad avverarsi pochi minuti dopo. Poi la voce futura annuncia un grave incidente e le dice di non rispondere alla prossima telefonata. Il telefono dello studio squilla e sul display compare il numero di Caterina stessa.'
    },
    {
      id: 's05', category: 'strange', title: 'L’oggetto che torna',
      protagonist: 'Marta, antiquaria che vuole liberarsi di un piccolo carillon trovato in una casa svuotata.',
      situation: 'Ogni volta che lo vende o lo getta, il carillon ricompare nella sua borsa.',
      objective: 'Scoprire a chi appartenesse e come interrompere il ritorno.',
      problem: 'La melodia cambia ogni notte e comincia a riprodurre conversazioni private.',
      opening: 'Marta vende un vecchio carillon, ma poche ore dopo lo ritrova nella propria borsa. Lo chiude in cassaforte, lo lascia in strada e lo consegna alla polizia: torna sempre. La terza notte la melodia si interrompe e il carillon ripete una discussione avvenuta nella casa dove fu trovato. Tra le voci, Marta riconosce la propria, anche se non era mai stata lì prima dello sgombero.'
    },
    {
      id: 's06', category: 'strange', title: 'Il sogno condiviso',
      protagonist: 'Quattro sconosciuti che si incontrano per caso nella stessa sala d’attesa.',
      situation: 'Scoprono di aver sognato tutti la stessa casa e la stessa porta chiusa.',
      objective: 'Capire quale legame li unisca prima che il sogno ricominci da svegli.',
      problem: 'Uno di loro possiede la chiave vista nel sogno ma nega di averla mai trovata.',
      opening: 'Durante un ritardo, quattro sconosciuti cominciano a parlare e scoprono di aver sognato la stessa casa. Ognuno ricorda una stanza diversa, ma tutti evitavano una porta rossa al piano superiore. Quando le luci della sala d’attesa si spengono, il corridoio davanti a loro diventa identico a quello del sogno. Uno dei quattro trova in tasca la chiave della porta e insiste per non usarla.'
    },
    {
      id: 's07', category: 'strange', title: 'Le chiavi portate dal cane',
      protagonist: 'Sofia, volontaria di un canile che sta per affidare un cane trovato senza microchip.',
      situation: 'Ogni mattina l’animale torna con una chiave diversa appesa al collare.',
      objective: 'Scoprire da dove vengano le chiavi e se qualcuno stia cercando il cane.',
      problem: 'Una delle chiavi apre la porta di casa di Sofia, anche se lei non l’ha mai vista.',
      opening: 'Da tre giorni il cane che Sofia sta per affidare scompare durante la notte e torna con una chiave appesa al collare. Le prime non aprono nulla di conosciuto. La quarta apre la porta di casa di Sofia, ma è nuova e non appartiene a nessuno della famiglia. Quella sera il cane rifiuta di entrare, guarda verso il piano superiore e comincia ad abbaiare a una stanza che Sofia ha sempre tenuto chiusa.'
    },
    {
      id: 's08', category: 'strange', title: 'La pioggia dentro casa',
      protagonist: 'Davide, padre che sta preparando la casa per il ritorno della figlia.',
      situation: 'Comincia a piovere soltanto dentro una stanza, nonostante il soffitto sia asciutto.',
      objective: 'Fermare l’acqua e capire perché cada sempre sugli oggetti della figlia.',
      problem: 'Ogni oggetto bagnato mostra un ricordo diverso da quello che Davide conserva.',
      opening: 'Mentre prepara la stanza per il ritorno della figlia, Davide sente piovere dentro casa. L’acqua cade dal vuoto e bagna soltanto i suoi vecchi oggetti. Quando tocca una fotografia bagnata, vede una scena che ricorda in modo completamente diverso. La pioggia aumenta e si sposta verso una scatola che la figlia gli aveva proibito di aprire. Fuori il cielo è sereno e nessun vicino sente il rumore.'
    },
    {
      id: 's09', category: 'strange', title: 'La statua che cambia posto',
      protagonist: 'Nadia, custode del museo civico durante una mostra temporanea.',
      situation: 'Ogni volta che le luci si spengono, una piccola statua appare in una sala diversa.',
      objective: 'Fermarne gli spostamenti prima dell’apertura al pubblico.',
      problem: 'La statua si avvicina progressivamente a un visitatore ritratto nelle fotografie di sicurezza.',
      opening: 'Durante la notte Nadia trova una piccola statua nella sala sbagliata. Controlla le telecamere, ma nei secondi di blackout l’oggetto scompare da un’inquadratura e appare in un’altra. A ogni spostamento si avvicina alla fotografia di un uomo che ha visitato il museo quel pomeriggio. Nadia deve capire chi sia prima dell’apertura, ma l’ultima immagine mostra la statua già dietro di lei.'
    },
    {
      id: 's10', category: 'strange', title: 'Il telefono delle due scelte',
      protagonist: 'Gabriele, studente indeciso se lasciare la città per un’occasione importante.',
      situation: 'Il telefono comincia a mostrargli due conseguenze future per ogni decisione.',
      objective: 'Usare le previsioni per scegliere senza danneggiare le persone vicine.',
      problem: 'Le due alternative diventano sempre peggiori e il telefono non permette più di non scegliere.',
      opening: 'Gabriele riceve una notifica con due pulsanti: partire o restare. Toccandoli senza confermare vede brevi scene di entrambe le vite possibili. All’inizio usa il telefono per piccole decisioni, ma presto ogni scelta produce conseguenze sempre più gravi per qualcuno che ama. Quando prova a spegnerlo, appare un nuovo conto alla rovescia: deve scegliere quale dei suoi due migliori amici incontrerà quella sera.'
    },
    {
      id: 's11', category: 'strange', title: 'Il negozio dei ricordi',
      protagonist: 'Miriam, donna che cerca un regalo per il compleanno della madre.',
      situation: 'Entra in un negozio dove gli oggetti contengono ricordi appartenuti ad altre persone.',
      objective: 'Trovare un ricordo capace di restituire alla madre qualcosa che ha dimenticato.',
      problem: 'Il negoziante accetta come pagamento soltanto un ricordo di Miriam dello stesso valore.',
      opening: 'Miriam entra in un piccolo negozio che non aveva mai visto e trova scaffali pieni di ricordi conservati in oggetti comuni. Vorrebbe comprarne uno per la madre, che non riconosce più la propria famiglia. Il negoziante le mostra un ricordo perfetto, ma chiede in cambio il momento più felice che Miriam ha vissuto con lei. Prima che possa rifiutare, la porta del negozio scompare e la madre la chiama da una stanza sul retro.'
    },
    {
      id: 's12', category: 'strange', title: 'Lo specchio dell’assente',
      protagonist: 'Alberto, uomo che sta svuotando l’appartamento del fratello scomparso.',
      situation: 'In uno specchio vede il fratello muoversi nella stanza alle sue spalle.',
      objective: 'Comunicare con lui e capire dove si trovi davvero.',
      problem: 'Ogni volta che Alberto si gira, un oggetto della stanza cambia o scompare.',
      opening: 'Mentre svuota l’appartamento del fratello scomparso, Alberto lo vede riflesso nello specchio dietro di sé. Il fratello indica una cassettiera e sembra chiedergli di non aprirla. Quando Alberto si gira, la stanza è vuota ma un mobile è cambiato di posto. A ogni nuovo riflesso scompare qualcosa, finché nello specchio Alberto vede se stesso uscire dalla porta mentre il fratello resta al suo posto.'
    },
    {
      id: 's13', category: 'strange', title: 'La strada che cambia ogni notte',
      protagonist: 'Elena, tassista che percorre da anni gli stessi quartieri.',
      situation: 'Una notte una strada conduce in luoghi diversi ogni volta che la attraversa.',
      objective: 'Riportare a casa l’unico passeggero che sostiene di conoscere la regola della strada.',
      problem: 'Ogni deviazione cancella un luogo reale dalla mappa della città.',
      opening: 'Durante il turno notturno Elena imbocca una strada conosciuta e si ritrova davanti a un quartiere che non esiste. Il passeggero non sembra sorpreso e le dice di continuare senza mai tornare indietro. A ogni incrocio la città cambia e una via familiare scompare dal navigatore. Elena vuole riportarlo a casa e uscire dal percorso, ma il passeggero rivela che la prossima strada cancellata sarà quella in cui vive lei.'
    }
  ];

  const categoryCounts = stories.reduce((counts, story) => {
    counts[story.category] = (counts[story.category] || 0) + 1;
    return counts;
  }, {});

  if (stories.length !== 52 || Object.keys(categories).some(key => categoryCounts[key] !== 13)) {
    console.error('Archivio storie non valido: servono 52 storie, 13 per raccolta.');
  }

  window.STORIA52_READY_CATEGORIES = categories;
  window.STORIA52_READY_STORIES = stories;
})();
