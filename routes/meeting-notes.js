const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('meeting_notes')
    .select('*, employees(full_name)')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/:id', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('meeting_notes')
    .select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Tapılmadı' });
  res.json(data);
});

router.post('/', verifyToken, async (req, res) => {
  const { title, attendees, agenda, decisions, action_items, next_meeting, calendar_event_id } = req.body;
  if (!title) return res.status(400).json({ error: 'Başlıq tələb olunur' });
  const { data, error } = await supabase.from('meeting_notes')
    .insert([{ title, attendees: attendees||[], agenda, decisions,
      action_items: action_items||[], next_meeting: next_meeting||null,
      calendar_event_id: calendar_event_id||null, created_by: req.user.id }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.patch('/:id', verifyToken, async (req, res) => {
  const { data: note } = await supabase.from('meeting_notes').select('created_by').eq('id', req.params.id).single();
  if (!note) return res.status(404).json({ error: 'Tapılmadı' });
  if (note.created_by !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  const { title, attendees, agenda, decisions, action_items, next_meeting } = req.body;
  const { data, error } = await supabase.from('meeting_notes')
    .update({ title, attendees, agenda, decisions, action_items, next_meeting,
      updated_at: new Date().toISOString() })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', verifyToken, async (req, res) => {
  const { data: note } = await supabase.from('meeting_notes').select('created_by').eq('id', req.params.id).single();
  if (!note) return res.status(404).json({ error: 'Tapılmadı' });
  if (note.created_by !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  await supabase.from('meeting_notes').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
