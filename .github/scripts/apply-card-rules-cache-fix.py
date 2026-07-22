from pathlib import Path


def replace_once(path, old, new):
    text = path.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected one match, found {count}')
    path.write_text(text.replace(old, new, 1))

rules = Path('clean-rules.js')
replace_once(
    rules,
    "  const specialCardsMarkup = () => `<section class=\"meaning-block special-meaning-block\"><div class=\"meaning-heading\"><span>J · Q · K · A</span><h4>Guarda valore e colore. Ignora il seme.</h4><p>Rosso significa positivo, nero significa negativo.</p></div><div class=\"special-rank-grid\"><article><small>NUOVO ELEMENTO</small><b>J</b><span>Oggetto</span></article><article><small>NUOVO ELEMENTO</small><b>Q</b><span>Personaggio</span></article><article><small>NUOVO ELEMENTO</small><b>K</b><span>Luogo</span></article><article><small>SVOLTA</small><b>A</b><span>Colpo di scena</span></article></div></section>`;\n\n  const colorRuleMarkup = () => `<section class=\"meaning-block special-meaning-block\"><div class=\"meaning-heading\"><span>COLORE DELLA CARTA</span><h4>Rosso aiuta, nero complica.</h4></div><div class=\"special-color-rule\"><section><span class=\"red\">ROSSA</span><div><b>Positiva</b><p>Aiuta i personaggi o migliora la situazione.</p></div></section><section><span>NERA</span><div><b>Negativa</b><p>Ostacola i personaggi o peggiora la situazione.</p></div></section></div><p class=\"special-example\"><strong>Esempio:</strong> un J♥ aggiunge un oggetto positivo. Il simbolo ♥ non crea anche una relazione.</p></section>`;\n\n  S.cardMeaningMarkup = () => `<div class=\"card-meaning-board rule-card-mini-sections\"><details open><summary>Carte numeriche · 2–10</summary><div class=\"rule-mini-body\">${numericCardsMarkup()}</div></details><details><summary>Figure e assi · J, Q, K, A</summary><div class=\"rule-mini-body\">${specialCardsMarkup()}</div></details><details><summary>Positivo e negativo</summary><div class=\"rule-mini-body\">${colorRuleMarkup()}</div></details></div>`;",
    "  const specialCardsMarkup = () => `<section class=\"meaning-block special-meaning-block\"><div class=\"meaning-heading\"><span>J · Q · K · A</span><h4>Per figure e assi guarda valore e colore. Ignora il seme.</h4><p><strong>Solo J, Q, K e A</strong> usano il colore: rosso significa positivo, nero significa negativo. Per le carte numeriche valgono invece seme e parità.</p></div><div class=\"special-rank-grid\"><article><small>NUOVO ELEMENTO</small><b>J</b><span>Oggetto</span></article><article><small>NUOVO ELEMENTO</small><b>Q</b><span>Personaggio</span></article><article><small>NUOVO ELEMENTO</small><b>K</b><span>Luogo</span></article><article><small>SVOLTA</small><b>A</b><span>Colpo di scena</span></article></div><div class=\"special-color-rule\"><section><span class=\"red\">ROSSA</span><div><b>Positiva</b><p>L’oggetto, il personaggio, il luogo o la svolta aiuta oppure migliora la situazione.</p></div></section><section><span>NERA</span><div><b>Negativa</b><p>L’oggetto, il personaggio, il luogo o la svolta ostacola oppure peggiora la situazione.</p></div></section></div><p class=\"special-example\"><strong>Esempio:</strong> un J♥ aggiunge un oggetto positivo. Il simbolo ♥ non crea anche una relazione, perché sulle figure conta soltanto il colore.</p></section>`;\n\n  S.cardMeaningMarkup = () => `<div class=\"card-meaning-board rule-card-mini-sections\"><details open><summary>Carte numeriche · 2–10</summary><div class=\"rule-mini-body\">${numericCardsMarkup()}</div></details><details><summary>Figure e assi · J, Q, K, A</summary><div class=\"rule-mini-body\">${specialCardsMarkup()}</div></details></div>`;"
)

