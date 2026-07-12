export function horaAMinutos(horaStr) {
  const limpia = (horaStr || '').replace(/\s/g, '')
  if (!limpia || limpia === '--:--' || !limpia.includes(':')) return 9999
  const partes = limpia.split(':')
  return parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10)
}

export function formatearEntradaHora(valor) {
  let num = valor.replace(/:/g, '').trim()
  if (!num) return ''
  if (num.length === 3) num = '0' + num
  if (num.length === 4) {
    const hh = num.substring(0, 2)
    const mm = num.substring(2, 4)
    if (parseInt(hh) < 24 && parseInt(mm) < 60) {
      return `${hh}:${mm}`
    }
    return null // hora inválida
  }
  return valor
}

export function soloNumerosYColon(valor) {
  return valor.replace(/[^0-9:]/g, '')
}
