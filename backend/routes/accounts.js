const express = require('express')
const db = require('../config/db')

const router = express.Router()

const allowedTypes = [
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense',
]

const allowedNormalBalances = ['debit', 'credit']
const allowedStatuses = ['active', 'inactive']

function cleanText(value) {
  if (typeof value !== 'string') return null

  const result = value.trim()
  return result === '' ? null : result
}

function defaultNormalBalance(accountType) {
  if (accountType === 'asset' || accountType === 'expense') {
    return 'debit'
  }

  return 'credit'
}

async function getAccountById(id) {
  const [accounts] = await db.query(
    `
      SELECT
        accounts.id,
        accounts.code,
        accounts.name,
        accounts.type,
        accounts.normal_balance,
        accounts.opening_balance,
        accounts.current_balance,
        accounts.status,
        accounts.parent_id,
        parent.code AS parent_code,
        parent.name AS parent_name,
        accounts.created_at,
        accounts.updated_at
      FROM accounts
      LEFT JOIN accounts AS parent ON parent.id = accounts.parent_id
      WHERE accounts.id = ?
    `,
    [id],
  )

  return accounts[0] || null
}

/*
  GET /api/accounts
*/
router.get('/', async (req, res) => {
  try {
    const [accounts] = await db.query(`
      SELECT
        accounts.id,
        accounts.code,
        accounts.name,
        accounts.type,
        accounts.normal_balance,
        accounts.opening_balance,
        accounts.current_balance,
        accounts.status,
        accounts.parent_id,
        parent.code AS parent_code,
        parent.name AS parent_name,
        accounts.created_at,
        accounts.updated_at
      FROM accounts
      LEFT JOIN accounts AS parent ON parent.id = accounts.parent_id
      ORDER BY accounts.code ASC
    `)

    res.json({
      success: true,
      message: 'Data akun berhasil diambil',
      data: accounts,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data akun',
    })
  }
})

/*
  GET /api/accounts/:id
*/
router.get('/:id', async (req, res) => {
  try {
    const account = await getAccountById(req.params.id)

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Akun tidak ditemukan',
      })
    }

    res.json({
      success: true,
      message: 'Detail akun berhasil diambil',
      data: account,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail akun',
    })
  }
})

