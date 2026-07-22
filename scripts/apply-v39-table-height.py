from pathlib import Path

path = Path('virtual-cards.css')
text = path.read_text()

replacements = [
    (
        '''  flex:1 1 250px!important;
  min-height:210px!important;
  max-height:480px!important;''',
        '''  flex:0 0 auto!important;
  min-height:0!important;
  max-height:none!important;''',
        'dimensione tavolo',
    ),
    (
        '''  min-height:104px!important;
  padding:9px 10px!important;''',
        '''  min-height:118px!important;
  padding:10px 10px!important;''',
        'incipit',
    ),
    (
        '''  -webkit-line-clamp:3!important;''',
        '''  -webkit-line-clamp:4!important;''',
        'righe incipit',
    ),
    (
        '''  width:100%!important;
  min-height:0!important;
  margin:0!important''',
        '''  width:100%!important;
  height:190px!important;
  min-height:190px!important;
  margin:0!important''',
        'altezza zona tavolo',
    ),
    (
        '''  .virtual-table{min-height:190px!important;max-height:345px!important}''',
        '''  .virtual-story-stage{min-height:78px!important}
  .virtual-table-board{height:145px!important;min-height:145px!important}''',
        'schermi bassi',
    ),
    (
        '''  .virtual-table{min-height:174px!important;max-height:286px!important}''',
        '''  .virtual-table-board{height:128px!important;min-height:128px!important}''',
        'schermi molto bassi',
    ),
    (
        '''  .virtual-story-stage{min-height:104px!important;align-items:start!important;padding-top:10px!important;padding-bottom:10px!important}
  .virtual-story-copy small{-webkit-line-clamp:3!important;font-size:.64rem!important;line-height:1.22!important}''',
        '''  .virtual-story-stage{min-height:128px!important;align-items:start!important;padding-top:10px!important;padding-bottom:10px!important}
  .virtual-story-copy small{-webkit-line-clamp:4!important;font-size:.69rem!important;line-height:1.22!important}''',
        'schermi alti',
    ),
]

for old, new, label in replacements:
    if old not in text:
        raise SystemExit(f'Manca blocco atteso: {label}')
    text = text.replace(old, new, 1)

path.write_text(text)
