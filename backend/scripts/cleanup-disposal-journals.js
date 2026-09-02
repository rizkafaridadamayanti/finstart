/*
  cleanup-disposal-journals.js

  Menghapus jurnal pelepasan aset ("DISP-*", source_type = 'asset_disposal')
  yang terlanjur dibuat oleh versi lama route POST /assets/:id/dispose sebelum
  commit "Hapus aset tetap tidak lagi otomatis membuat jurnal pelepasan".

  Skrip ini juga membalik dampak jurnal itu ke saldo akun (accounts.current_balance),
  memakai rumus yang sama dengan updateAccountBalance() di routes/assets.js versi lama:

    delta = normal_balance === 'debit' ? (debit - credit) : (credit - debit)
    current_balance += delta        // yang dilakukan kode lama saat posting

  Jadi untuk membatalkannya kita kurangi lagi: current_balance -= delta.

  Pemakaian:
    node scripts/cleanup-disposal-journals.js            # dry-run, tidak mengubah apa pun
    node scripts/cleanup-disposal-journals.js --apply    # benar-benar hapus + koreksi saldo

  Status aset yang sudah "disposed" TIDAK diubah - pelepasan aset memang tetap
  menandai aset sebagai dilepas, hanya saja tanpa jurnal.
*/

require('dotenv').config()
const db = require('../config/db')

const APPLY = process.argv.includes('--apply')

function money(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100
}

async function main() {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const [entries] = await connection.query(
      `
        SELECT id, voucher_number, transaction_date, description, source_type, source_id, status, created_at
        FROM journal_entries
        WHERE source_type = 'asset_disposal' OR voucher_number LIKE 'DISP-%'
        ORDER BY id
        FOR UPDATE
      `,
    )

    if (entries.length === 0) {
      console.log('Tidak ada jurnal pelepasan aset (DISP-*) di database ini. Tidak ada yang perlu dibersihkan.')
      await connection.rollback()
      return
    }

    console.log(`Ditemukan ${entries.length} jurnal pelepasan aset:\n`)

    const balanceAdjustments = new Map() // accountId -> total delta to subtract

    for (const entry of entries) {
      const [lines] = await connection.query(
        `
          SELECT jl.id, jl.account_id, jl.debit, jl.credit,
                 a.code AS account_code, a.name AS account_name, a.normal_balance
          FROM journal_lines jl
          JOIN accounts a ON a.id = jl.account_id
          WHERE jl.journal_entry_id = ?
          ORDER BY jl.id
        `,
        [entry.id],
      )

      console.log(`  #${entry.id}  ${entry.voucher_number}  (${String(entry.transaction_date).slice(0, 10)}, dibuat ${entry.created_at})`)
      console.log(`      ${entry.description || '-'}`)

      for (const line of lines) {
        const debit = money(line.debit)
        const credit = money(line.credit)
        const delta = line.normal_balance === 'debit' ? debit - credit : credit - debit
        const prev = balanceAdjustments.get(line.account_id) || { code: line.account_code, name: line.account_name, delta: 0 }
        prev.delta = money(prev.delta + delta)
        balanceAdjustments.set(line.account_id, prev)
        console.log(
          `      - ${line.account_code} ${line.account_name}: D ${debit.toLocaleString('id-ID')} / K ${credit.toLocaleString('id-ID')}  -> koreksi saldo ${(-delta).toLocaleString('id-ID')}`,
        )
      }
      console.log('')
    }

    console.log('Ringkasan perubahan saldo akun (current_balance akan berubah sebesar):')
    for (const [, info] of balanceAdjustments) {
      const change = money(-info.delta)
      console.log(`  ${info.code} ${info.name}: ${change > 0 ? '+' : ''}${change.toLocaleString('id-ID')}`)
    }
    console.log('')

    if (!APPLY) {
      console.log('DRY-RUN. Tidak ada perubahan yang disimpan.')
      console.log('Jalankan ulang dengan --apply untuk benar-benar menghapus jurnal & mengoreksi saldo.')
      await connection.rollback()
      return
    }

    const entryIds = entries.map((e) => e.id)

    // 1. Balik dampak ke saldo akun.
    for (const [accountId, info] of balanceAdjustments) {
      await connection.query(
        'UPDATE accounts SET current_balance = current_balance - ? WHERE id = ?',
        [info.delta, accountId],
      )
    }

    // 2. Hapus baris jurnal lalu header jurnalnya.
    await connection.query('DELETE FROM journal_lines WHERE journal_entry_id IN (?)', [entryIds])
    const [del] = await connection.query('DELETE FROM journal_entries WHERE id IN (?)', [entryIds])

    await connection.commit()
    console.log(`Selesai. ${del.affectedRows} jurnal pelepasan aset dihapus dan saldo ${balanceAdjustments.size} akun dikoreksi.`)
  } catch (error) {
    await connection.rollback()
    console.error('Gagal membersihkan jurnal pelepasan aset:', error)
    process.exitCode = 1
  } finally {
    connection.release()
    await db.end()
  }
}

main()
