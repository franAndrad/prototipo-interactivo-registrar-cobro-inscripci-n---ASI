// Script ligero para simular el escaneo de un QR y habilitar la acreditación
(function(){
  const simular = document.getElementById('simularScan');
  const limpiar = document.getElementById('limpiar');
  const registrarBtn = document.getElementById('registrarAcreditacion');
  const cancelar = document.getElementById('cancelar');

  // Bandera para indicar si se encontró un participante (p. ej. tras escanear QR)
  let participanteEncontrado = false;
  // Asegurar estado inicial: botón deshabilitado hasta encontrar participante
  if(registrarBtn){
    registrarBtn.disabled = true;
    registrarBtn.classList.add('opacity-60','cursor-not-allowed');
  }

  const datos = {
    nombre: 'Francisco Andrade',
    dni: '12345678',
    numeroInscripcion: 'M-2025-045',
    categoria: 'Adulto',
    distancia: '10K',
    organizacion: 'Cruz Roja',
    estadoPago: 'Completado'
  };

  function setDatos(obj){
    document.getElementById('nombre').value = obj.nombre || '';
    document.getElementById('dni').value = obj.dni || '';
    document.getElementById('numeroInscripcion').value = obj.numeroInscripcion || '';
    document.getElementById('categoria').value = obj.categoria || '';
    document.getElementById('distancia').value = obj.distancia || '';
    document.getElementById('organizacion').value = obj.organizacion || '';
    document.getElementById('estadoPago').value = obj.estadoPago || 'Pendiente';
  }

  function paymentCompletedFor(dni){
    return dni && localStorage.getItem(`payment_completed_${dni}`) === 'true';
  }

  simular.addEventListener('click', () => {
    setDatos(datos);
    participanteEncontrado = true;
    // Habilitar registrar únicamente porque se encontró un participante (ignorar estado de pago)
    if(registrarBtn){
      registrarBtn.disabled = false;
      registrarBtn.classList.remove('opacity-60','cursor-not-allowed');
    }
  });

  limpiar.addEventListener('click', () => {
    setDatos({});
    participanteEncontrado = false;
    if(registrarBtn){
      registrarBtn.disabled = true;
      registrarBtn.classList.add('opacity-60','cursor-not-allowed');
    }
  });

  cancelar.addEventListener('click', () => {
    // En un prototipo limpiamos los campos
    setDatos({});
    participanteEncontrado = false;
    if(registrarBtn){
      registrarBtn.disabled = true;
      registrarBtn.classList.add('opacity-60','cursor-not-allowed');
    }
  });

  registrarBtn.addEventListener('click', () => {
    const currentDni = document.getElementById('dni').value;
    if(currentDni){
      // Marcar acreditado en localStorage (demo)
      localStorage.setItem(`accredited_${currentDni}`, 'true');
    }
    // Comportamiento de prototipo: mostrar confirmación visual rápida
    registrarBtn.textContent = 'Acreditado ✓';
    registrarBtn.disabled = true;
    registrarBtn.classList.remove('bg-blue-600');
    registrarBtn.classList.add('bg-green-600');
    // Visual: marcar como deshabilitado tras acreditar
    registrarBtn.classList.add('opacity-60','cursor-not-allowed');
  });
})();
