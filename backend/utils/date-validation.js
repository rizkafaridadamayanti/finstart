function isValidDate(value) {
  const dateText = String(value || '')

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return false
  }

  const date = new Date(`${dateText}T00:00:00Z`)

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateText
  )
}

function isValidOptionalDate(value) {
  return !value || isValidDate(value)
}

function isValidPeriod(value) {
  const periodText = String(value || '')

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodText)) {
    return false
  }

  const [year, month] = periodText.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1))

  return date.toISOString().slice(0, 7) === periodText
}

function zonedDateParts(value = new Date(), timeZone = 'Asia/Jakarta') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value)

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    year: map.year,
    month: map.month,
    day: map.day,
  }
}

function todayInJakarta(value = new Date()) {
  const { year, month, day } = zonedDateParts(value)
  return `${year}-${month}-${day}`
}

function currentPeriodInJakarta(value = new Date()) {
  const { year, month } = zonedDateParts(value)
  return `${year}-${month}`
}

module.exports = {
  currentPeriodInJakarta,
  isValidDate,
  isValidOptionalDate,
  isValidPeriod,
  todayInJakarta,
}
