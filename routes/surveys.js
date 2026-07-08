const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Sorğu siyahısı
router.get('/', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('surveys')
    .select('*, employees(full_name)')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });

  // Hər sorğu üçün cavab sayı
  const result = await Promise.all((data||[]).map(async s => {
    const { count } = await supabase.from('survey_responses')
      .select('id', { count: 'exact', head: true }).eq('survey_id', s.id);
    const { data: myResp } = await supabase.from('survey_responses')
      .select('id').eq('survey_id', s.id).eq('respondent_id', req.user.id).single();
    return { ...s, response_count: count||0, i_responded: !!myResp };
  }));
  res.json(result);
});

// Sorğu + suallar
router.get('/:id', verifyToken, async (req, res) => {
  const { data: s } = await supabase.from('surveys').select('*').eq('id', req.params.id).single();
  if (!s) return res.status(404).json({ error: 'Sorğu tapılmadı' });
  const { data: questions } = await supabase.from('survey_questions')
    .select('*').eq('survey_id', req.params.id).order('order_num');
  res.json({ ...s, questions: questions||[] });
});

// Yarat (admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { title, description, questions, expires_at } = req.body;
  if (!title || !questions?.length) return res.status(400).json({ error: 'Başlıq və ən azı 1 sual tələb olunur' });
  const { data: s, error } = await supabase.from('surveys')
    .insert([{ title, description, expires_at: expires_at||null, created_by: req.user.id }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  const qs = questions.map((q, i) => ({ ...q, survey_id: s.id, order_num: i }));
  await supabase.from('survey_questions').insert(qs);
  res.json(s);
});

// Cavab göndər
router.post('/:id/respond', verifyToken, async (req, res) => {
  const { answers } = req.body;
  const { error } = await supabase.from('survey_responses')
    .upsert([{ survey_id: req.params.id, respondent_id: req.user.id, answers }],
      { onConflict: 'survey_id,respondent_id' });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// Nəticələr (admin)
router.get('/:id/results', verifyToken, requireAdmin, async (req, res) => {
  const { data: questions } = await supabase.from('survey_questions')
    .select('*').eq('survey_id', req.params.id).order('order_num');
  const { data: responses } = await supabase.from('survey_responses')
    .select('*, employees(full_name)').eq('survey_id', req.params.id);
  res.json({ questions: questions||[], responses: responses||[] });
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  await supabase.from('surveys').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
