'use strict';

(() => {
  const S = window.S52;
  const CREATOR_PHOTO = window.S52_CREATOR_PHOTO || 'storia52-cards-logo.svg';

  const tutorialSteps = [
    {
      badge: 'Turno 1',
      card: '♥ 6',
      player: 'Marta',
      title: 'Un legame salva la scena',
      text: 'Marta gioca Cuori pari: la guardia riconosce il protagonista e lo lascia passare.',
      story: 'Il protagonista entra nell\'archivio grazie a una vecchia conoscenza.'
    },
    {
      badge: 'Turno 2',
      card: '♠ 9',
      player: 'Luca',
      title: 'Arriva una conseguenza',
      text: 'Luca gioca Picche: la porta si chiude alle sue spalle e l\'allarme inizia a lampeggiare.',
      story: 'La scena non cancella la precedente: la complica.'
    },
    {
      badge: 'Turno 3',
      card: '♦ Q',
      player: 'Sara',
      title: 'La scoperta cambia tutto',
      text: 'Sara gioca una Regina di Quadri: trova una donna che conosce il codice, ma vuole qualcosa in cambio.',
      story: 'Ogni carta aggiunge un pezzo e la storia prende una direzione.'
    },
    {
      badge: 'Finale',
      card: '🎯',
      player: 'Rivelazione',
      title: 'Obiettivi segreti',
      text: 'Marta voleva salvare la guardia. Luca voleva bloccare la fuga. Sara voleva far comparire un alleato ambiguo.',
      story: 'Alla fine si scopre chi ha guidato meglio la storia verso il proprio obiettivo.'
    }
  ];

  const stepMarkup = index => {
    const step = tutorialSteps[index];
    const progress = tutorialSteps.map((_, i) => `<span class="${i === index ? 'active' : ''}"></span>`).join('');
    return `<div class="tutorial-stage is-step-${index}">
      <div class="tutorial-card" aria-hidden="true"><span>${S.esc(step.card)}</span></div>
      <div class="tutorial-copy">
        <p class="eyebrow">${S.esc(step.badge)} · ${S.esc(step.player)}</p>
        <h3>${S.esc(step.title)}</h3>
        <p>${S.esc(step.text)}</p>
        <div class="tutorial-story">${S.esc(step.story)}</div>
      </div>
      <div class="tutorial-progress">${progress}</div>
    </div>`;
  };

  const homeRules = () => S.rulesMarkup ? S.rulesMarkup() : '';

  S.homeMarkup = () => {
    const saved = S.load();
    return `<section class="surface hero product-hero">
      <div class="hero-copy">
        <p class="eyebrow">GIOCO NARRATIVO · CARTE · OBIETTIVI SEGRETI</p>
        <h2>Un gioco che mette alla prova creatività, immaginazione e capacità di improvvisare.</h2>
        <p>Ogni giocatore aggiunge una scena alla storia seguendo le carte che gioca. Mentre la trama prende forma, ognuno cerca di guidarla verso il proprio obiettivo segreto... senza far capire agli altri quale sia.</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="primary" data-home-play>Gioca ora</button>
        <button type="button" class="secondary" data-scroll-target="tutorial">Guarda il tutorial</button>
      </div>
    </section>

    <div class="home-grid product-menu">
      ${saved ? `<button type="button" class="resume-card" data-home-resume><span class="index">↻</span><span><b>Riprendi la partita</b><small>${S.esc(S.sourceLabel(saved))} · ${saved.count || 0} giocatori</small></span><i>→</i></button>` : ''}
      <button type="button" class="choice-card play-card" data-home-play><span class="index">▶</span><span><b>Gioca</b><small>Scegli una storia o inventa un incipit e parti subito.</small></span><i>→</i></button>
      <button type="button" class="choice-card" data-scroll-target="rules"><span class="index">📖</span><span><b>Regole</b><small>Tutto il regolamento spostato qui, fuori dalla barra superiore.</small></span><i>↓</i></button>
      <button type="button" class="choice-card" data-scroll-target="tutorial"><span class="index">🎓</span><span><b>Tutorial</b><small>Una mini partita già fatta: premi avanti e capisci il ritmo.</small></span><i>↓</i></button>
      <button type="button" class="choice-card" data-scroll-target="info"><span class="index">ℹ</span><span><b>Info e creatore</b><small>Chi c'è dietro, roadmap, social e supporto al progetto.</small></span><i>↓</i></button>
    </div>

    <section class="surface home-section how-section">
      <div class="screen-heading">
        <p class="eyebrow">COME SI GIOCA</p>
        <h2>La storia è il campo di gioco.</h2>
        <p>Non devi scrivere un romanzo. Devi reagire alle carte, improvvisare una scena coerente e spingere la trama verso il tuo obiettivo segreto.</p>
      </div>
      <div class="how-grid">
        <article><span>1</span><b>Crea l'incipit</b><p>Scegli una storia pronta oppure costruisci l'inizio con le carte.</p></article>
        <article><span>2</span><b>Gioca una carta</b><p>Il seme e il valore decidono che tipo di scena devi aggiungere.</p></article>
        <article><span>3</span><b>Aggiungi una scena</b><p>Continua ciò che esiste già. Non cancellare, fai evolvere.</p></article>
        <article><span>4</span><b>Nascondi il tuo piano</b><p>Ogni giocatore punta al proprio obiettivo segreto senza scoprirsi troppo.</p></article>
        <article><span>5</span><b>Chiudi il finale</b><p>Quando puoi, rivela l'obiettivo e dimostra che il finale regge.</p></article>
      </div>
    </section>

    <section id="tutorial" class="surface home-section tutorial-section">
      <div class="screen-heading">
        <p class="eyebrow">TUTORIAL</p>
        <h2>Guarda una partita dimostrativa.</h2>
        <p>Non devi fare niente: premi avanti, vedi tre turni rapidi e poi la rivelazione finale.</p>
      </div>
      <div data-tutorial-host>${stepMarkup(0)}</div>
      <div class="tutorial-actions">
        <button type="button" class="secondary" data-tutorial-prev disabled>Indietro</button>
        <button type="button" class="primary" data-tutorial-next>Avanti</button>
      </div>
    </section>

    <section id="rules" class="surface home-section rules-home-section">
      <div class="screen-heading">
        <p class="eyebrow">REGOLE</p>
        <h2>Regole complete, ordinate e apribili.</h2>
        <p>Le regole stanno qui nella home, non buttate nella barra alta. Apri solo la parte che ti serve.</p>
      </div>
      ${homeRules()}
    </section>

    <section id="info" class="surface home-section info-section">
      <div class="screen-heading">
        <p class="eyebrow">INFO · CREDITI · ROADMAP</p>
        <h2>Un progetto pensato per diventare un gioco completo.</h2>
        <p>La web app è il primo passo: testare il ritmo, sistemare le storie, rifinire le regole e arrivare a una versione fisica con carte, scatola e regolamento.</p>
      </div>
      <div class="info-grid">
        <article class="creator-card">
          <img src="${CREATOR_PHOTO}" alt="Foto del creatore Jita DesWadyas">
          <div>
            <p class="eyebrow">CREATORE</p>
            <h3>Jita DesWadyas / JitaDiSwadya (IT)</h3>
            <p>Creatore di STORIA 52. L'obiettivo è creare un gioco immediato, sociale e mentale: poche regole, molta improvvisazione, finali diversi ogni volta.</p>
          </div>
        </article>
        <article>
          <h3>Roadmap</h3>
          <p>Prima web app stabile, poi più storie, account opzionale, modalità extra, mazzo personalizzato e possibile versione fisica.</p>
        </article>
        <article>
          <h3>Social</h3>
          <p>Link in arrivo: Instagram, TikTok, YouTube e aggiornamenti sullo sviluppo.</p>
          <div class="placeholder-links"><span>Instagram</span><span>TikTok</span><span>YouTube</span></div>
        </article>
        <article>
          <h3>Supporto</h3>
          <p>Donazioni e crediti verranno aggiunti quando il progetto avrà una pagina ufficiale dedicata.</p>
        </article>
      </div>
    </section>`;
  };

  S.bindTutorial = () => {
    let index = 0;
    const host = S.play.querySelector('[data-tutorial-host]');
    const prev = S.play.querySelector('[data-tutorial-prev]');
    const next = S.play.querySelector('[data-tutorial-next]');
    if (!host || !prev || !next) return;

    const render = () => {
      host.innerHTML = stepMarkup(index);
      prev.disabled = index === 0;
      next.textContent = index === tutorialSteps.length - 1 ? 'Rivedi' : 'Avanti';
    };

    prev.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      render();
    });
    next.addEventListener('click', () => {
      index = index >= tutorialSteps.length - 1 ? 0 : index + 1;
      render();
    });
  };

  S.bindHomeNavigation = () => {
    S.play.querySelectorAll('[data-scroll-target]').forEach(button => button.addEventListener('click', () => {
      const target = S.play.querySelector(`#${button.dataset.scrollTarget}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  };

  S.renderHome = () => {
    S.currentSession = null;
    S.mount(S.homeMarkup(), { session: false });
    S.play.querySelectorAll('[data-home-play]').forEach(button => button.addEventListener('click', () => S.renderSetup('play')));
    S.play.querySelector('[data-home-resume]')?.addEventListener('click', () => S.resume(S.load()));
    S.bindHomeNavigation();
    S.bindTutorial();
  };
})();
