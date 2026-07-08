const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  let query = supabase.from('goals').select('*').order('created_at', { ascending: false });
  if (req.user.role !== 'admin') {
    query = query.or(`assigned_to.eq.${req.user.id},sector_id.eq.${req.user.sector_id||'00000000-0000-0000-0000-000000000000'}`);
  }
  const { data: goals, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  // İşçi və sektor məlumatını ayrıca yüklə (FK join adı məsələsini keçirik)
  const enriched = await Promise.all((goals||[]).map(async g => {
    let empData = null, sectorData = null;
    if (g.assigned_to) {
      const { data } = await supabase.from('employees').select('full_name, photo_url').eq('id', g.assigned_to).single();
      empData = data;
    }
    if (g.sector_id) {
      const { data } = await supabase.from('sectors').select('name').eq('id', g.sector_id).single();
      sectorData = data;
    }
    return { ...g, employees: empData, sectors: sectorData };
  }));

  res.json(enriched);
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { title, description, assigned_to, sector_id, target_value, unit, period, due_date } = req.body;
  if (!title || !target_value) return res.status(400).json({ error: 'Başlıq və hədəf dəyər tələb olunur' });
  const { data, error } = await supabase.from('goals')
    .insert([{ title, description, assigned_to: assigned_to||null, sector_id: sector_id||null,
      target_value, unit: unit||'%', period: period||'2026-Q3', due_date: due_date||null,
      created_by: req.user.id }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// İrəliləyiş yenilə
router.patch('/:id/progress', verifyToken, async (req, res) => {
  const { current_value } = req.body;
  const { data: goal } = await supabase.from('goals').select('*').eq('id', req.params.id).single();
  if (!goal) return res.status(404).json({ error: 'Tapılmadı' });
  if (goal.assigned_to !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  const status = current_value >= goal.target_value ? 'completed' : 'active';
  const { data, error } = await supabase.from('goals')
    .update({ current_value, status }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  await supabase.from('goals').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
