// Status simpan seluruh Studio. Satu penyimpan per form, satu bar status yang membaca semuanya.
export const WAIT_MS = 800

const RANK = ['failed', 'invalid', 'saving', 'dirty', 'draft']
const IDLE = { state: 'saved', message: '', savedAt: null }
const entries = new Map()
const listeners = new Set()
let status = IDLE

function publish(savedAt = status.savedAt) {
  const all = [...entries.values()]
  const top = RANK.map((state) => all.find((entry) => entry.state === state)).find(Boolean)
  status = { state: top?.state ?? 'saved', message: top?.message ?? '', savedAt }
  listeners.forEach((listener) => listener())
}

export function report(key, state, extra) {
  if (state) entries.set(key, { state, ...extra })
  else entries.delete(key)
  publish()
}

export function retryAll() {
  for (const entry of [...entries.values()]) entry.retry?.()
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getStatus = () => status
export const getIdleStatus = () => IDLE

export function createSaver({ key, isValid, send, wait = WAIT_MS }) {
  let timer = null
  let running = false
  let again = false

  async function run() {
    clearTimeout(timer)
    timer = null
    if (running) {
      again = true
      return
    }
    if (!isValid()) return report(key, 'invalid', { message: 'Ada isian wajib yang kosong, belum tersimpan.' })

    running = true
    report(key, 'saving')
    let failure = null
    try {
      await send()
    } catch (error) {
      failure = error
    }
    running = false

    // Isi berubah selama permintaan berjalan: yang baru harus ikut terkirim.
    if (again) {
      again = false
      return run()
    }
    if (timer) return report(key, 'dirty')
    if (failure) return report(key, 'failed', { message: failure.message, retry: run })
    entries.delete(key)
    publish(new Date())
  }

  const flush = () => {
    if (timer) run()
  }

  return {
    change() {
      report(key, 'dirty')
      clearTimeout(timer)
      timer = setTimeout(run, wait)
    },
    flush,
    // Isian kosong tidak bisa disimpan, jadi tidak boleh menggantung di bar setelah form hilang.
    stop() {
      flush()
      if (entries.get(key)?.state === 'invalid') report(key, null)
    },
  }
}