/*
  POST /api/accounts
*/
router.post('/', async (req, res) => {
  try {
    const {
      code,
      name,
      type,
      normal_balance,
      opening_balance,
      status,
      parent_id,
    } = req.body

    const accountCode = cleanText(code)
    const accountName = cleanText(name)
    const accountType = cleanText(type)
    const accountNormalBalance =
      cleanText(normal_balance) || defaultNormalBalance(accountType)
    const accountStatus = cleanText(status) || 'active'

    const openingBalance = Number(opening_balance ?? 0)

    const parentId =
      parent_id === null || parent_id === '' || parent_id === undefined
        ? null
        : Number.parseInt(parent_id, 10)

    if (!accountCode || !accountName || !accountType) {
      return res.status(422).json({
        success: false,
        message: 'Kode akun, nama akun, dan tipe akun wajib diisi',
      })
    }

    if (!allowedTypes.includes(accountType)) {
      return res.status(422).json({
        success: false,
        message: 'Tipe akun tidak valid',
      })
    }

    if (!allowedNormalBalances.includes(accountNormalBalance)) {
      return res.status(422).json({
        success: false,
        message: 'Normal balance harus debit atau credit',
      })
    }

    if (!allowedStatuses.includes(accountStatus)) {
      return res.status(422).json({
        success: false,
        message: 'Status akun harus active atau inactive',
      })
    }

    if (!Number.isFinite(openingBalance)) {
      return res.status(422).json({
        success: false,
        message: 'Saldo awal harus berupa angka',
      })
    }

    if (parentId !== null) {
      if (!Number.isInteger(parentId) || parentId <= 0) {
        return res.status(422).json({
          success: false,
          message: 'Parent account tidak valid',
        })
      }

      const parentAccount = await getAccountById(parentId)

      if (!parentAccount) {
        return res.status(422).json({
          success: false,
          message: 'Parent account tidak ditemukan',
        })
      }
    }

    const [result] = await db.query(
      `
        INSERT INTO accounts (
          code,
          name,
          type,
          normal_balance,
          opening_balance,
          current_balance,
          status,
          parent_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        accountCode,
        accountName,
        accountType,
        accountNormalBalance,
        openingBalance,
        openingBalance,
        accountStatus,
        parentId,
      ],
    )

    const newAccount = await getAccountById(result.insertId)

    res.status(201).json({
      success: true,
      message: 'Akun berhasil ditambahkan',
      data: newAccount,
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(422).json({
        success: false,
        message: 'Kode akun sudah digunakan',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan akun',
    })
  }
})

/*
  PUT /api/accounts/:id
*/
router.put('/:id', async (req, res) => {
  try {
    const accountId = Number.parseInt(req.params.id, 10)
    const existingAccount = await getAccountById(accountId)

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'Akun tidak ditemukan',
      })
    }

    const {
      code,
      name,
      type,
      normal_balance,
      opening_balance,
      status,
      parent_id,
    } = req.body

    const accountCode = cleanText(code)
    const accountName = cleanText(name)
    const accountType = cleanText(type)
    const accountNormalBalance =
      cleanText(normal_balance) || defaultNormalBalance(accountType)
    const accountStatus = cleanText(status) || 'active'

    const openingBalance = Number(opening_balance ?? 0)

    const parentId =
      parent_id === null || parent_id === '' || parent_id === undefined
        ? null
        : Number.parseInt(parent_id, 10)

    if (!accountCode || !accountName || !accountType) {
      return res.status(422).json({
        success: false,
        message: 'Kode akun, nama akun, dan tipe akun wajib diisi',
      })
    }

    if (!allowedTypes.includes(accountType)) {
      return res.status(422).json({
        success: false,
        message: 'Tipe akun tidak valid',
      })
    }

    if (!allowedNormalBalances.includes(accountNormalBalance)) {
      return res.status(422).json({
        success: false,
        message: 'Normal balance harus debit atau credit',
      })
    }

    if (!allowedStatuses.includes(accountStatus)) {
      return res.status(422).json({
        success: false,
        message: 'Status akun harus active atau inactive',
      })
    }

    if (!Number.isFinite(openingBalance)) {
      return res.status(422).json({
        success: false,
        message: 'Saldo awal harus berupa angka',
      })
    }

    if (parentId === accountId) {
      return res.status(422).json({
        success: false,
        message: 'Akun tidak boleh menjadi parent untuk dirinya sendiri',
      })
    }

    if (parentId !== null) {
      const parentAccount = await getAccountById(parentId)

      if (!parentAccount) {
        return res.status(422).json({
          success: false,
          message: 'Parent account tidak ditemukan',
        })
      }
    }

    const openingBalanceDelta =
      openingBalance - Number(existingAccount.opening_balance || 0)

    await db.query(
      `
        UPDATE accounts
        SET
          code = ?,
          name = ?,
          type = ?,
          normal_balance = ?,
          opening_balance = ?,
          current_balance = COALESCE(current_balance, 0) + ?,
          status = ?,
          parent_id = ?
        WHERE id = ?
      `,
      [
        accountCode,
        accountName,
        accountType,
        accountNormalBalance,
        openingBalance,
        openingBalanceDelta,
        accountStatus,
        parentId,
        accountId,
      ],
    )

    const updatedAccount = await getAccountById(accountId)

    res.json({
      success: true,
      message: 'Akun berhasil diperbarui',
      data: updatedAccount,
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(422).json({
        success: false,
        message: 'Kode akun sudah digunakan',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui akun',
    })
  }
})

/*
  DELETE /api/accounts/:id
*/
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM accounts WHERE id = ?',
      [req.params.id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Akun tidak ditemukan',
      })
    }

    res.json({
      success: true,
      message: 'Akun berhasil dihapus',
    })
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(422).json({
        success: false,
        message: 'Akun tidak dapat dihapus karena sudah dipakai oleh data lain',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menghapus akun',
    })
  }
})

module.exports = router
