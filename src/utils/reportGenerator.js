import { horaAMinutos } from './timeUtils'
import { plantillasService } from '../services/plantillasService'

// ─── Motor de interpolación ───────────────────────────────────────────────────

function interpolate(template, ctx) {
  return (template || '').replace(/\{\{(\w+)\}\}/g, (_, key) => ctx[key] ?? '')
}

/**
 * Extrae la hora del primer placeholder de un template.
 * Todos los templates empiezan con {{hN}} o {{hAnestesiaGeneral}} / {{hBloqueo}}.
 */
function extraerHoraDeTemplate(template, ctx) {
  const match = template.match(/^\{\{(\w+)\}\}/)
  return match ? (ctx[match[1]] || '--:--') : '--:--'
}

// ─── Helpers de texto ─────────────────────────────────────────────────────────

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

// ─── Builders de valores computados ──────────────────────────────────────────

function buildConteoMaterial({ cGasas, cCompresas, cMechas, cCotonoides }) {
  const arr = []
  if (parseInt(cGasas) > 0) arr.push(`Gasas: ${cGasas}`)
  if (parseInt(cCompresas) > 0) arr.push(`Compresas: ${cCompresas}`)
  if (parseInt(cMechas) > 0) arr.push(`Mechas: ${cMechas}`)
  if (parseInt(cCotonoides) > 0) arr.push(`Cotonoides: ${cCotonoides}`)
  return arr.length > 0 ? arr.join(', ') : 'sin requerimiento de material blanco'
}

function buildMedsFinal({
  medicamentos = [],
  chkMorfina, dosMorfina,
  chkHidromorfona, dosHidromorfona,
  chkKetamina, dosKetamina,
  medsAdicional,
}) {
  const lista = [...medicamentos]
  if (chkMorfina) lista.push(`Morfina ${formatearDosisMg(dosMorfina)} EV`)
  if (chkHidromorfona) lista.push(`Hidromorfona ${formatearDosisMg(dosHidromorfona)} EV`)
  if (chkKetamina) lista.push(`Ketamina ${formatearDosisMg(dosKetamina)} EV`)
  if (medsAdicional?.trim()) lista.push(medsAdicional.trim())
  return lista.length > 0
    ? lista.join(', ')
    : 'sin novedades en la administración de medicamentos intraoperatorios'
}

function buildTextoPatologia({ muestraPatologia, nombreMuestra }) {
  if (muestraPatologia !== 'si') return ''
  const organo = nombreMuestra?.trim() || 'espécimen obtenido'
  return ` Se obtiene y recupera espécimen quirúrgico correspondiente a ${organo}; se realiza su rotulado con los datos de identificación correctos de la paciente, se preserva en solución de formol al 10% según directrices institucionales y se dispone de forma segura en el área de custodia para su envío definitivo al servicio de Patología.`
}

function buildStringAnestBloqueo({ volBloqueoLido, volBloqueoBupinest, volBloqueoBupirop }) {
  const lista = []
  const lido = volBloqueoLido?.trim()
  const bupinest = volBloqueoBupinest?.trim()
  const bupirop = volBloqueoBupirop?.trim()
  if (lido) lista.push(`Lidocaína 2% (${formatearVolumen(lido)})`)
  if (bupinest) lista.push(`Bupinest 0.75% (${formatearVolumen(bupinest)})`)
  if (bupirop) lista.push(`Bupirop 0.5% (${formatearVolumen(bupirop)})`)
  return lista.length > 0 ? lista.join(' y ') : 'anestésicos locales según protocolo'
}

// ─── Contexto de interpolación ────────────────────────────────────────────────

