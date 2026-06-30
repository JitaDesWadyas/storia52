'use strict';
(() => {
  const G = window.G52;
  if (!G) return;
  const bad = /problema si manifesta|situazione è peggiore|primo passo del suo piano|conosce soltanto metà del piano|senza conoscere tutto il piano|deve prendere una decisione difficile/i;
  const migrate = session => {
    if (!session || session.openingBuilderVersion === 2) return session;
    session.context ||= {};
    ['identity', 'place', 'opening', 'stakes'].forEach(key => {
      if (bad.test(String(session.context[key] || ''))) session.context[key] = '';
    });
    session.context.finalOpening = '';
    session.suggestions = {};
    session.ideaHistory = {};
    session.openingWorld = '';
    session.openingBuilderVersion = 2;
    G.save(session);
    return session;
  };
  migrate(G.load?.());
  const previousContextForm = G.flow.contextForm;
  G.flow.contextForm = session => previousContextForm(migrate(session));
})();
