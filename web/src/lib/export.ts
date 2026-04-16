import type { Transaction } from '../types/finance'
import { formatCurrency, formatDate } from './format'

function escapeCsvValue(value: string) {
  const normalized = value.replace(/\r?\n/g, ' ').replace(/"/g, '""')
  return `"${normalized}"`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function monthLabel(month: string) {
  const [year, monthIndex] = month.split('-').map(Number)
  const date = new Date(year, (monthIndex ?? 1) - 1, 1)
  const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function downloadFile(params: { filename: string; content: string; mime: string }) {
  const blob = new Blob([params.content], { type: params.mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = params.filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function exportTransactionsCsv(transactions: Transaction[], month: string) {
  const header = ['Descrição', 'Tipo', 'Status', 'Categoria', 'Data', 'Valor']
  const rows = transactions.map((t) => [
    escapeCsvValue(t.description ?? ''),
    escapeCsvValue(t.type === 'income' ? 'Receita' : 'Despesa'),
    escapeCsvValue(t.status === 'paid' ? 'Pago' : 'Pendente'),
    escapeCsvValue(t.category?.name ?? ''),
    escapeCsvValue(formatDate(t.transaction_date)),
    escapeCsvValue(String(t.amount ?? 0)),
  ])

  const csv = ['\uFEFF' + header.map(escapeCsvValue).join(';'), ...rows.map((r) => r.join(';'))].join('\n')
  const filename = `lancamentos-${month}.csv`

  downloadFile({ filename, content: csv, mime: 'text/csv;charset=utf-8' })
}

export function exportTransactionsPdf(transactions: Transaction[], month: string) {
  const income = transactions
    .filter((t) => t.status === 'paid' && t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  const expense = transactions
    .filter((t) => t.status === 'paid' && t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  const balance = income - expense

  const title = `Lançamentos • ${monthLabel(month)}`
  const rows = transactions
    .map((t) => {
      const type = t.type === 'income' ? 'Receita' : 'Despesa'
      const status = t.status === 'paid' ? 'Pago' : 'Pendente'
      const category = t.category?.name ?? '-'

      return `
        <tr>
          <td>${escapeHtml(t.description ?? '')}</td>
          <td>${escapeHtml(type)}</td>
          <td>${escapeHtml(status)}</td>
          <td>${escapeHtml(category)}</td>
          <td>${escapeHtml(formatDate(t.transaction_date))}</td>
          <td style="text-align:right">${escapeHtml(formatCurrency(Number(t.amount || 0)))}</td>
        </tr>
      `
    })
    .join('')

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        <style>
          :root { color-scheme: light; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 24px; color: #111827; }
          h1 { font-size: 18px; margin: 0 0 8px; }
          .meta { display: flex; gap: 16px; flex-wrap: wrap; color: #374151; font-size: 12px; margin: 0 0 16px; }
          .chip { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 999px; padding: 6px 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 8px; text-align: left; vertical-align: top; font-size: 12px; }
          th { text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; color: #6b7280; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">
          <span class="chip">Receitas pagas: ${escapeHtml(formatCurrency(income))}</span>
          <span class="chip">Despesas pagas: ${escapeHtml(formatCurrency(expense))}</span>
          <span class="chip">Saldo do mês: ${escapeHtml(formatCurrency(balance))}</span>
          <span class="chip">Total de lançamentos: ${escapeHtml(String(transactions.length))}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Categoria</th>
              <th>Data</th>
              <th style="text-align:right">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <script>
          window.addEventListener('load', () => {
            setTimeout(() => window.print(), 50)
          })
        </script>
      </body>
    </html>
  `

  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
}

