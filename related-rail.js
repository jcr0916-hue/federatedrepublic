(function(){
  function initRail(rail){
    if(rail.dataset.railReady==='true')return;
    rail.dataset.railReady='true';
    var track=rail.querySelector('[data-rail-track]');
    var prev=rail.querySelector('[data-rail-prev]');
    var next=rail.querySelector('[data-rail-next]');
    if(!track||!prev||!next)return;
    rail.classList.add('is-enhanced');
    function step(){
      var cards=track.children;
      return cards.length>1?cards[1].getBoundingClientRect().left-cards[0].getBoundingClientRect().left:track.clientWidth;
    }
    function move(direction){
      var pitch=step();
      if(pitch<=0)return;
      var left=(Math.round(track.scrollLeft/pitch)+direction)*pitch;
      track.scrollTo({left:Math.max(0,Math.min(left,track.scrollWidth-track.clientWidth)),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
    function update(){
      var max=track.scrollWidth-track.clientWidth-2;
      prev.disabled=track.scrollLeft<=2;
      next.disabled=track.scrollLeft>=max;
      rail.classList.toggle('is-scrollable',max>2);
    }
    prev.addEventListener('click',function(){move(-1);});
    next.addEventListener('click',function(){move(1);});
    track.addEventListener('keydown',function(event){
      if(event.target!==track)return;
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        event.preventDefault();move(event.key==='ArrowLeft'?-1:1);
      }
    });
    track.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',function(){
      var pitch=step();
      if(pitch>0)track.scrollTo({left:Math.round(track.scrollLeft/pitch)*pitch,behavior:'auto'});
      update();
    });
    update();
  }
  document.querySelectorAll('[data-related-rail]').forEach(initRail);
})();