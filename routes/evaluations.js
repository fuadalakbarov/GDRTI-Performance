const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Qiymətləndirməyə icazəsi olan rollar
const CAN_EVALUATE = ['admin','director','deputy','sector_head'];
function canEvaluate(req, res, next) {
  if (CAN_EVALUATE.includes(req.user.role)) return next();
  return res.status(403).json({ error: 'Bu əməliyyat üçün icazəniz yoxdur' });
}


// Meyarlar siyahısı (qanuna uyğun)
const DEFAULT_EMP_CRITERIA = [
  { name: 'Peşə bilikləri', importance_pct: 17, is_manager_criterion: false, order_num: 1 },
  { name: 'Qulluq vəzifələrinə münasibəti', importance_pct: 17, is_manager_criterion: false, order_num: 2 },
  { name: 'Təhlil, problem həll etmək və qərar vermək bacarığı', importance_pct: 17, is_manager_criterion: false, order_num: 3 },
  { name: 'Yaradıcılıq və təşəbbüskarlıq', importance_pct: 17, is_manager_criterion: false, order_num: 4 },
  { name: 'İş təcrübəsi və onu bölüşmə', importance_pct: 16, is_manager_criterion: false, order_num: 5 },
  { name: 'Kollektivdə işləmək və ünsiyyət qurmaq bacarığı', importance_pct: 16, is_manager_criterion: false, order_num: 6 },
];

const DEFAULT_MGR_CRITERIA = [
  { name: 'Proqnozlaşdırma', importance_pct: 25, is_manager_criterion: true, order_num: 7 },
  { name: 'İdarəetmə', importance_pct: 25, is_manager_criterion: true, order_num: 8 },
  { name: 'Kollektiv daxilində nüfuz və ruhlandırmaq bacarığı', importance_pct: 25, is_manager_criterion: true, order_num: 9 },
  { name: 'Komanda qurmaq bacarığı', importance_pct: 25, is_manager_criterion: true, order_num: 10 },
];

// Yekun qiymət hesabla: YQ = T×50% + M×40% + ÄI×10%
async function recalculate(evalId) {
  const [{ data: tasks }, { data: criteria }, { data: ev }] = await Promise.all([
    supabase.from('evaluation_tasks').select('*').eq('evaluation_id', evalId),
    supabase.from('evaluation_criteria').select('*').eq('evaluation_id', evalId),
    supabase.from('evaluations').select('discipline_grade').eq('id', evalId).single()
  ]);

  // T = Σ (qiymət × mühümlük%)
  let T = 0;
  (tasks || []).filter(t => t.grade).forEach(t => {
    T += (t.grade * t.importance_pct) / 100;
  });

  // M = Σ (qiymət × mühümlük%)
  let M = 0;
  (criteria || []).filter(c => c.grade).forEach(c => {
    M += (c.grade * c.importance_pct) / 100;
  });

  // ÄI
  const AI = ev?.discipline_grade || 0;

  // YQ = T×50% + M×40% + ÄI×10%
  const YQ = T * 0.5 + M * 0.4 + AI * 0.1;

  await supabase.from('evaluations').update({
    task_score: Math.round(T * 100) / 100,
    criteria_score: Math.round(M * 100) / 100,
    final_score: Math.round(YQ * 100) / 100,
    updated_at: new Date().toISOString()
  }).eq('id', evalId);

  return { T, M, AI, YQ };
}

// ─── SIYAHI ──────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  let q = supabase.from('evaluations').select('*')
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });

  if (req.user.role !== 'admin') {
    q = q.or(`employee_id.eq.${req.user.id},evaluator_id.eq.${req.user.id}`);
  }
  const { data: evals, error } = await q;
  if (error) return res.status(400).json({ error: error.message });

  // İşçi məlumatlarını ayrıca çək
  const empIds = [...new Set([
    ...(evals||[]).map(e => e.employee_id),
    ...(evals||[]).map(e => e.evaluator_id)
  ].filter(Boolean))];

  const { data: emps } = empIds.length
    ? await supabase.from('employees').select('id,full_name,photo_url,position,sector_id').in('id', empIds)
    : { data: [] };

  const empMap = {};
  (emps||[]).forEach(e => empMap[e.id] = e);

  const result = (evals||[]).map(e => ({
    ...e,
    employee: empMap[e.employee_id] || null,
    evaluator: empMap[e.evaluator_id] || null
  }));

  res.json(result);
});

// ─── TAM MƏLUMAT ──────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  const [{ data: ev }, { data: tasks }, { data: criteria }] = await Promise.all([
    supabase.from('evaluations').select('*').eq('id', req.params.id).single(),
    supabase.from('evaluation_tasks').select('*').eq('evaluation_id', req.params.id).order('order_num'),
    supabase.from('evaluation_criteria').select('*').eq('evaluation_id', req.params.id).order('order_num')
  ]);
  if (!ev) return res.status(404).json({ error: 'Tapılmadı' });

  // İşçi məlumatı
  const empIds = [ev.employee_id, ev.evaluator_id].filter(Boolean);
  const { data: emps } = await supabase.from('employees')
    .select('id,full_name,photo_url,position,role,sector_id,sectors(name)').in('id', empIds);
  const empMap = {};
  (emps||[]).forEach(e => empMap[e.id] = e);

  res.json({
    ...ev,
    employee: empMap[ev.employee_id] || null,
    evaluator: empMap[ev.evaluator_id] || null,
    tasks: tasks || [],
    criteria: criteria || []
  });
});

