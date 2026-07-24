const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'gdrti-secret-2026';
const supabase = require('../db/supabase');
require('dotenv').config();

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email və şifrə tələb olunur' });

  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('is_active', true)
    .single();

  if (error || !employee) return res.status(401).json({ error: 'Email və ya şifrə yanlışdır' });

  const match = await bcrypt.compare(password, employee.password_hash);
  if (!match) return res.status(401).json({ error: 'Email və ya şifrə yanlışdır' });

  const token = jwt.sign(
    { id: employee.id, role: employee.role, sector_id: employee.sector_id, full_name: employee.full_name },
    SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: {
      id: employee.id,
      full_name: employee.full_name,
      role: employee.role,
      sector_id: employee.sector_id,
      position: employee.position,
      photo_url: employee.photo_url
    }
  });
});

// ADMIN YENİ İŞÇİ YARADIR (registration - qorunmalıdır, sonradan admin token tələb oluna bilər)
router.post('/register', async (req, res) => {
  const { full_name, email, password, position, sector_id, role, photo_url, phone } = req.body;
  if (!full_name || !email || !password) return res.status(400).json({ error: 'Ad, email və şifrə tələb olunur' });

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('employees')
    .insert([{
      full_name, email: email.toLowerCase().trim(), password_hash,
      position, sector_id, phone,
      role: role === 'admin' ? 'admin' : 'employee',
      photo_url: photo_url || null
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  delete data.password_hash;
  res.json(data);
});

// GOOGLE İLƏ GİRİŞ / QEYDİYYAT (işçilər üçün)
// Frontend Supabase Auth vasitəsilə Google ilə daxil olur, bura Supabase access_token göndərir.
// Biz onu Supabase-də doğrulayırıq, employees cədvəlində uyğun sətri tapır ya yaradırıq.
router.post('/google', async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ error: 'access_token tələb olunur' });

  const { data: googleUser, error: verifyError } = await supabase.auth.getUser(access_token);
  if (verifyError || !googleUser?.user) return res.status(401).json({ error: 'Google girişi doğrulanmadı' });

  const gUser = googleUser.user;
  const email = (gUser.email || '').toLowerCase().trim();
  if (!email) return res.status(400).json({ error: 'Google hesabında email tapılmadı' });

  const fullName = gUser.user_metadata?.full_name || gUser.user_metadata?.name || email.split('@')[0];
  const avatarUrl = gUser.user_metadata?.avatar_url || gUser.user_metadata?.picture || null;

  let { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', email)
    .single();

  if (!employee) {
    // Admin bu email-i sistemə əlavə etməyib — giriş rədd edilir (whitelist)
    return res.status(403).json({ error: 'Bu email üçün icazə yoxdur. Admin sizi sistemə əlavə etməyib — GDRTI rəhbərliyi ilə əlaqə saxlayın.' });
  } else if (!employee.is_active) {
    return res.status(403).json({ error: 'Bu hesab deaktiv edilib. Admin ilə əlaqə saxlayın.' });
  } else if (!employee.photo_url && avatarUrl) {
    // profil şəkli yoxdursa, Google avatarını götürək
    await supabase.from('employees').update({ photo_url: avatarUrl }).eq('id', employee.id);
    employee.photo_url = avatarUrl;
  }

  const token = jwt.sign(
    { id: employee.id, role: employee.role, sector_id: employee.sector_id, full_name: employee.full_name },
    SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: {
      id: employee.id,
      full_name: employee.full_name,
      role: employee.role,
      sector_id: employee.sector_id,
      position: employee.position,
      photo_url: employee.photo_url,
      pending: !employee.sector_id // sektor təyin olunmayıbsa, gözləmə vəziyyətindədir
    }
  });
});

// EMAIL WHITELIST YOXLAMA (OTP göndərməzdən əvvəl)
router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email tələb olunur' });

  const { data: emp } = await supabase
    .from('employees')
    .select('id, is_active, role')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (!emp) return res.status(403).json({ error: 'Bu email sistemdə qeydiyyatda deyil. Admin ilə əlaqə saxlayın.' });
  if (!emp.is_active) return res.status(403).json({ error: 'Bu hesab deaktiv edilib.' });
  res.json({ ok: true });
});

// SUPABASE SESSION → GDRTI JWT (OTP login + Google OAuth üçün universal endpoint)
router.post('/supabase-session', async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ error: 'access_token tələb olunur' });

  const { data: userData, error } = await supabase.auth.getUser(access_token);
  if (error || !userData?.user) return res.status(401).json({ error: 'Session etibarsızdır' });

  const email = (userData.user.email || '').toLowerCase().trim();
  if (!email) return res.status(400).json({ error: 'Email tapılmadı' });

  const fullName = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || email.split('@')[0];
  const avatarUrl = userData.user.user_metadata?.avatar_url || userData.user.user_metadata?.picture || null;

  let { data: emp } = await supabase.from('employees').select('*').eq('email', email).single();
  if (!emp) return res.status(403).json({ error: 'Bu email sistemdə qeydiyyatda deyil. Admin ilə əlaqə saxlayın.' });
  if (!emp.is_active) return res.status(403).json({ error: 'Bu hesab deaktiv edilib.' });

  // Profil şəklini güncəllə (Supabase-dən gəlirsə)
  if (!emp.photo_url && avatarUrl) {
    await supabase.from('employees').update({ photo_url: avatarUrl }).eq('id', emp.id);
    emp.photo_url = avatarUrl;
  }

  const token = jwt.sign(
    { id: emp.id, role: emp.role, sector_id: emp.sector_id, full_name: emp.full_name },
    SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: {
      id: emp.id, full_name: emp.full_name, role: emp.role,
      sector_id: emp.sector_id, position: emp.position, photo_url: emp.photo_url,
      email: emp.email
    }
  });
});

module.exports = router;
