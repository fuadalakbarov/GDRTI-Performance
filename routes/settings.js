const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Ayın işçisi al
router.get('/employee-of-month', verifyToken, async (req, res) => {
  const { data } = await supabase.from('app_settings').select('value').eq('key','employee_of_month').single();
  if (!data) return res.json(null);
  const emp_id = data.value?.employee_id;
  if (!emp_id) return res.json(null);
  const { data: emp } = await supabase.from('employees').select('id,full_name,photo_url,position,sector_id,sectors(name)').eq('id',emp_id).single();
  res.json({ ...data.value, employee: emp });
});

// Ayın işçisini təyin et (admin)
router.put('/employee-of-month', verifyToken, requireAdmin, async (req, res) => {
  const { employee_id, note, month } = req.body;
  if (!employee_id) return res.status(400).json({ error: 'İşçi seçin' });
  const value = { employee_id, note: note||'', month: month||(new Date().toISOString().slice(0,7)) };
  const { error } = await supabase.from('app_settings').upsert([{ key:'employee_of_month', value, updated_at:new Date().toISOString() }], { onConflict:'key' });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success:true });
});

module.exports = router;
