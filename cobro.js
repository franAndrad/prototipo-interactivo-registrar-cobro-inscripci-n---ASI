(function(){
  const form = document.getElementById('cobro');
  const messages = document.getElementById('form-messages');
  const cancelBtn = document.getElementById('cancelBtn');
  const submitBtn = document.getElementById('submitCobro');

  // Deshabilitar botón por defecto
  if(submitBtn){
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
  }

  function showMessage(text, type='success'){
    messages.className = type === 'success' ? 'msg-success' : 'msg-error';
    messages.textContent = text;
    messages.classList.remove('sr-only');
  }

  function clearMessage(){
    messages.textContent = '';
    messages.className = '';
    messages.classList.add('sr-only');
  }

  // Obtener dni desde query param
  const params = new URLSearchParams(window.location.search);
  const dni = params.get('dni') || '';

  if(dni){
    console.log('Registrar cobro para DNI:', dni);
  }

  // Validar campos y habilitar/deshabilitar botón
  function validateForm(){
    const nombre = document.getElementById('nombre').value.trim();
    const numeroTarjeta = document.getElementById('numeroTarjeta').value.trim();
    const cvc = document.getElementById('cvc').value.trim();
    const fecha = document.getElementById('fecha').value;

    const isValid = nombre && numeroTarjeta && cvc && fecha;

    if(submitBtn){
      if(isValid){
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
      } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
      }
    }
  }

  function parseCurrencyToNumber(str){
    if(!str) return 0;
    const cleaned = str.replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  function parsePercent(str){
    if(!str) return 0;
    const m = str.toString().match(/([0-9]+(?:[.,][0-9]+)?)/);
    if(!m) return 0;
    return parseFloat(m[1].replace(',', '.'));
  }

  function formatCurrency(n){
    try{
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
    }catch(e){
      return '$' + n.toFixed(2);
    }
  }

  function computeAmounts(){
    const baseStr = document.getElementById('montoBase').value;
    const descStr = document.getElementById('descuento').value;
    const base = parseCurrencyToNumber(baseStr);
    const pct = parsePercent(descStr);
    const total = base * (1 - (pct/100));
    document.getElementById('montoTotal').value = formatCurrency(total);
  }

  // Calcular al cargar la página
  computeAmounts();

  // Añadir listeners a los campos requeridos para validar en tiempo real
  const nombreInput = document.getElementById('nombre');
  const numeroTarjetaInput = document.getElementById('numeroTarjeta');
  const cvcInput = document.getElementById('cvc');
  const fechaInput = document.getElementById('fecha');

  if(nombreInput) nombreInput.addEventListener('input', validateForm);
  if(numeroTarjetaInput) numeroTarjetaInput.addEventListener('input', validateForm);
  if(cvcInput) cvcInput.addEventListener('input', validateForm);
  if(fechaInput) fechaInput.addEventListener('change', validateForm);

  // Validar al cargar por si hay datos pre-cargados
  validateForm();

  // Cancelar vuelve atrás
  cancelBtn.addEventListener('click', function(){
    window.history.back();
  });

  // Submit: validar campos mínimos y simular registro de cobro
  form.addEventListener('submit', function(e){
    e.preventDefault();
    clearMessage();

    // Validación simple
    const nombre = document.getElementById('nombre').value.trim();
    const numeroTarjeta = document.getElementById('numeroTarjeta').value.trim();
    const cvc = document.getElementById('cvc').value.trim();
    const fecha = document.getElementById('fecha').value;

    if(!nombre || !numeroTarjeta || !cvc || !fecha){
      showMessage('Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    // Simulación de cobro exitoso
    if(!dni){
      showMessage('Advertencia: no se proporcionó DNI. Se registrará el cobro sin asociarlo a un DNI.', 'error');
    }

    // Guardar flag de pago en localStorage y sessionStorage para el DNI (si existe)
    if(dni){
      localStorage.setItem(`payment_completed_${dni}`, 'true');
      // sessionStorage marca que el pago se realizó en esta sesión/flujo — usado para que "inscripción" no lea pagos antiguos por defecto
      try{ sessionStorage.setItem(`payment_completed_session_${dni}`, 'true'); }catch(e){ /* noop */ }
    }

    showMessage('Cobro registrado correctamente. Redirigiendo a inscripción...', 'success');

    // Redirigir después de un breve delay para que el usuario vea el mensaje
    setTimeout(function(){
      const target = 'inscripcion.html' + (dni ? ('?dni=' + encodeURIComponent(dni)) : '');
      window.location.href = target;
    }, 900);
  });
})();