// ─── YENİ QİYMƏTLƏNDİRMƏ YARAT ─────────────────────────────
router.post('/', verifyToken, canEvaluate, async (req, res) => {
  const { employee_id, year } = req.body;
  if (!employee_id) return res.status(400).json({ error: 'İşçi seçin' });
  const evalYear = year || new Date().getFullYear();

  // Əgər bu il üçün artıq varsa xəta
  const { data: existing } = await supabase.from('evaluations')
    .select('id').eq('employee_id', employee_id).eq('year', evalYear).single();
  if (existing) return res.status(409).json({ error: `${evalYear} ili üçün qiymətləndirmə artıq mövcuddur` });

  // Qiymətləndirilməni yarat
  const { data: ev, error } = await supabase.from('evaluations')
    .insert([{ employee_id, evaluator_id: req.user.id, year: evalYear, status: 'draft' }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });

  // İşçinin rolunu yoxla (rəhbər üçün əlavə meyarlar)
  const { data: emp } = await supabase.from('employees').select('role').eq('id', employee_id).single();
  const isManager = emp?.role === 'admin' || emp?.role === 'manager';

  const allCriteria = isManager
    ? [...DEFAULT_EMP_CRITERIA, ...DEFAULT_MGR_CRITERIA].map(c => ({...c, importance_pct: isManager ? (c.is_manager_criterion ? 10 : 10) : c.importance_pct}))
    : DEFAULT_EMP_CRITERIA;

  // Meyarları əlavə et
  const criteriaRows = allCriteria.map(c => ({ ...c, evaluation_id: ev.id }));
  await supabase.from('evaluation_criteria').insert(criteriaRows);

  res.json(ev);
});

// ─── TAPŞIRIQ ƏLAVƏ ET ──────────────────────────────────────
router.post('/:id/tasks', verifyToken, canEvaluate, async (req, res) => {
  const { title, description, importance_pct, deadline } = req.body;
  if (!title || !importance_pct) return res.status(400).json({ error: 'Başlıq və mühümlük dərəcəsi lazımdır' });

  // Mövcud tapşırıqların cəmi
  const { data: existing } = await supabase.from('evaluation_tasks')
    .select('importance_pct').eq('evaluation_id', req.params.id);
  const total = (existing || []).reduce((s, t) => s + Number(t.importance_pct), 0);
  if (total + Number(importance_pct) > 100) {
    return res.status(400).json({ error: `Mühümlük dərəcəsi 100%-i keçə bilməz. Mövcud: ${total}%` });
  }

  const { data, error } = await supabase.from('evaluation_tasks')
    .insert([{ evaluation_id: req.params.id, title, description, importance_pct, deadline: deadline || null,
      order_num: (existing || []).length + 1 }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ─── TAPŞIRIQ SİL ────────────────────────────────────────────
router.delete('/:id/tasks/:taskId', verifyToken, canEvaluate, async (req, res) => {
  await supabase.from('evaluation_tasks').delete()
    .eq('id', req.params.taskId).eq('evaluation_id', req.params.id);
  res.json({ success: true });
});

// ─── TAPŞIRIQ QİYMƏTLƏNDİR ──────────────────────────────────
router.patch('/:id/tasks/:taskId', verifyToken, canEvaluate, async (req, res) => {
  const { grade, grade_notes } = req.body;
  if (grade && (grade < 2 || grade > 5)) return res.status(400).json({ error: 'Qiymət 2-5 arasında olmalıdır' });
  const { data, error } = await supabase.from('evaluation_tasks')
    .update({ grade, grade_notes }).eq('id', req.params.taskId).select().single();
  if (error) return res.status(400).json({ error: error.message });
  await recalculate(req.params.id);
  res.json(data);
});

// ─── MEYAR QİYMƏTLƏNDİR ─────────────────────────────────────
router.patch('/:id/criteria/:critId', verifyToken, canEvaluate, async (req, res) => {
  const { grade, grade_notes, importance_pct } = req.body;
  const update = {};
  if (grade !== undefined) update.grade = grade;
  if (grade_notes !== undefined) update.grade_notes = grade_notes;
  if (importance_pct !== undefined) update.importance_pct = importance_pct;
  const { data, error } = await supabase.from('evaluation_criteria')
    .update(update).eq('id', req.params.critId).select().single();
  if (error) return res.status(400).json({ error: error.message });
  await recalculate(req.params.id);
  res.json(data);
});

// ─── ƏSR İNTİZAMI + RÜBLÜK QEYDLƏRİ YENILƏ ────────────────
router.patch('/:id', verifyToken, async (req, res) => {
  const allowed = ['discipline_grade','discipline_notes','q1_notes','q2_notes','q3_notes','q4_notes',
    'interview_notes','employee_comments','employee_agrees','status'];
  const update = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  update.updated_at = new Date().toISOString();
  if (update.status === 'completed') update.completed_at = new Date().toISOString();

  const { data, error } = await supabase.from('evaluations')
    .update(update).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  await recalculate(req.params.id);
  res.json(data);
});

// ─── SİL ─────────────────────────────────────────────────────
router.delete('/:id', verifyToken, canEvaluate, async (req, res) => {
  await supabase.from('evaluations').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
