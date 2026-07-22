from pathlib import Path


def replace_once(path, old, new, label):
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise SystemExit(f'Manca blocco atteso: {label}')
    file.write_text(text.replace(old, new, 1))


js = Path('virtual-cards.js')
text = js.read_text()

phase = '''      <div class="virtual-phase-callout" data-phase-callout>
        <b data-phase-title>CAMBIA UNA CARTA</b>
        <span data-phase-help>Tocca per selezionarla oppure trascinala sul tavolo.</span>
      </div>
'''
if phase not in text:
    raise SystemExit('Manca indicatore fase originale')
text = text.replace(phase, '', 1)
hand_marker = '      <section class="virtual-hand-section">'
if hand_marker not in text:
    raise SystemExit('Manca sezione mano')
text = text.replace(hand_marker, phase + hand_marker, 1)

text = text.replace(
    '<section class="virtual-story-stage">',
    '<button type="button" class="virtual-story-stage" data-open-story aria-label="Apri la storia completa">',
    1,
)
text = text.replace(
    '        </section>\n        <div class="virtual-table-board">',
    '        </button>\n        <div class="virtual-table-board">',
    1,
)
text = text.replace(
    '<small>${S.esc(shortText(opening))}</small>',
    '<small>${S.esc(shortText(opening, 340))}</small>',
    1,
)

refs_old = "      handCover: root.querySelector('[data-hand-cover]')\n    };"
refs_new = "      handCover: root.querySelector('[data-hand-cover]'),\n      storyStage: root.querySelector('[data-open-story]')\n    };"
if refs_old not in text:
    raise SystemExit('Manca refs mano')
text = text.replace(refs_old, refs_new, 1)

focus_old = '''      if (state.phase === 'completed') refs.focusLabel.textContent = 'Finale accettato';
      else if (played) refs.focusLabel.textContent = 'Carta giocata';
      else if (id) refs.focusLabel.textContent = 'Carta scartata';
      else refs.focusLabel.textContent = state.phase === 'exchange' ? 'Trascina qui per cambiare' : 'Trascina qui per giocare';
      if (refs.focusHelp) refs.focusHelp.textContent = state.phase === 'exchange' ? 'Carta da cambiare' : 'Carta da giocare';
'''
focus_new = '''      refs.focusLabel.hidden = !id && state.phase !== 'completed';
      if (state.phase === 'completed') refs.focusLabel.textContent = 'Finale accettato';
      else if (played) refs.focusLabel.textContent = 'Carta giocata';
      else if (id) refs.focusLabel.textContent = 'Carta scartata';
      else refs.focusLabel.textContent = '';
      if (refs.focusHelp) refs.focusHelp.textContent = state.phase === 'exchange' ? 'Carta da cambiare' : 'Carta da giocare';
'''
if focus_old not in text:
    raise SystemExit('Manca aggiornamento focus originale')
text = text.replace(focus_old, focus_new, 1)

card_old = '''        slot.classList.add(...cardClasses(id).split(' '));
        if (id === selectedId) slot.classList.add('selected');
        const card = engine.cardFromId(id);
        const meaning = engine.meaningFor(id);
        slot.innerHTML = cardFaceMarkup(id);
        slot.setAttribute('aria-label', `${card.rank} di ${card.name}. ${meaning.title}. ${meaning.text}`);
'''
card_new = '''        const card = engine.cardFromId(id);
        const meaning = engine.meaningFor(id);
        if (cardsHidden) {
          slot.classList.add('card-back');
          slot.innerHTML = '<span class="virtual-card-back-mark"><img src="storia52-cards-logo.svg" alt=""><small>E POI?</small></span>';
          slot.setAttribute('aria-label', 'Carta coperta');
          return;
        }
        slot.classList.add(...cardClasses(id).split(' '));
        if (id === selectedId) slot.classList.add('selected');
        slot.innerHTML = cardFaceMarkup(id);
        slot.setAttribute('aria-label', `${card.rank} di ${card.name}. ${meaning.title}. ${meaning.text}`);
'''
if card_old not in text:
    raise SystemExit('Manca rendering carta originale')
text = text.replace(card_old, card_new, 1)

hidden_old = '''      root.classList.toggle('cards-hidden', cardsHidden);
      refs.handCover.hidden = !cardsHidden;
      refs.toggleCards.textContent = cardsHidden ? 'Mostra' : 'Nascondi';
'''
hidden_new = '''      root.classList.toggle('cards-hidden', cardsHidden);
      refs.handCover.hidden = true;
      refs.toggleCards.textContent = cardsHidden ? 'Mostra' : 'Nascondi';
'''
if hidden_old not in text:
    raise SystemExit('Manca stato carte nascoste')
