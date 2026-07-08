const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { createNotification } = require('./notifications');

// Tapşırıq verə bilən rollar
const CAN_ASSIGN = ['admin', 'director', 'deputy', 'sector_head'];

function canAssign(req, res, next) {
  if (CAN_ASSIGN.includes(req.user.role)) return next();
  return res.status(403).json({ error: 'Tapşırıq vermək icazəniz yoxdur' });
}

// TAPŞIRIQ TƏYİN ET (müdir/müavin/sektor müdiri)
router.post('/', verifyToken, canAssign, async (req, res) => {
  const { employee_id, title, description, due_date, priority } = req.body;
  if (!employee_id || !title) return res.status(400).json({ error: 'İşçi və başlıq tələb olunur' });

  // Sektor müdiri yalnız öz sektoruna tapşırıq verə bilər
  if (req.user.role === 'sector_head') {
    const { data: emp } = await supabase.from('employees')
      .select('sector_id').eq('id', employee_id).single();
    if (!emp || emp.sector_id !== req.user.sector_id) {
      return res.status(403).json({ error: 'Siz yalnız öz sektorunuzun işçilərinə tapşırıq verə bilərsiniz' });
    }
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ employee_id, assigned_by: req.user.id, title, description, due_date,
      status: 'pending', priority: priority||'medium' }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });

  if (due_date) {
    await supabase.from('calendar_events').insert([{
      employee_id, created_by: req.user.id, type: 'deadline',
      title: `📌 Son tarix: ${title}`, description: description || null, event_date: due_date
    }]).select();
  }

  const prioLabel = { high:'🔴 Yüksək', medium:'🟡 Orta', low:'🟢 Aşağı' };
  await createNotification(employee_id, 'task',
    `📋 Yeni tapşırıq: ${title}`,
    `Prioritet: ${prioLabel[priority||'medium']} ${due_date?'· Son tarix: '+due_date:''}`,
    '/my-dashboard.html');

  res.json(data);
});

// İŞÇİ: ÖZ TAPŞIRIQLARI
router.get('/mine', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('tasks').select('*').eq('employee_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// STATUS DƏYİŞ (işçi öz tapşırığını yeniləyə bilər, admin hamısını)
router.patch('/:id/status', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['pending', 'in_progress', 'completed', 'overdue', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Yanlış status' });

  const { data: task } = await supabase.from('tasks').select('*').eq('id', id).single();
  if (!task) return res.status(404).json({ error: 'Tapşırıq tapılmadı' });
  if (req.user.role !== 'admin' && task.employee_id !== req.user.id) {
    return res.status(403).json({ error: 'İcazə yoxdur' });
  }

  const update = { status };
  if (status === 'completed') update.completed_at = new Date().toISOString();

  const { data, error } = await supabase.from('tasks').update(update).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ADMIN: KEYFİYYƏT BALI VER
router.patch('/:id/quality', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { quality_score } = req.body;
  if (quality_score < 0 || quality_score > 100) return res.status(400).json({ error: '0-100 arası olmalıdır' });

  const { data, error } = await supabase.from('tasks').update({ quality_score }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { error } = await supabase.from('tasks').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// ADMIN: TAPŞIRIQ ÜÇÜN XATIRLATMA GÖNDƏR (avtomatik mesaj)
router.post('/:id/remind', verifyToken, requireAdmin, async (req, res) => {
  const { data: task } = await supabase.from('tasks').select('*').eq('id', req.params.id).single();
  if (!task) return res.status(404).json({ error: 'Tapşırıq tapılmadı' });

  const dueText = task.due_date ? `Son tarix: ${task.due_date}.` : '';
  const content = `⏰ Xatırlatma: "${task.title}" tapşırığı hələ tamamlanmayıb. ${dueText}`.trim();

  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id: req.user.id, receiver_id: task.employee_id, content }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
