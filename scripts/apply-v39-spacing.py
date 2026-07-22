from pathlib import Path

path = Path('virtual-cards.css')
text = path.read_text()

old = '''.virtual-hand-section{
  position:relative!important;
  flex:0 0 auto!important;
  margin-top:auto!important;
  display:grid!important;'''
new = '''.virtual-hand-section{
  position:relative!important;
  flex:0 0 auto!important;
  display:grid!important;'''
if old not in text:
    raise SystemExit('Manca spaziatura mano attesa')
text = text.replace(old, new, 1)

old = '''.virtual-actions{
  display:grid!important;
  flex:0 0 64px!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;'''
new = '''.virtual-actions{
  display:grid!important;
  flex:0 0 64px!important;
  margin-top:auto!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;'''
if old not in text:
    raise SystemExit('Manca barra azioni attesa')
text = text.replace(old, new, 1)

if 'max-height:440px!important' not in text:
    raise SystemExit('Manca altezza tavolo attesa')
text = text.replace('max-height:440px!important', 'max-height:480px!important', 1)

path.write_text(text)