text = text.replace(hidden_old, hidden_new, 1)

listener_marker = "    root.querySelector('[data-virtual-menu]').addEventListener('click', () => openMenu(session, playerIndex, {"
if listener_marker not in text:
    raise SystemExit('Manca listener menu')
text = text.replace(
    listener_marker,
    "    refs.storyStage.addEventListener('click', () => openStoryPopup(session));\n" + listener_marker,
    1,
)
js.write_text(text)

css = Path('virtual-cards.css')
text = css.read_text()
replacements = [
    (
        '''  display:grid!important;
  grid-template-rows:auto auto auto minmax(188px,1fr) auto 64px!important;
  gap:5px!important;''',
        '''  display:flex!important;
  flex-direction:column!important;
  gap:5px!important;''',
        'root flex',
    ),
    (
        '''  min-height:0!important;
  padding:8px!important;
  background:linear-gradient''',
        '''  flex:1 1 250px!important;
  min-height:210px!important;
  max-height:440px!important;
  padding:8px!important;
  background:linear-gradient''',
        'dimensione tavolo',
    ),
    (
        '''  min-height:82px!important;
  padding:7px 8px!important;''',
        '''  min-height:104px!important;
  padding:9px 10px!important;''',
        'incipit grande',
    ),
    (
        '''  border-radius:12px!important
}''',
        '''  border-radius:12px!important;
  width:100%!important;
  color:var(--vg-ink)!important;
  font:inherit!important;
  text-align:left!important;
  cursor:pointer!important
}''',
        'storia pulsante',
    ),
    (
        '''  font-size:.63rem!important;
  line-height:1.18!important;
  display:-webkit-box!important;
  -webkit-line-clamp:2!important;''',
        '''  font-size:.69rem!important;
  line-height:1.22!important;
  display:-webkit-box!important;
  -webkit-line-clamp:3!important;''',
        'testo incipit',
    ),
    ('  gap:24px!important;', '  gap:18px!important;', 'spazio tavolo'),
    (
        '''  width:min(260px,86%);
  height:min(150px,72%);''',
        '''  width:min(226px,82%);
  height:min(118px,58%);''',
        'ellisse tavolo',
    ),
    (
        '''.virtual-hand-section{
  position:relative!important;''',
        '''.virtual-hand-section{
  position:relative!important;
  flex:0 0 auto!important;
  margin-top:auto!important;''',
        'mano ancorata',
    ),
    (
        '''  flex-wrap:wrap!important;
  align-content:center!important;
  align-items:center!important;
  justify-content:center!important;
  gap:7px 8px!important;
  min-height:0!important;
  padding:2px 0!important;''',
        '''  flex-wrap:nowrap!important;
  align-content:center!important;
  align-items:flex-start!important;
  justify-content:center!important;
  gap:4px!important;
  min-height:0!important;
  padding:1px 0!important;''',
        'mano singola riga',
    ),
    (
        '''  width:clamp(92px,27vw,104px)!important;
  max-width:104px!important;
  height:clamp(110px,14dvh,124px)!important;
  min-height:110px!important;
  padding:7px!important;''',
        '''  width:clamp(62px,calc((100vw - 32px)/5),76px)!important;
  max-width:76px!important;
  height:clamp(104px,13.4dvh,116px)!important;
  min-height:104px!important;
  padding:6px!important;''',
        'carte strette',
    ),
    ('font:900 1rem/1 Georgia,serif!important', 'font:900 .9rem/1 Georgia,serif!important', 'valore carta'),
    ('font-size:.86rem!important', 'font-size:.78rem!important', 'seme angolo'),
    ('font-size:2.25rem!important', 'font-size:1.95rem!important', 'seme centrale'),
    ('font:850 .7rem/1.02 Georgia,serif!important;', 'font:850 .59rem/1.02 Georgia,serif!important;', 'titolo effetto'),
    ('font-size:.51rem!important;', 'font-size:.44rem!important;', 'testo effetto'),
    (
        '''.cards-hidden .virtual-card-slot{visibility:hidden!important}
''',
        '''.virtual-card-slot.card-back{
  color:var(--vg-amber)!important;
  background:var(--vg-card)!important;
  border:2px solid var(--vg-amber)!important
}
.virtual-card-back-mark{
  display:grid!important;
  grid-template-rows:1fr auto!important;
  place-items:center!important;
  width:100%!important;
  height:100%!important
}
.virtual-card-back-mark img{width:64%!important;height:64%!important;object-fit:contain!important}
.virtual-card-back-mark small{color:var(--vg-amber)!important;font-size:.38rem!important;font-weight:950!important;letter-spacing:.06em!important}
''',
        'retro carte',
    ),
    (
        '''.virtual-actions{
  display:grid!important;''',
        '''.virtual-actions{
  display:grid!important;
  flex:0 0 64px!important;''',
        'azioni stabili',
    ),
    (
        '  .virtual-card-slot,.virtual-drag-ghost{width:calc((100vw - 42px)/3)!important}',
        '  .virtual-card-slot,.virtual-drag-ghost{width:calc((100vw - 32px)/5)!important}',
        'larghezza stretta',
    ),
    (
        '  .virtual-game{grid-template-rows:auto auto auto minmax(174px,1fr) auto 60px!important;gap:4px!important}',
        '  .virtual-game{gap:4px!important}\n  .virtual-table{min-height:190px!important;max-height:345px!important}',
        'schermi bassi',
    ),
    (
        '  .virtual-card-slot,.virtual-drag-ghost{height:108px!important;min-height:108px!important}',
        '  .virtual-card-slot,.virtual-drag-ghost{height:102px!important;min-height:102px!important}',
        'carte schermi bassi',
    ),
    (
        '  .virtual-game{grid-template-rows:auto auto auto minmax(154px,1fr) auto 58px!important}',
        '  .virtual-table{min-height:174px!important;max-height:286px!important}',
        'schermi molto bassi',
    ),
    ('  .virtual-hand{gap:8px 10px!important}', '  .virtual-hand{gap:5px!important}', 'mano larga'),
]
for old, new, label in replacements:
    if old not in text:
        raise SystemExit(f'Manca blocco CSS: {label}')
    text = text.replace(old, new, 1)
