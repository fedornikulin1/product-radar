'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function redirectAuthenticatedAdmin() {
      try {
        const response = await fetch('/api/admin/me', { cache: 'no-store' });
        const data = response.ok ? await response.json() : null;

        if (data?.isAdmin) {
          window.location.replace('/admin');
        }
      } catch {
        return;
      }
    }

    redirectAuthenticatedAdmin();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError('Неверный пароль');
        return;
      }

      const authCheck = await fetch('/api/admin/me', { cache: 'no-store' });
      const authData = authCheck.ok ? await authCheck.json() : null;

      if (!authData?.isAdmin) {
        setError('Вход выполнен, но сессия не сохранилась. Попробуйте ещё раз.');
        return;
      }

      window.location.replace('/admin');
    } catch {
      setError('Не удалось выполнить вход. Проверьте соединение и попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200"
      >
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white">
          <Link href="/" className="text-sm text-slate-300 hover:text-white">
            ← На главную
          </Link>

          <h1 className="mt-6 text-3xl font-black">
            Вход в админку
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Введите пароль администратора.
          </p>
        </div>

        <div className="p-6">
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </div>
      </form>
    </main>
  );
}
