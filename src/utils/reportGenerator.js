import { horaAMinutos } from './timeUtils'

function formatearDosisMg(valorRaw) {
  const texto = (valorRaw || '').trim()
  if (!texto) return 'dosis no registrada'
  return texto.toLowerCase().endsWith('mg') ? texto : texto + ' mg'
}

function formatearVolumen(valorRaw) {
  const texto = (valorRaw || '').trim()
  if (!texto) return ''
  return texto.toLowerCase().includes('ml') ? texto : texto + ' mL'
}

export function validarFormulario(form) {
  const camposHorario = [
    { campo: 'hIngreso', label: '1. Ingreso' },
    { campo: 'hAnestesia', label: '2. Anestesia' },
    { campo: 'hLavado', label: '3. Lavado' },
    { campo: 'hInicio', label: '4. Inicio Cx' },
    { campo: 'hMedicacion', label: '5. Medicación' },
    { campo: 'hFinal', label: '6. Final Cx' },
    { campo: 'hTraslado', label: '7. Traslado' },
  ]
  const horasFaltantes = camposHorario
    .filter(c => !form[c.campo]?.trim())
    .map(c => c.label)

  if (horasFaltantes.length > 0) {
    return `⚠️ Falta registrar la(s) siguiente(s) hora(s):\n\n${horasFaltantes.join('\n')}\n\nPor favor complétalas antes de generar la nota.`
  }

  const medsControlados = []
  if (form.chkMorfina && !form.dosMorfina?.trim()) medsControlados.push('Morfina')
  if (form.chkHidromorfona && !form.dosHidromorfona?.trim()) medsControlados.push('Hidromorfona')
  if (form.chkKetamina && !form.dosKetamina?.trim()) medsControlados.push('Ketamina')

  if (medsControlados.length > 0) {
    return `⚠️ Falta registrar la dosis de: ${medsControlados.join(', ')}.\n\nPor favor completa la dosis antes de generar la nota.`
  }

  return null
}