index = Path('index.html')
text = index.read_text()
for old, new in [
    ('clean-rules.js?v=32.2', 'clean-rules.js?v=33'),
    ('virtual-cards.js?v=40', 'virtual-cards.js?v=42'),
    ('pwa-refresh.js?v=41', 'pwa-refresh.js?v=42'),
]:
    if text.count(old) != 1:
        raise SystemExit(f'index.html: expected one {old}')
    text = text.replace(old, new)
index.write_text(text)

sw = Path('sw.js')
text = sw.read_text()
if text.count('v41') != 2:
    raise SystemExit(f'sw.js: expected two v41 cache names, found {text.count("v41")}')
sw.write_text(text.replace('v41', 'v42'))

pwa = Path('pwa-refresh.js')
text = pwa.read_text()
text = text.replace("// La v41 aggiorna l'accordion delle regole e la pulizia dei trascinamenti delle carte.", "// La v42 corregge il drag delle carte selezionate e aggiorna le regole di figure e assi.")
text = text.replace("const reloadKey = 'epoi_sw_reload_v41';", "const reloadKey = 'epoi_sw_reload_v42';")
if 'v41' in text:
    raise SystemExit('pwa-refresh.js: stale v41 marker remains')
pwa.write_text(text)

check = Path('scripts/release-check.mjs')
text = check.read_text()
text = text.replace('virtual-cards.js?v=40', 'virtual-cards.js?v=42')
text = text.replace('motore virtuale v40', 'motore virtuale v42')
text = text.replace('clean-rules.js?v=32', 'clean-rules.js?v=33')
text = text.replace('pwa-refresh.js?v=41', 'pwa-refresh.js?v=42')
text = text.replace('refresh PWA v41', 'refresh PWA v42')
text = text.replace('shell-v41', 'shell-v42').replace('runtime-v41', 'runtime-v42')
text = text.replace('Cache PWA v41', 'Cache PWA v42')
text = text.replace('epoi_sw_reload_v41', 'epoi_sw_reload_v42')
text = text.replace('Refresh PWA v41', 'Refresh PWA v42')
old_drag_check = "check(virtualSource.includes('const valid = !cancelled && action && (overlaps || thrownUp)') && virtualSource.includes('await commitOutcome(outcome, action)'), 'Il drag non esegue direttamente Cambia o Gioca');"
new_drag_check = "check(virtualSource.includes('const valid = !cancelled && action && dropState(current).valid') && virtualSource.includes('await commitOutcome(outcome, action)'), 'Il drag non esegue direttamente Cambia o Gioca');"
if text.count(old_drag_check) != 1:
    raise SystemExit('scripts/release-check.mjs: old drag assertion missing')
text = text.replace(old_drag_check, new_drag_check)
needle = "check(rulesSource.includes('rule-card-mini-sections') && rulesSource.includes('<details open>') && rulesSource.includes('Figure e assi'), 'Le regole delle carte non sono divise in mini sezioni');"
replacement = needle + "\ncheck(rulesSource.includes('Solo J, Q, K e A') && !rulesSource.includes('<summary>Positivo e negativo</summary>'), 'La regola del colore non è integrata esclusivamente nelle figure e negli assi');\ncheck(virtualSource.includes(\"ghost.classList.remove('selected'\") && virtualSource.includes('const dropState = current') && virtualSource.includes('distance >= 76'), 'Il drag della carta selezionata o la soglia di rilascio non sono corretti');"
if text.count(needle) != 1:
    raise SystemExit('scripts/release-check.mjs: rule check anchor missing')
text = text.replace(needle, replacement)
text = text.replace(
    'Release check completato: modalità virtuale v40, accordion dinamico, pulizia drag e cache PWA v41 verificati.',
    'Release check completato: modalità virtuale v42, drag selezionato, soglia di rilascio, regole J/Q/K/A e cache verificati.'
)
check.write_text(text)