function buildContext(form, plantilla, textosDrenaje) {
  const {
    tipoCirugia,
    sala, cirujano, ayudante, anestesiologo, instrumentador,
    segundoCirujano, tipoReemplazo, lateralidadRodilla, casaMedica,
    calibre, ubicacionVena, miembro, placaBisturi,
    hIngreso: h1, hAnestesia: h2, hLavado: h3, hInicio: h4,
    hMedicacion: h5, hFinal: h6, hTraslado: h7,
    cGasas, cCompresas, cMechas, cCotonoides,
    modalidadAnestesia, anestApl, anestLocal, anestAnalgesico,
    hBloqueo, tipoBloqueo, lateralidadBloqueo,
    volBloqueoLido, volBloqueoBupinest, volBloqueoBupirop,
    medsAnestesia, tubo, gas, hAnestesiaGeneral,
    tipoDrenaje, muestraPatologia, nombreMuestra,
    sondaFoley, caracteristicaOrina,
    medicamentos, chkMorfina, dosMorfina,
    chkHidromorfona, dosHidromorfona,
    chkKetamina, dosKetamina, medsAdicional,
  } = form

  const stringConteoMaterial = buildConteoMaterial({ cGasas, cCompresas, cMechas, cCotonoides })
  const stringMedsFinal = buildMedsFinal({
    medicamentos, chkMorfina, dosMorfina,
    chkHidromorfona, dosHidromorfona,
    chkKetamina, dosKetamina, medsAdicional,
  })
  const textoDrenajeFinal = textosDrenaje?.[tipoDrenaje] ?? 'sin dejar drenajes,'
  const textoPatologiaFinal = buildTextoPatologia({ muestraPatologia, nombreMuestra })

  const personaLavado = tipoCirugia === 'reemplazo'
    ? (ayudante !== 'No aplica' ? ayudante : (segundoCirujano || cirujano))
    : (ayudante !== 'No aplica' ? ayudante : cirujano)
  const textoAyudante = ayudante !== 'No aplica' ? ` en conjunto con ${ayudante}` : ''
  const tipoReemplazoTexto = tipoReemplazo === 'primario'
    ? 'reemplazo total primario de rodilla'
    : 'revisión protésica de rodilla'
  const casa = casaMedica?.trim() || '---'
  const sufijoAnestesiaRecup = plantilla?.sufijoAnestesia?.[modalidadAnestesia] ?? ''
  const stringAnestBloqueo = buildStringAnestBloqueo({ volBloqueoLido, volBloqueoBupinest, volBloqueoBupirop })

  return {
    h1, h2, h3, h4, h5, h6, h7,
    hAnestesiaGeneral: hAnestesiaGeneral || '--:--',
    hBloqueo: hBloqueo || '--:--',
    sala, cirujano, ayudante, anestesiologo, instrumentador,
    segundoCirujano, lateralidadRodilla,
    calibre, ubicacionVena, miembro, placaBisturi,
    anestApl, anestLocal, anestAnalgesico,
    medsAnestesia: medsAnestesia || 'fármacos de protocolo',
    tubo, gas,
    tipoBloqueo, lateralidadBloqueo,
    sondaFoley, caracteristicaOrina,
    stringConteoMaterial,
    stringMedsFinal,
    textoDrenajeFinal,
    textoDrenajeFinalSinComa: textoDrenajeFinal.replace(',', ''),
    textoPatologiaFinal,
    personaLavado,
    textoAyudante,
    tipoReemplazoTexto,
    casa,
    sufijoAnestesiaRecup,
    stringAnestBloqueo,
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

export function validarFormulario(form) {
  const camposHorario = plantillasService.getCache()._config?.camposValidacion ?? []

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
  const plantillas = plantillasService.getCache()
  const plantilla = plantillas[form.tipoCirugia]
  if (!plantilla) return ''

  const anestesiaTemplates = plantillas._anestesia ?? {}
  const textosDrenaje = plantillas._config?.textosDrenaje ?? {}
  const ctx = buildContext(form, plantilla, textosDrenaje)

  const { tipoCirugia, modalidadAnestesia, mostrarBloqueo, novedades } = form
  const bloquesNota = []

  // Secciones del procedimiento
  for (const texto of Object.values(plantilla.secciones ?? {})) {
    if (!texto) continue
    const hora = extraerHoraDeTemplate(texto, ctx)
    bloquesNota.push({ hora, texto: interpolate(texto, ctx) })
  }

  // Bloques de anestesia
  const esReemplazo = tipoCirugia === 'reemplazo'
  const raquidaKey = esReemplazo ? 'raquidea_reemplazo' : 'raquidea'

  if (modalidadAnestesia === 'raquidea') {
    const t = anestesiaTemplates[raquidaKey]
    if (t) bloquesNota.push({ hora: ctx.h2, texto: interpolate(t, ctx) })
  } else if (modalidadAnestesia === 'general') {
    const t = anestesiaTemplates.general
    if (t) bloquesNota.push({ hora: ctx.h2, texto: interpolate(t, ctx) })
  } else if (modalidadAnestesia === 'fallo_raquidea') {
    const t1 = anestesiaTemplates[raquidaKey]
    const t2 = anestesiaTemplates.fallo_raquidea
    if (t1) bloquesNota.push({ hora: ctx.h2, texto: interpolate(t1, ctx) })
    if (t2) bloquesNota.push({ hora: ctx.hAnestesiaGeneral, texto: interpolate(t2, ctx) })
  }

  // Bloqueo anestésico regional (exclusivo reemplazo)
  if (esReemplazo && mostrarBloqueo) {
    const t = anestesiaTemplates.bloqueo
    if (t) bloquesNota.push({ hora: ctx.hBloqueo, texto: interpolate(t, ctx) })
  }

  // Novedades intraoperatorias
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
