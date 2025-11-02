// Pequeñas interacciones para index: actualmente sólo acceso progressive enhancement
(function(){
  document.addEventListener('click', function(e){
    const a = e.target.closest && e.target.closest('a');
    if(!a) return;
    // analytics stub: podríamos guardar en cache o enviar evento
    try{ if(a.href && a.getAttribute('href') && a.getAttribute('href').startsWith('inscripcion')){
        // ejemplo: destacar botón brevemente
        a.style.opacity = '0.9';
        setTimeout(()=> a.style.opacity = '', 250);
      }
    }catch(e){ /* noop */ }
  });
})();
