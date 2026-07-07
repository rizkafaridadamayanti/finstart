async function writeActivity(executor, { userId = null, activity, description = null, module = null, referenceId = null }) {
  if (!executor || !activity) return
  await executor.query(
    `INSERT INTO activity_logs (user_id, activity, description, module, reference_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, String(activity).slice(0, 150), description, module, referenceId || null],
  )
}

async function writeNotification(executor, { userId = null, title, message, type = 'info', referenceType = null, referenceId = null }) {
  if (!executor || !userId || !title || !message) return
  await executor.query(
    `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, String(title).slice(0, 150), message, String(type).slice(0, 50), referenceType, referenceId || null],
  )
}

async function safeAudit(executor, payload) {
  try {
    await writeActivity(executor, payload)
    if (payload?.notification) {
      await writeNotification(executor, {
        userId: payload.userId,
        ...payload.notification,
        referenceId: payload.referenceId,
      })
    }
  } catch (error) {
    // Audit tidak boleh menggagalkan transaksi utama; error tetap terlihat di server.
    console.warn('[audit] gagal menyimpan aktivitas:', error.message)
  }
}

module.exports = { writeActivity, writeNotification, safeAudit }
