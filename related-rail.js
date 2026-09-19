(function(){
  function initRail(rail){
    var track=rail.querySelector('[data-rail-track]');
    var prev=rail.querySelector('[data-rail-prev]');
    var next=rail.querySelector('[data-rail-next]');
    if(!track||!prev||!next)return;
    rail.classList.add('is-enhanced');
    function step(){return Math.max(track.clientWidth*.78,280);}
    function update(){
      var max=track.scrollWidth-track.clientWidth-2;
      prev.disabled=track.scrollLeft<=2;
      next.disabled=track.scrollLeft>=max;
      rail.classList.toggle('is-scrollable',max>2);
    }
    prev.addEventListener('click',function(){track.scrollBy({left:-step(),behavior:'smooth'});});
    next.addEventListener('click',function(){track.scrollBy({left:step(),behavior:'smooth'});});
    track.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update);
    update();
  }
  document.querySelectorAll('[data-related-rail]').forEach(initRail);
})();