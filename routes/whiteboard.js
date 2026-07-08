const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken } = require('../middleware/auth');

// ─── BOARDS ──────────────────────────────────────────────────
router.get('/boards', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('wb_boards')
    .select('*, employees(full_name,photo_url)')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data || []);
});

router.post('/boards', verifyToken, async (req, res) => {
  const { title, description } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Başlıq tələb olunur' });
  const { data, error } = await supabase.from('wb_boards')
    .insert([{ title: title.trim(), description, created_by: req.user.id }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/boards/:id', verifyToken, async (req, res) => {
  const { data: board } = await supabase.from('wb_boards').select('created_by').eq('id', req.params.id).single();
  if (board?.created_by !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  await supabase.from('wb_boards').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ─── CARDS ───────────────────────────────────────────────────
router.get('/boards/:id/cards', verifyToken, async (req, res) => {
  const [{ data: cards }, { data: comments }] = await Promise.all([
    supabase.from('wb_cards')
      .select('*, employees(full_name,photo_url)')
      .eq('board_id', req.params.id)
      .order('created_at'),
    supabase.from('wb_comments')
      .select('card_id')
      .in('card_id',
        (await supabase.from('wb_cards').select('id').eq('board_id', req.params.id))
        .data?.map(c => c.id) || []
      )
  ]);

  const countMap = {};
  (comments || []).forEach(c => { countMap[c.card_id] = (countMap[c.card_id] || 0) + 1; });

  res.json((cards || []).map(c => ({ ...c, comment_count: countMap[c.id] || 0 })));
});

router.post('/boards/:id/cards', verifyToken, async (req, res) => {
  const { title, content, pos_x, pos_y, color } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Başlıq tələb olunur' });
  const { data, error } = await supabase.from('wb_cards')
    .insert([{ board_id: req.params.id, title: title.trim(), content: content || '',
      pos_x: parseInt(pos_x) || 80, pos_y: parseInt(pos_y) || 80, color: color || '#fef08a',
      created_by: req.user.id }])
    .select('*, employees(full_name,photo_url)').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ...data, comment_count: 0 });
});

router.patch('/cards/:id', verifyToken, async (req, res) => {
  const allowed = ['title', 'content', 'pos_x', 'pos_y', 'color'];
  const update = { updated_at: new Date().toISOString() };
  allowed.forEach(k => {
    if (req.body[k] !== undefined) {
      update[k] = (k === 'pos_x' || k === 'pos_y') ? parseInt(req.body[k]) : req.body[k];
    }
  });
  const { data, error } = await supabase.from('wb_cards')
    .update(update).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/cards/:id', verifyToken, async (req, res) => {
  const { data: card } = await supabase.from('wb_cards').select('created_by').eq('id', req.params.id).single();
  if (card?.created_by !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  await supabase.from('wb_cards').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ─── COMMENTS ────────────────────────────────────────────────
router.get('/cards/:id/comments', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('wb_comments')
    .select('*, employees(full_name,photo_url)')
    .eq('card_id', req.params.id)
    .order('created_at');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data || []);
});

router.post('/cards/:id/comments', verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Fikir boş ola bilməz' });
  const { data, error } = await supabase.from('wb_comments')
    .insert([{ card_id: req.params.id, author_id: req.user.id, content: content.trim() }])
    .select('*, employees(full_name,photo_url)').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/comments/:id', verifyToken, async (req, res) => {
  const { data: c } = await supabase.from('wb_comments').select('author_id').eq('id', req.params.id).single();
  if (c?.author_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  await supabase.from('wb_comments').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
