const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { calcEmployeePoints } = require('./_points');

// ADMIN YENİ İŞÇİNİ WHITELIST-Ə ƏLAVƏ EDİR (şifrəsiz — işçi Google ilə öz email-i ilə daxil olacaq)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { full_name, email, sector_id, position, phone, role } = req.body;
  if (!full_name || !email) return res.status(400).json({ error: 'Ad və email tələb olunur' });

  const cleanEmail = email.toLowerCase().trim();
  const { data: existing } = await supabase.from('employees').select('id').eq('email', cleanEmail).single();
  if (existing) return res.status(409).json({ error: 'Bu email artıq sistemdə var' });

  const validRoles = ['admin','director','deputy','sector_head','employee'];
  const empRole = validRoles.includes(role) ? role : 'employee';

  const { data, error } = await supabase
    .from('employees')
    .insert([{
      full_name, email: cleanEmail, sector_id: sector_id || null, position, phone,
      role: empRole, password_hash: null, auth_provider: 'google', is_active: true
    }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ÜNSİYYƏT SİYAHISI (mesajlaşma üçün — bütün girişli istifadəçilər görə bilər, həssas məlumat yoxdur)
router.get('/contacts', verifyToken, async (req, res) => {
  let q = supabase.from('employees')
    .select('id, full_name, position, photo_url, role, sector_id, email')
    .eq('is_active', true).order('full_name');

  // Sektor müdiri yalnız öz sektorunun işçilərini görür
  if (req.user.role === 'sector_head' && req.user.sector_id) {
    q = q.eq('sector_id', req.user.sector_id);
  }

  const { data, error } = await q;
  if (error) return res.status(400).json({ error: error.message });

  // Dublikat email-ləri sil, öz istifadəçini çıxar
  const seen = new Set();
  const unique = (data || []).filter(e => {
    if (e.id === req.user.id) return false;
    if (seen.has(e.email)) return false;
    seen.add(e.email);
    return true;
  });
  res.json(unique);
});

// ÖZ PROFİLİMİ YENİLƏ (şəkil, telefon — hər kəs özününkü üçün)
router.patch('/me', verifyToken, async (req, res) => {
  const { photo_url, phone, full_name } = req.body;
  const update = {};
  if (photo_url !== undefined) update.photo_url = photo_url;
  if (phone !== undefined) update.phone = phone;
  if (full_name) update.full_name = full_name;

  const { data, error } = await supabase
    .from('employees')
    .update(update)
    .eq('id', req.user.id)
    .select('id, full_name, position, email, role, photo_url, sector_id, phone')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// BÜTÜN İŞÇİLƏR (admin üçün ümumi siyahı, sektor üzrə qruplaşdırılmadan)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  const { data: employees, error } = await supabase
    .from('employees')
    .select('id, full_name, position, email, role, photo_url, sector_id, is_active, phone')
    .order('full_name');
  if (error) return res.status(400).json({ error: error.message });
  res.json(employees);
});

// TƏK İŞÇİ PROFİLİ (öz tapşırıqları, balı ilə)
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ error: 'İcazə yoxdur' });
  }
  const { data: emp, error } = await supabase
    .from('employees')
    .select('id, full_name, position, email, role, photo_url, sector_id, phone')
    .eq('id', id).single();
  if (error) return res.status(404).json({ error: 'İşçi tapılmadı' });

  const { data: tasks } = await supabase.from('tasks').select('*').eq('employee_id', id).order('created_at', { ascending: false });

  res.json({ ...emp, tasks, stats: calcEmployeePoints(tasks || []) });
});

// İŞÇİNİ YENİLƏ (admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { full_name, position, sector_id, photo_url, phone, is_active } = req.body;
  const { data, error } = await supabase
    .from('employees')
    .update({ full_name, position, sector_id, photo_url, phone, is_active })
    .eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('employees').update({ is_active: false }).eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
