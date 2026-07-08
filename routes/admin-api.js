const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { calcEmployeePoints } = require('./_points');

// Hər 3 cədvəli paralel çəkib JavaScript-də birləşdiririk
async function fetchBase() {
  const [{ data: tasks }, { data: employees }, { data: sectors }] = await Promise.all([
    supabase.from('tasks').select('*').order('created_at', { ascending: false }),
    supabase.from('employees').select('id, full_name, photo_url, position, sector_id, is_active').eq('is_active', true),
    supabase.from('sectors').select('id, name')
  ]);
  const sMap = {};
  (sectors || []).forEach(s => sMap[s.id] = s);
  const eMap = {};
  (employees || []).forEach(e => eMap[e.id] = { ...e, sectors: sMap[e.sector_id] || null });
  return { tasks: tasks || [], eMap };
}

// Admin: bütün tapşırıqlar + işçi məlumatı
router.get('/tasks', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { tasks, eMap } = await fetchBase();
    const result = tasks.map(t => ({ ...t, employees: eMap[t.employee_id] || null }));
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin: bütün işçilərin statistikası
router.get('/employee-stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { tasks, eMap } = await fetchBase();
    const result = Object.values(eMap).map(emp => {
      const empTasks = tasks.filter(t => t.employee_id === emp.id);
      return { ...emp, stats: calcEmployeePoints(empTasks), task_count: empTasks.length };
    });
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

