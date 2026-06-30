'use strict';
(() => {
  const E=window.OPENING_ENGINE;
  if(!E)return;
  E.actionMap={protect:[0,1,2,3],truth:[4,5,6,7],relation:[8,9,10,11],sacrifice:[12,13,14,15],prevent:[16,17,18,19],action:[20,21,22,23],fallback:[0,4,8,20]};
  E.blockMap={time:[1,2,5,6,11],person:[3,7,9,11],evidence:[4,7,8,9],loss:[4,5,8,10],sacrifice:[3,4,9,11],fallback:[0,5,7,9]};
  E.costMap={time:[0,7,8,11],person:[3,5,6,10],evidence:[2,4,8,11],loss:[0,4,7,8],sacrifice:[5,9,10,11],fallback:[0,2,8,11]};
})();