css.write_text(text)

for path in ['index.html', 'sw.js', 'pwa-refresh.js', 'scripts/release-check.mjs']:
    file = Path(path)
    text = file.read_text()
    text = text.replace('v=38', 'v=39')
    text = text.replace('shell-v38', 'shell-v39').replace('runtime-v38', 'runtime-v39')
    text = text.replace('epoi_sw_reload_v38', 'epoi_sw_reload_v39')
    text = text.replace('motore virtuale v38', 'motore virtuale v39')
    text = text.replace('stile virtuale v38', 'stile virtuale v39')
    text = text.replace('refresh PWA v38', 'refresh PWA v39')
    file.write_text(text)

checks = Path('scripts/release-check.mjs')
text = checks.read_text()
check_replacements = [
    (
        "check(virtualSource.includes('data-toggle-cards'), 'Manca il comando per nascondere le carte');",
        "check(virtualSource.includes('data-toggle-cards') && virtualSource.includes('card-back'), 'Manca il comando per girare le carte sul retro');",
        'check nascondi',
    ),
    (
        "check(virtualSource.includes('Carta scartata') && virtualSource.includes('Carta giocata'), 'Il tavolo non distingue carta scartata e carta giocata');",
        "check(virtualSource.includes('Carta scartata') && virtualSource.includes('Carta giocata') && virtualSource.includes('data-open-story'), 'Il tavolo non distingue le carte oppure l’incipit non è apribile');",
        'check tavolo',
    ),
    (
        "check(virtualCss.includes('flex-wrap:wrap!important'), 'La mano non dispone le carte su più righe');",
        "check(virtualCss.includes('flex-wrap:nowrap!important'), 'La mano non resta su una riga sola');",
        'check righe mano',
    ),
    (
        "check(virtualCss.includes('width:clamp(92px,27vw,104px)') && virtualCss.includes('height:clamp(110px,14dvh,124px)'), 'Le carte non hanno dimensioni mobili bilanciate');",
        "check(virtualCss.includes('width:clamp(62px,calc((100vw - 32px)/5),76px)') && virtualCss.includes('height:clamp(104px,13.4dvh,116px)'), 'Le carte non hanno la misura da mano singola');",
        'check misura carte',
    ),
]
for old, new, label in check_replacements:
    if old not in text:
        raise SystemExit(f'Manca {label}')
    text = text.replace(old, new, 1)
text = text.replace('Cache PWA v38 non attiva', 'Cache PWA v39 non attiva')
text = text.replace('Refresh PWA v38 non attivo', 'Refresh PWA v39 non attivo')
text = text.replace(
    'modalità virtuale v38, carte bilanciate, drag diretto, descrizioni, fase evidente e cache verificati.',
    'modalità virtuale v39, mano singola, retro carte, incipit apribile e cache verificati.',
)
checks.write_text(text)
