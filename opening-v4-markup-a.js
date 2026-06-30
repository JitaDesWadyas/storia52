'use strict';
(() => {
  const V=window.STORIA52_OPENING_V4;if(!V)return;
  const {STEPS,esc,story,cardTextFor}=V;
  V.storyReference=session=>`<section class="story-reference opening-v4-reference"><div class="story-reference-head"><div><span>LE QUATTRO CARTE</span><h3>Quattro vincoli da far funzionare insieme</h3></div><small>Puoi cambiare singolarmente la carta che rende la combinazione impossibile.</small></div><div class="story-parts">${STEPS.map(step=>{const card=story(session)[step.story],red=SUITS[card.suit].red?' red':'';return `<article class="story-part" data-story-key="${step.story}"><span class="story-part-rank${red}">${cardLabel(card)}</span><div class="story-part-copy"><small>${step.label}</small><p class="story-part-text">${esc(cardTextFor(session,step))}</p></div><button type="button" class="change-story-card" data-opening-v4-change="${step.story}">Cambia</button></article>`;}).join('')}</div></section>`;
})();
