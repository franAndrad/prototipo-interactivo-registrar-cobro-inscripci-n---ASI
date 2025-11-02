(function(){
  // Datos de ejemplo
  const exampleDni = '12345678';
  const exampleUser = { dni: exampleDni, nombre: 'Francisco Andrade' };

  // Elementos
  const buscarForm = document.getElementById('buscarUsuario');
  const dniInput = document.getElementById('DNI');
  const dniExampleBtn = document.getElementById('dniExample');
  const maratonForm = document.getElementById('Maraton');
  const nombreInput = document.getElementById('nombre');
  const registrarNuevoBtn = document.getElementById('registrarNuevo');
  const registrarInscripcionBtn = document.getElementById('registrarInscripcion');
  const simularPagoBtn = document.getElementById('simularPago');
  const categoriaSelect = document.getElementById('categoria');
  const distanciaSelect = document.getElementById('distancia');
  const organizacionSelect = document.getElementById('organizacion');

  // Asegurar estado inicial: deshabilitado (mantener color verde pero con opacidad como indicador)
  if(registrarInscripcionBtn){
    registrarInscripcionBtn.disabled = true;
    registrarInscripcionBtn.classList.add('opacity-60','cursor-not-allowed');
  }

  let currentDni = null;

  function setSearchStatus(text, type='info'){
    let status = document.getElementById('searchStatus');
    if(!status){
      status = document.createElement('div');
      status.id = 'searchStatus';
      status.setAttribute('aria-live', 'polite');
      status.className = 'mt-2 text-sm';
      const dniHelp = document.getElementById('dniHelp');
      dniHelp.parentNode.appendChild(status);
    }
    status.textContent = text;
    status.classList.remove('text-green-600','text-red-600','text-gray-600');
    if(type === 'ok') status.classList.add('text-green-600');
    else if(type === 'error') status.classList.add('text-red-600');
    else status.classList.add('text-gray-600');
  }

  function checkPaymentStatus(dni){
    // Sólo consideramos pago si fue realizado en esta sesión (sessionStorage).
    // No se usa localStorage aquí para evitar que pagos antiguos persistan como "Registrado".
    const keySession = `payment_completed_session_${dni}`;
    try{
      return sessionStorage.getItem(keySession) === 'true';
    }catch(e){
      // Si sessionStorage no está disponible (entorno muy restringido),
      // devolvemos false por seguridad para que el estado por defecto sea "No registrado".
      return false;
    }
  }

  function isFormComplete(){
    // nombre está deshabilitado (cargado desde búsqueda), validar selects requeridos
    const cat = categoriaSelect && categoriaSelect.value;
    const dist = distanciaSelect && distanciaSelect.value;
    const org = organizacionSelect && organizacionSelect.value;
    return !!(cat && dist && org);
  }

  function validateRegister(){
    const dni = currentDni || dniInput.value.trim();
    const paid = !!(dni && checkPaymentStatus(dni));
    // actualizar indicador visible de estado de pago
    const estadoSpan = document.getElementById('estadoPago');
    if(estadoSpan){
      estadoSpan.textContent = paid ? 'Registrado' : 'No registrado';
    }

    // Controlar botón "Continuar al pago" según que los campos requeridos estén completos
    if(typeof continuarBtn !== 'undefined' && continuarBtn){
      if(maratonForm.classList.contains('hidden') || !isFormComplete()){
        continuarBtn.disabled = true;
        continuarBtn.classList.add('opacity-60','cursor-not-allowed');
      } else {
        continuarBtn.disabled = false;
        continuarBtn.classList.remove('opacity-60','cursor-not-allowed');
      }
    }

    // Si el formulario no está visible, asegurar que no se pueda registrar
    if(maratonForm.classList.contains('hidden')){
      registrarInscripcionBtn.disabled = true;
      registrarInscripcionBtn.classList.add('opacity-60','cursor-not-allowed');
      return;
    }

    // Sólo habilitar registro si pago confirmado y campos completos
    if(paid && isFormComplete()){
      registrarInscripcionBtn.disabled = false;
      registrarInscripcionBtn.classList.remove('opacity-60','cursor-not-allowed');
    } else {
      registrarInscripcionBtn.disabled = true;
      registrarInscripcionBtn.classList.add('opacity-60','cursor-not-allowed');
    }
  }

  // Buscar usuario (simulado)
  buscarForm.addEventListener('submit', function(e){
    e.preventDefault();
    const dni = (dniInput.value || '').trim();
    if(!dni){
      setSearchStatus('Por favor ingresa un DNI.', 'error');
      return;
    }
    if(dni === exampleUser.dni){
      currentDni = dni;
      nombreInput.value = exampleUser.nombre;
      maratonForm.classList.remove('hidden');
      if(registrarNuevoBtn) registrarNuevoBtn.classList.add('hidden');
      maratonForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSearchStatus(`Usuario encontrado: ${exampleUser.nombre}`, 'ok');
      validateRegister();
    } else {
      currentDni = null;
      maratonForm.classList.add('hidden');
      if(registrarNuevoBtn) registrarNuevoBtn.classList.remove('hidden');
      setSearchStatus('No se encontró un usuario con ese DNI.', 'error');
      validateRegister();
    }
  });

  // Autocompletar DNI de ejemplo
  dniExampleBtn.addEventListener('click', function(){
    dniInput.value = exampleDni;
    setSearchStatus('DNI de ejemplo cargado. Presiona Buscar.', 'info');
    dniInput.focus();
  });

  // Continuar al pago: controlar habilitación y navegación
  const continuarBtn = document.getElementById('continuarPago');
  if(continuarBtn){
    // Asegurar estado inicial
    continuarBtn.disabled = true;
    continuarBtn.classList.add('opacity-60','cursor-not-allowed');
    continuarBtn.addEventListener('click', function(e){
      e.preventDefault();
      const dni = currentDni || dniInput.value.trim();
      if(!dni){ setSearchStatus('Primero busca y selecciona un usuario.', 'error'); return; }
      // navegar a cobro
      window.location.href = 'cobro.html?dni=' + encodeURIComponent(dni);
    });
  }

  // Simular pago completado: marca en sessionStorage para habilitar el registro
  simularPagoBtn.addEventListener('click', function(){
    const dni = currentDni || dniInput.value.trim();
    if(!dni){ setSearchStatus('Busca un usuario primero para simular el pago.', 'error'); return; }
    // marcar en sessionStorage para indicar pago en este flujo
    try{ sessionStorage.setItem(`payment_completed_session_${dni}`, 'true'); }catch(e){}
    // también opcionalmente dejar registro en localStorage (no es usado para el estado visual)
    try{ localStorage.setItem(`payment_completed_${dni}`, 'true'); }catch(e){}
    setSearchStatus('Pago simulado y registrado.', 'ok');
    validateRegister();
  });

  // Limpiar estado de pago: elimina marcas en sessionStorage/localStorage para el dni actual
  const limpiarPagoBtn = document.getElementById('limpiarPago');
  if(limpiarPagoBtn){
    limpiarPagoBtn.addEventListener('click', function(){
      const dni = currentDni || dniInput.value.trim();
      if(!dni){ setSearchStatus('Busca un usuario primero para limpiar el estado de pago.', 'error'); return; }
      try{ sessionStorage.removeItem(`payment_completed_session_${dni}`); }catch(e){}
      try{ localStorage.removeItem(`payment_completed_${dni}`); }catch(e){}
      setSearchStatus('Estado de pago limpiado. Ahora: No registrado.', 'info');
      validateRegister();
    });
  }

  // Re-evaluar habilitación cuando cambian campos requeridos
  if(categoriaSelect) categoriaSelect.addEventListener('change', validateRegister);
  if(distanciaSelect) distanciaSelect.addEventListener('change', validateRegister);
  if(organizacionSelect) organizacionSelect.addEventListener('change', validateRegister);

  // Registrar inscripcion: acción de demo (solo si validado)
  registrarInscripcionBtn.addEventListener('click', function(e){
    e.preventDefault();
    const dni = currentDni || dniInput.value.trim();
    if(!dni){ setSearchStatus('No se puede registrar: no hay participante seleccionado.', 'error'); return; }
    // Revalidar strictamente antes de registrar
    if(!checkPaymentStatus(dni)){
      setSearchStatus('No se puede registrar: el pago no fue registrado.', 'error');
      validateRegister();
      return;
    }
    if(!isFormComplete()){
      setSearchStatus('Por favor completa todos los campos requeridos antes de registrar.', 'error');
      validateRegister();
      return;
    }
    // Marca la inscripción (demo)
    setSearchStatus('Inscripción registrada correctamente (demo).', 'ok');
    registrarInscripcionBtn.disabled = true;
    registrarInscripcionBtn.classList.add('opacity-60','cursor-not-allowed');
  });

  // Cancelar: oculta el formulario inferior y limpia estado
  const cancelarRegistroBtn = document.querySelector('#Maraton button.bg-red-600');
  if(cancelarRegistroBtn){
    cancelarRegistroBtn.addEventListener('click', function(e){
      e.preventDefault();
      maratonForm.classList.add('hidden');
      currentDni = null;
      dniInput.value = '';
      nombreInput.value = '';
      if(registrarNuevoBtn) registrarNuevoBtn.classList.remove('hidden');
      setSearchStatus('Operación cancelada.', 'info');
      validateRegister();
    });
  }

  // Si la página se carga con ?dni=xxx y el pago ya está registrado, auto-mostrar
  document.addEventListener('DOMContentLoaded', function(){
    const params = new URLSearchParams(window.location.search);
    const dni = params.get('dni');
    if(dni){
      dniInput.value = dni;
      const evt = new Event('submit', { bubbles: true, cancelable: true });
      buscarForm.dispatchEvent(evt);
    }
    // Re-evaluar estado inicial
    validateRegister();
  });
})();
