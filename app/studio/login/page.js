import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/session'
import { login } from '../actions'

const MESSAGES = {
  salah: 'Password salah.',
  terkunci: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.',
}

export default async function LoginPage({ searchParams }) {
  if (await isAdmin()) redirect('/studio')
  const { gagal } = await searchParams

  return (
    <div className="login">
      <h1>Studio</h1>
      <form action={login} className="stack">
        <label>
          Password
          <input type="password" name="password" required autoFocus autoComplete="current-password" />
        </label>
        {MESSAGES[gagal] && <p role="alert" className="form-error">{MESSAGES[gagal]}</p>}
        <button type="submit">Masuk</button>
      </form>
    </div>
  )
}
