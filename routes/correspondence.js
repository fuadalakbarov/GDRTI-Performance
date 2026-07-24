const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const MGR = ['admin', 'director', 'deputy'];
const isMgr = u => MGR.includes(u.role);

// ─── SİYAHI ──────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  let q = supabase.from('correspondence').select('*').order('received_at', { ascending: false });
  if (req.user.role === 'sector_head') q = q.eq('sector_id', req.user.sector_id);
  else if (!isMgr(req.user)) q = q.eq('assigned_employee_id', req.user.id);

  const { data, error } = await q;
  if (error) return res.status(400).json({ error: error.message });

  const empIds = [...new Set((data || []).flatMap(c => [c.assigned_employee_id, c.resolution_by, c.reply_by]).filter(Boolean))];
  const secIds = [...new Set((data || []).map(c => c.sector_id).filter(Boolean))];

  const [{ data: emps }, { data: secs }] = await Promise.all([
    empIds.length ? supabase.from('employees').select('id,full_name,photo_url').in('id', empIds) : { data: [] },
    secIds.length ? supabase.from('sectors').select('id,name,color').in('id', secIds) : { data: [] },
  ]);

  const eMap = {}; (emps || []).forEach(e => eMap[e.id] = e);
  const sMap = {}; (secs || []).forEach(s => sMap[s.id] = s);

  res.json((data || []).map(c => ({
    ...c,
    employee: eMap[c.assigned_employee_id] || null,
    resolver: eMap[c.resolution_by] || null,
    replier:  eMap[c.reply_by] || null,
    sector:   sMap[c.sector_id] || null,
  })));
});

// ─── 1) MƏKTUB ƏLAVƏ ET (rəhbər) ────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  if (!isMgr(req.user)) return res.status(403).json({ error: 'İcazə yoxdur' });
  const { source, sender_email, reg_number, subject, body, received_at } = req.body;
  if (!subject || !subject.trim()) return res.status(400).json({ error: 'Mövzu tələb olunur' });

  const { data, error } = await supabase.from('correspondence').insert([{
    source: source || 'MUTDA',
    sender_email, reg_number,
    subject: subject.trim(), body,
    received_at: received_at || new Date().toISOString(),
    status: 'yeni'
  }]).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ─── 2) DƏRKƏNAR QOY (rəhbər → koordinator) ─────────────────
router.patch('/:id/resolution', verifyToken, async (req, res) => {
  if (!isMgr(req.user)) return res.status(403).json({ error: 'İcazə yoxdur' });
  const { resolution, coordinator_id, due_date } = req.body;

  const upd = {
    resolution,
    resolution_by: req.user.id,
    resolution_at: new Date().toISOString(),
    status: 'derkenar'
  };
  if (coordinator_id) upd.coordinator_id = coordinator_id;
  if (due_date) upd.due_date = due_date;

  const { data, error } = await supabase.from('correspondence')
    .update(upd).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });

  if (coordinator_id) {
    await createNotification(coordinator_id, 'letter', 'Yeni dərkənar', data.subject, '/correspondence.html');
  }
  res.json(data);
});

// ─── 3) SEKTORA YÖNLƏNDİR ───────────────────────────────────
router.patch('/:id/route', verifyToken, async (req, res) => {
  const { sector_id } = req.body;
  if (!sector_id) return res.status(400).json({ error: 'Sektor seçin' });

  const { data, error } = await supabase.from('correspondence')
    .update({ sector_id, status: 'sektorda' })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });

  const { data: heads } = await supabase.from('employees')
    .select('id').eq('sector_id', sector_id).eq('role', 'sector_head');
  for (const h of heads || []) {
    await createNotification(h.id, 'letter', 'Sektorunuza məktub yönləndirildi', data.subject, '/correspondence.html');
  }
  res.json(data);
});

// ─── 4) İŞÇİYƏ VER → TAPŞIRIQ YARADIR ───────────────────────
router.patch('/:id/assign', verifyToken, async (req, res) => {
  const { employee_id, due_date, note } = req.body;
  if (!employee_id) return res.status(400).json({ error: 'İşçi seçin' });

  const { data: corr } = await supabase.from('correspondence')
    .select('*').eq('id', req.params.id).single();
  if (!corr) return res.status(404).json({ error: 'Məktub tapılmadı' });

  const descParts = [];
  if (corr.body) descParts.push(corr.body);
  if (corr.resolution) descParts.push('— Dərkənar: ' + corr.resolution);
  if (note) descParts.push('— Qeyd: ' + note);

  const { data: task, error: tErr } = await supabase.from('tasks').insert([{
    title: 'Məktub: ' + corr.subject,
    description: descParts.join('\n\n'),
    assigned_to: employee_id,
    created_by: req.user.id,
    sector_id: corr.sector_id,
    status: 'pending',
    due_date: due_date || corr.due_date,
  }]).select().single();
  if (tErr) return res.status(400).json({ error: tErr.message });

  const { data, error } = await supabase.from('correspondence').update({
    assigned_employee_id: employee_id,
    task_id: task.id,
    due_date: due_date || corr.due_date,
    status: 'iscide'
  }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });

  await createNotification(employee_id, 'task', 'Yeni tapşırıq (məktub üzrə)', corr.subject, '/my-dashboard.html');
  res.json({ ...data, task });
});

// ─── 5) İŞÇİ CAVAB YAZIR ────────────────────────────────────
router.patch('/:id/reply', verifyToken, async (req, res) => {
  const { reply_body, send_to } = req.body;
  if (!reply_body || !reply_body.trim()) return res.status(400).json({ error: 'Cavab mətni boşdur' });

  const { data, error } = await supabase.from('correspondence').update({
    reply_body: reply_body.trim(),
    reply_by: req.user.id,
    reply_at: new Date().toISOString(),
    status: 'cavab'
  }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });

  if (data.task_id) {
    await supabase.from('tasks').update({ status: 'completed' }).eq('id', data.task_id);
  }

  const { data: mgrs } = await supabase.from('employees').select('id').in('role', MGR);
  for (const m of mgrs || []) {
    await createNotification(m.id, 'letter', 'Məktuba cavab hazırdır', data.subject, '/correspondence.html');
  }

  if (send_to && process.env.SMTP_HOST) {
    try {
      const nodemailer = require('nodemailer');
      const t = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: String(process.env.SMTP_PORT || '465') === '465',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await t.sendMail({
        from: process.env.SMTP_USER,
        to: send_to,
        subject: 'Cavab: ' + data.subject + (data.reg_number ? ' (No ' + data.reg_number + ')' : ''),
        text: reply_body
      });
    } catch (e) { console.error('SMTP:', e.message); }
  }
  res.json(data);
});

// ─── 6) TAMAMLA ─────────────────────────────────────────────
router.patch('/:id/complete', verifyToken, async (req, res) => {
  if (!isMgr(req.user)) return res.status(403).json({ error: 'İcazə yoxdur' });
  const { data, error } = await supabase.from('correspondence')
    .update({ status: 'tamamlandi' }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ─── SİL ────────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  if (!isMgr(req.user)) return res.status(403).json({ error: 'İcazə yoxdur' });
  await supabase.from('correspondence').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
