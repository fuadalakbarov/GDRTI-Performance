const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Aktiv elanlar (hamı görür)
router.get('/', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('announcements')
    .select('*, employees(full_name)')
    .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString().slice(0,10)}`)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Elan yarat (admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { title, body, is_pinned, expires_at } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Başlıq və mətn tələb olunur' });
  const { data, error } = await supabase.from('announcements')
    .insert([{ title, body, is_pinned: !!is_pinned, expires_at: expires_at || null, created_by: req.user.id }])
    .select('*, employees(full_name)').single();
  if (error) return res.status(400).json({ error: error.message });

  // Bütün işçilərə bildiriş göndər (roluna görə düzgün link)
  const { createNotification } = require('./notifications');
  const { data: emps } = await supabase.from('employees').select('id, role').eq('is_active', true);
  await Promise.all((emps||[]).map(e => {
    const link = e.role === 'admin' ? '/admin.html' : '/my-dashboard.html';
    return createNotification(e.id, 'announcement', `📣 ${title}`, body, link);
  }));

  res.json(data);
});

// Elanı sil (admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  await supabase.from('announcements').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