export function generarReporte(form) {
  const {
    tipoCirugia, sala, cirujano, ayudante, anestesiologo, instrumentador,
    segundoCirujano, tipoReemplazo, lateralidadRodilla, casaMedica,
    calibre, ubicacionVena, miembro,
    hIngreso: h1, hAnestesia: h2, hLavado: h3, hInicio: h4,
    hMedicacion: h5, hFinal: h6, hTraslado: h7,
    cGasas, cCompresas, cMechas, cCotonoides,
    modalidadAnestesia, anestApl, anestLocal, anestAnalgesico,
    mostrarBloqueo, hBloqueo, tipoBloqueo, lateralidadBloqueo,
    volBloqueoLido, volBloqueoBupinest, volBloqueoBupirop,
    medsAnestesia, tubo, gas, hAnestesiaGeneral,
    placaBisturi, tipoDrenaje, muestraPatologia, nombreMuestra,
    sondaFoley, caracteristicaOrina,
    medicamentos, chkMorfina, dosMorfina, chkHidromorfona, dosHidromorfona,
    chkKetamina, dosKetamina, medsAdicional,
    novedades,
  } = form

  // Material blanco
  const arrMateriales = []
  if (parseInt(cGasas) > 0) arrMateriales.push(`Gasas: ${cGasas}`)
  if (parseInt(cCompresas) > 0) arrMateriales.push(`Compresas: ${cCompresas}`)
  if (parseInt(cMechas) > 0) arrMateriales.push(`Mechas: ${cMechas}`)
  if (parseInt(cCotonoides) > 0) arrMateriales.push(`Cotonoides: ${cCotonoides}`)
  const stringConteoMaterial = arrMateriales.length > 0
    ? arrMateriales.join(', ')
    : 'sin requerimiento de material blanco'

  // Medicamentos
  const listaMeds = [...medicamentos]
  if (chkMorfina) listaMeds.push(`Morfina ${formatearDosisMg(dosMorfina)} EV`)
  if (chkHidromorfona) listaMeds.push(`Hidromorfona ${formatearDosisMg(dosHidromorfona)} EV`)
  if (chkKetamina) listaMeds.push(`Ketamina ${formatearDosisMg(dosKetamina)} EV`)
  if (medsAdicional?.trim()) listaMeds.push(medsAdicional.trim())
  const stringMedsFinal = listaMeds.length > 0
    ? listaMeds.join(', ')
    : 'sin novedades en la administración de medicamentos intraoperatorios'

  // Drenaje
  let textoDrenajeFinal = 'sin dejar drenajes,'
  if (tipoDrenaje === 'penrose') textoDrenajeFinal = 'con exteriorización de dren de Penrose por contrabertura fijado a la piel,'
  if (tipoDrenaje === 'jackson-pratt') textoDrenajeFinal = 'con exteriorización de drenaje de succión cerrado tipo Jackson-Pratt por contrabertura, fijado a la piel y conectado a su sistema de vacío activo,'
  if (tipoDrenaje === 'hemovac') textoDrenajeFinal = 'con exteriorización de drenaje de succión cerrado tipo Hemovac por contrabertura, fijado a la piel y conectado a su sistema de vacío activo,'

  // Patología
  let textoPatologiaFinal = ''
  if (muestraPatologia === 'si') {
    const organo = nombreMuestra?.trim() || 'espécimen obtenido'
    textoPatologiaFinal = ` Se obtiene y recupera espécimen quirúrgico correspondiente a ${organo}; se realiza su rotulado con los datos de identificación correctos de la paciente, se preserva en solución de formol al 10% según directrices institucionales y se dispone de forma segura en el área de custodia para su envío definitivo al servicio de Patología.`
  }

  // Bloques de anestesia
  const textoBloqueRaquideaPura = `${h2} Anestesia Regional Raquídea. Con previa colocación de Elementos de Protección Personal, ${anestesiologo} ubica a la paciente en posición de sedestación (Fowler total) logrando la flexión óptima de la columna lumbar. Realiza asepsia y antisepsia rigurosa en la región lumbar utilizando gluconato de clorhexidina al 4% (Wescohex) seguido de alcohol antiséptico al 70%. Posteriormente, ejecuta punción lumbar con aguja de anestesia conductiva APL N° ${anestApl}, evidenciándose retorno franco de líquido cefalorraquídeo (LCR) claro y cristalino (en cristal de roca). Acto correcto, administra por vía intratecal el anestésico local ${anestLocal} más el analgésico intratecal ${anestAnalgesico}, sin presentar complicaciones inmediatas. Se posiciona a la paciente de forma segura en decúbito supino, monitorizando continuamente sus signos vitales.`

  const textoBloqueGeneralPura = `${h2} Anestesia General. Bajo estricto cumplimiento de las normas de bioseguridad por parte del anestesiólogo y el personal circulante, ${anestesiologo} procede a realizar preoxigenación mediante mascarilla facial acolchada con flujo de oxígeno suplementario e indica la administración de medicamentos endovenosos: ${medsAnestesia || 'fármacos de protocolo'}, logrando la inducción de anestesia general. Posteriormente, realiza laringoscopia directa y colocación de tubo orotraqueal N° ${tubo} (el cual se introduce ocluido/clampeado); se conecta y acopla de forma segura a la máquina de anestesia con flujo de oxígeno más ${gas}. Se retira la oclusión del tubo, se verifica adecuada expansión torácica bilateral, se fija con esparadrapo y se aplica protección ocular con cinta microporosa cinta limpia y seca para la prevención de úlceras corneales intraoperatorias.`

  const hGenFallo = hAnestesiaGeneral || '--:--'
  const textoBloqueGeneralFallo = `${hGenFallo} Anestesia General por Conversión (Fallo Anestésico). Debido a una instauración incompleta, falla crítica en el nivel sensitivo alcanzado o falta de latencia adecuada de la anestesia raquídea inicial, el equipo quirúrgico y anestésico determina de forma conjunta proceder con la conversión inmediata a anestesia general endotraqueal para garantizar el confort absoluto y la seguridad de la paciente. Bajo estrictas normas de bioseguridad, ${anestesiologo} inicia inducción farmacológica endovenosa administrando de forma segura: ${medsAnestesia || 'fármacos de protocolo'}. Realiza laringoscopia directa asistida y colocación de tubo orotraqueal N° ${tubo} (introducido bajo técnica de clampeo); se acopla al circuito de la máquina de anestesia manteniendo ventilación mecánica asistida con flujo de oxígeno más ${gas}. Se constata expansión torácica bilateral simétrica, ruidos respiratorios conservados, se fija el dispositivo ventilatorio con esparadrapo y se instaura protección ocular bilateral con cinta microporosa limpia para la prevención de queratopatías por exposición en el intraoperatorio.`

  const bloquesNota = []

  let pIngreso = '', pLavado = '', pInicio = '', pMedicacion = '', pFinal = '', pTraslado = ''
  let sufijoAnestesiaRecup = ''

  if (tipoCirugia === 'colelap') {
    sufijoAnestesiaRecup = modalidadAnestesia === 'raquidea' ? 'regional raquídea' : modalidadAnestesia === 'general' ? 'general' : 'general secundaria a conversión por fallo de anestesia raquídea'
    pIngreso = `${h1} Nota de ingreso. Con previa colocación de Elementos de Protección Personal (EPP: tapabocas N95/quirúrgico, monogafas, careta y guantes) según protocolo institucional, traslado y acompaño a paciente a la sala de cirugía N° ${sala} en camilla con barandas de protección elevadas para procedimiento quirúrgico programado con ${cirujano}. Paciente consciente, alerta, orientado, tolerando aire ambiente sin signos de dificultad respiratoria (disnea) y con tapabocas quirúrgico institucional. Al examen físico: normocéfalo, cuello móvil, tórax simétrico y expandible, abdomen no distendido, extremidades completas, móviles y simétricas. Cuenta con acceso venoso periférico permeable con catéter N° ${calibre} en ${ubicacionVena} de miembro superior ${miembro}, fijado a la piel con Tegaderm, por el cual se administra antibiótico profiláctico ordenado, sin signos de infiltración, infección ni flebitis; resto de piel sana. Paciente con alto riesgo de caída (según escala institucional) y bajo riesgo de sufrir lesiones por presión. Ingresa sin pertenencias personales de valor. Se ubica de forma segura en la mesa operatoria en decúbito supino, realizándose la colocación de la placa de retorno del electrobisturí en el ${placaBisturi} sobre piel íntegra, verificando su óptimo contacto. Se inicia monitorización hemodinámica básica no invasiva y se ejecuta la fase de "Entrada" de la lista de verificación de cirugía segura.`
    pLavado = `${h3} Lavado quirúrgico. ${ayudante === 'No aplica' ? cirujano : ayudante}, previo lavado clínico y antisepsia de manos, realiza el lavado quirúrgico y la preparación antiséptica del área abdominal del paciente, conservando estrictamente la técnica estéril con gluconato de clorhexidina al 4% (jabón) seguido de clorhexidina solución.`
    pInicio = `${h4} Inicio de cirugía. ${cirujano}${ayudante === 'No aplica' ? '' : ' en conjunto con ' + ayudante} inician el procedimiento quirúrgico de colecistectomía laparoscópica. Se realiza el conteo inicial de material blanco (${stringConteoMaterial}) e instrumental quirúrgico, reportándose completo y verificado bajo la instrumentación quirúrgica de ${instrumentador}.`
    pMedicacion = `${h5} Medicación. Por orden médica de ${anestesiologo}, se administran por vía endovenosa los siguientes medicamentos intraoperatorios: ${stringMedsFinal}. Se cumple orden médica, paciente recibe y tolera tratamiento farmacológico ordenado sin complicaciones aparentes.`
    pFinal = `${h6} Final de cirugía. Se termina procedimiento quirúrgico dejando heridas a nivel abdominal suturadas, afrontadas, ${textoDrenajeFinal} y cubiertas con apósito estéril (gasa y cinta microporosa limpia y seca). Conteo de material verificado, cerrado y completo (${stringConteoMaterial}) e instrumental quirúrgico.${textoPatologiaFinal} Sin complicaciones intraoperatorias aparentes; el paciente tolera el procedimiento en su totalidad.`
    pTraslado = `${h7} Traslado a recuperación. Con el uso adecuado de Elementos de Protección Personal (EPP), se traslada y acompaña al paciente a la sala de recuperación en camilla con barandas de protección elevadas, en postoperatorio de colecistectomía laparoscópica, bajo efectos residuales de anestesia ${sufijoAnestesiaRecup}; responde activamente al llamado, tolera aire ambiente sin signos de dificultad respiratoria y porta tapabocas quirúrgico institucional. Acceso venoso periférico permeable en ${ubicacionVena} de miembro superior ${miembro}, fijado con Tegaderm, sin signos de flebitis ni infiltración. Heridas quirúrgicas abdominales cubiertas con apósito estéril, limpio y seco, sin evidencia de sangrado activo. Resto de piel íntegra. Se entrega historia clínica con consentimientos informados debidamente diligenciados y paciente queda bajo monitorización y vigilancia en recuperación postanestésica.`

  } else if (tipoCirugia === 'histerectomia') {
    sufijoAnestesiaRecup = modalidadAnestesia === 'raquidea' ? 'regional raquídea' : modalidadAnestesia === 'general' ? 'general' : 'general secundaria a conversión por fallo de anestesia raquídea'
    pIngreso = `${h1} Nota de ingreso. Con previa colocación de Elementos de Protección Personal (EPP: tapabocas N95/quirúrgico, monogafas, careta y guantes) según protocolo institucional, traslado y acompaño a paciente a la sala de cirugía N° ${sala} en camilla con barandas de protección elevadas para procedimiento quirúrgico programado con ${cirujano}. Paciente consciente, alerta, orientada, tolerando aire ambiente sin signos de dificultad respiratoria y con tapabocas quirúrgico institucional. Al examen físico: normocéfala, cuello móvil, tórax simétrico y expandible, abdomen no distendido, extremidades completas, móviles y simétricas. Cuenta con acceso venoso periférico permeable con catéter N° ${calibre} en ${ubicacionVena} de miembro superior ${miembro}, fijado a la piel con Tegaderm, por el cual se administra antibiótico profiláctico ordenado, sin signos de infiltración, infección ni flebitis; resto de piel sana. Paciente con alto riesgo de caída (según escala institucional) y bajo riesgo de sufrir lesiones por presión. Ingresa sin pertenencias personales de valor. Se ubica de forma segura en la mesa operatoria en decúbito supino, realizándose la colocación de la placa de retorno del electrobisturí en el ${placaBisturi} sobre piel íntegra, verificando su óptimo contacto. Se inicia monitorización hemodinámica básica no invasiva y se ejecuta la fase de "Entrada" de la lista de verificación de cirugía segura.`
    pLavado = `${h3} Lavado quirúrgico y cateterismo. ${ayudante === 'No aplica' ? cirujano : ayudante}, previo lavado clínico y antisepsia de manos, realiza el lavado quirúrgico y la preparación antiséptica amplia de la región abdominal y genital de la paciente, conservando estrictamente la técnica estéril con gluconato de clorhexidina al 4% (jabón) seguido de clorhexidina solución, y procede a la delimitación del campo operatorio con campos estériles. Se realiza cateterismo vesical con sonda Foley N° ${sondaFoley}, conectada a sistema de drenaje cerrado, obteniéndose diuresis de características normales.`
    pInicio = `${h4} Inicio de cirugía. ${cirujano}${ayudante === 'No aplica' ? '' : ' en conjunto con ' + ayudante} inician el procedimiento quirúrgico de histerectomía total abdominal vía laparotomía. Se realiza el conteo inicial de material blanco (${stringConteoMaterial}) e instrumental quirúrgico, reportándose completo y verificado bajo la instrumentación quirúrgica de ${instrumentador}.`
    pMedicacion = `${h5} Medicación. Por orden médica de ${anestesiologo}, se administran por vía endovenosa los siguientes medicamentos intraoperatorios: ${stringMedsFinal}. Se cumple orden médica, paciente recibe y tolera tratamiento farmacológico ordenado sin complicaciones aparentes.`
    pFinal = `${h6} Final de cirugía. Se concluye satisfactoriamente el procedimiento quirúrgico, dejando la herida quirúrgica a nivel de la región suprapúbica debidamente suturada, afrontada, ${textoDrenajeFinal} y cubierta con apósito estéril (gasa y cinta microporosa limpia y seca). Conteo de material verificado, cerrado y completo (${stringConteoMaterial}) e instrumental quirúrgico.${textoPatologiaFinal} Sin complicaciones intraoperatorias aparentes; la paciente tolera el procedimiento en su totalidad.`
    pTraslado = `${h7} Traslado a recuperación. Con el uso de Elementos de Protección Personal (EPP) según los protocolos institucionales, se traslada y acompaña a la paciente a la sala de recuperación en camilla con barandas de protección elevadas, en postoperatorio de histerectomía total abdominal, bajo efectos residuales de anestesia ${sufijoAnestesiaRecup}; responde activamente al llamado, tolera aire ambiente sin signos de dificultad respiratoria y porta tapabocas quirúrgico institucional. Acceso venoso periférico permeable en ${ubicacionVena} de miembro superior ${miembro}, fijado con Tegaderm, sin signos de flebitis ni infiltración. Porta sonda vesical Foley N° ${sondaFoley} permeable, conectada a sistema de drenaje cerrado, drenando orina de características ${caracteristicaOrina}. Herida quirúrgica en región suprapúbica cubierta con apósito estéril, limpio y seco, sin evidencia de sangrado activo. Resto de piel íntegra. Se entrega historia clínica con consentimientos informados debidamente diligenciados y paciente queda bajo monitorización y vigilancia en recuperación postanestésica.`

  } else if (tipoCirugia === 'reemplazo') {
    sufijoAnestesiaRecup = modalidadAnestesia === 'raquidea' ? 'neuroaxial' : modalidadAnestesia === 'general' ? 'general' : 'general secundaria a conversión por fallo de anestesia neuroaxial'
    const tipoReemplazoTexto = tipoReemplazo === 'primario' ? 'reemplazo total primario de rodilla' : 'revisión protésica de rodilla'
    const casa = casaMedica?.trim() || '---'

    // Raquídea adaptada para reemplazo
    const textoBloqueRaqReemplazo = `${h2} Anestesia Regional Raquídea. Con previa colocación de elementos de protección personal, ${anestesiologo} posiciona al paciente en sedestación. Realiza asepsia y antisepsia de región lumbar con clorhexidina alcohólica conservando técnica estéril. Se efectúa punción subaracnoidea con aguja APL calibre ${anestApl}, obteniéndose retorno de líquido cefalorraquídeo claro. Se administra anestesia raquídea con ${anestLocal} y ${anestAnalgesico} según protocolo anestésico, sin complicaciones inmediatas.`

    if (mostrarBloqueo) {
      const anestesicosUtilizados = []
      const volLido = volBloqueoLido?.trim()
      const volBupinest = volBloqueoBupinest?.trim()
      const volBupirop = volBloqueoBupirop?.trim()
      if (volLido) anestesicosUtilizados.push(`Lidocaína 2% (${formatearVolumen(volLido)})`)
      if (volBupinest) anestesicosUtilizados.push(`Bupinest 0.75% (${formatearVolumen(volBupinest)})`)
      if (volBupirop) anestesicosUtilizados.push(`Bupirop 0.5% (${formatearVolumen(volBupirop)})`)
      const stringAnestBloqueo = anestesicosUtilizados.length > 0 ? anestesicosUtilizados.join(' y ') : 'anestésicos locales según protocolo'
      const hBl = hBloqueo || '--:--'
      bloquesNota.push({ hora: hBl, texto: `${hBl} Bloqueo Anestésico Regional. ${anestesiologo} realiza bloqueo anestésico regional ecoguiado de miembro inferior (${lateralidadBloqueo}), previa asepsia y antisepsia de la región y bajo técnica estéril. Se efectúa ${tipoBloqueo}, utilizando guía ecográfica en tiempo real para identificación anatómica y adecuada distribución del anestésico local basado en ${stringAnestBloqueo}. Procedimiento tolerado adecuadamente, sin eventos adversos inmediatos.` })
    }

    const personaLavado = ayudante === 'No aplica' ? segundoCirujano : ayudante
    pIngreso = `${h1} Nota de ingreso. Con previa colocación de elementos de protección personal según protocolo institucional (N95, tapabocas quirúrgico, monogafas, careta y guantes), se realiza traslado y acompañamiento del paciente a sala de cirugía N.° ${sala} en camilla con barandas elevadas para procedimiento quirúrgico programado con ${cirujano}. Paciente consciente, alerta, orientado, colaborador y hemodinámicamente estable, tolerando aire ambiente, sin signos de dificultad respiratoria y portando tapabocas quirúrgico. Normocéfalo, cuello móvil, tórax simétrico y expansible, abdomen blando no distendido y extremidades íntegras, móviles y simétricas. Acceso venoso periférico permeable en catéter N° ${calibre} en ${ubicacionVena} de miembro superior ${miembro}, fijado con Tegaderm®, en infusión de antibiótico profiláctico según orden médica, sin signos de flebitis, infiltración ni infección. Resto de piel íntegra. Paciente con alto riesgo de caída y bajo riesgo de lesión por presión según escalas institucionales. Se ubica en mesa operatoria, se inicia monitorización básica intraoperatoria y se realiza pausa de cirugía segura, verificando identidad, procedimiento, lateralidad, consentimientos e insumos requeridos.`
    pLavado = `${h3} Lavado quirúrgico. ${personaLavado}, previa antisepsia quirúrgica de manos, realiza preparación del miembro inferior ${lateralidadRodilla} con solución antiséptica institucional y delimita el campo operatorio conservando técnica estéril.`
    pInicio = `${h4} Inicio de cirugía. ${cirujano} y ${segundoCirujano} inician procedimiento de ${tipoReemplazoTexto} de rodilla ${lateralidadRodilla}. Se realiza preparación del campo quirúrgico mediante campos estériles, U-Drape y apósito adhesivo antimicrobiano tipo Ioban®, como medida de prevención de infección del sitio quirúrgico. Recuento inicial de material quirúrgico completo (${stringConteoMaterial}) e instrumental, concordante. Instrumenta ${instrumentador}, con acompañamiento de soporte técnico de casa comercial ${casa}.`
    pMedicacion = `${h5} Medicación. Por orden médica de ${anestesiologo}, se administran por vía endovenosa los siguientes medicamentos intraoperatorios: ${stringMedsFinal}. Se cumple orden médica, paciente recibe y tolera tratamiento farmacológico ordenado sin complicaciones aparentes.`
    pFinal = `${h6} Final de cirugía. Se da por finalizado el procedimiento quirúrgico. Se deja herida operatoria en rodilla ${lateralidadRodilla} afrontada y suturada, cubierta con apósito estéril y ${textoDrenajeFinal.replace(',', '')} junto a vendaje compresivo. Recuento final de gasas, compresas e instrumental completo y concordante con el recuento inicial (${stringConteoMaterial}).${textoPatologiaFinal} No se evidencian complicaciones intraoperatorias aparentes. Paciente tolera adecuadamente el procedimiento.`
    pTraslado = `${h7} Traslado a recuperación. Con uso de elementos de protección personal según protocolo institucional, se realiza traslado y acompañamiento del paciente a la unidad de recuperación postanestésica en camilla con barandas elevadas. Paciente bajo efectos residuales de anestesia ${sufijoAnestesiaRecup}, responde al llamado verbal, tolera aire ambiente, sin signos de dificultad respiratoria y con estabilidad hemodinámica. Acceso venoso periférico permeable en ${ubicacionVena} de miembro superior ${miembro}, fijado con Tegaderm®, en infusión de 500 cc de solución Hartmann, sin signos de flebitis o infiltración. Incisión quirúrgica en rodilla ${lateralidadRodilla} cubierta con apósito estéril y vendaje compresivo limpios y secos, sin evidencia de sangrado activo. Resto de piel íntegra. Se entrega historia clínica con consentimientos informados debidamente diligenciados y paciente queda bajo monitorización y vigilancia en recuperación postanestésica.`

    // Override textoBloqueRaquideaPura for reemplazo
    if (modalidadAnestesia === 'raquidea') {
      bloquesNota.push({ hora: h2, texto: textoBloqueRaqReemplazo })
    } else if (modalidadAnestesia === 'general') {
      bloquesNota.push({ hora: h2, texto: textoBloqueGeneralPura })
    } else if (modalidadAnestesia === 'fallo_raquidea') {
      bloquesNota.push({ hora: h2, texto: textoBloqueRaqReemplazo })
      bloquesNota.push({ hora: hGenFallo, texto: textoBloqueGeneralFallo })
    }
  }

  bloquesNota.push({ hora: h1, texto: pIngreso })
  bloquesNota.push({ hora: h3, texto: pLavado })
  bloquesNota.push({ hora: h4, texto: pInicio })
  bloquesNota.push({ hora: h5, texto: pMedicacion })
  bloquesNota.push({ hora: h6, texto: pFinal })
  bloquesNota.push({ hora: h7, texto: pTraslado })

  if (tipoCirugia !== 'reemplazo') {
    if (modalidadAnestesia === 'raquidea') {
      bloquesNota.push({ hora: h2, texto: textoBloqueRaquideaPura })
    } else if (modalidadAnestesia === 'general') {
      bloquesNota.push({ hora: h2, texto: textoBloqueGeneralPura })
    } else if (modalidadAnestesia === 'fallo_raquidea') {
      bloquesNota.push({ hora: h2, texto: textoBloqueRaquideaPura })
      bloquesNota.push({ hora: hGenFallo, texto: textoBloqueGeneralFallo })
    }
  }

  novedades?.forEach(nov => {
    const hNov = nov.hora?.trim()
    const txtNov = nov.descripcion?.trim()
    if (hNov && txtNov) {
      bloquesNota.push({ hora: hNov, texto: `${hNov} Novedad intraoperatoria. ${txtNov}` })
    }
  })

  bloquesNota.sort((a, b) => horaAMinutos(a.hora) - horaAMinutos(b.hora))
  return bloquesNota.map(b => b.texto).join('\n\n')
}
