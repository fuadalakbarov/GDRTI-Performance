const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// İstifadəçi bu məktuba baxa bilərmi? (göndərən, alıcı, öz sektoruna göndərilibsə, ya admin)
async function canAccessLetter(user, letter) {
  if (user.role === 'admin') return true;
  if (letter.sender_id === user.id || letter.recipient_id === user.id) return true;
  if (letter.sector_id && letter.sector_id === user.sector_id) return true;
  return false;
}

// MƏKTUB GÖNDƏR (istənilən işçi başqasına göndərə bilər; sektora broadcast yalnız admin)
router.post('/', verifyToken, async (req, res) => {
  const { subject, body, recipient_id, sector_id, attachment_name, attachment_type, attachment_data } = req.body;
  if (!subject || !body) return res.status(400).json({ error: 'Mövzu və mətn tələb olunur' });
  if (!recipient_id && !sector_id) return res.status(400).json({ error: 'Alıcı işçi ya da sektor seçin' });
  if (sector_id && req.user.role !== 'admin') return res.status(403).json({ error: 'Bütün sektora yalnız admin göndərə bilər' });
  if (attachment_data && attachment_data.length > 7_000_000) return res.status(413).json({ error: 'Fayl çox böyükdür (maks. ~5MB)' });

  const { data, error } = await supabase
    .from('letters')
    .insert([{
      sender_id: req.user.id, recipient_id: recipient_id || null, sector_id: sector_id || null,
      subject, body,
      attachment_name: attachment_name || null, attachment_type: attachment_type || null, attachment_data: attachment_data || null
    }])
    .select('id, sender_id, recipient_id, sector_id, subject, body, is_read, attachment_name, attachment_type, created_at')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// MƏNƏ GƏLƏN MƏKTUBLAR (birbaşa mənə, ya öz sektoruma göndərilənlər)
router.get('/mine', verifyToken, async (req, res) => {
  let query = supabase.from('letters')
    .select('id, sender_id, recipient_id, sector_id, subject, body, is_read, attachment_name, attachment_type, created_at')
    .order('created_at', { ascending: false });
  if (req.user.sector_id) {
    query = query.or(`recipient_id.eq.${req.user.id},sector_id.eq.${req.user.sector_id}`);
  } else {
    query = query.eq('recipient_id', req.user.id);
  }
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GÖNDƏRDİYİM MƏKTUBLAR (indi hər kəs üçün, təkcə admin yox)
router.get('/sent', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('letters')
    .select('id, sender_id, recipient_id, sector_id, subject, body, is_read, attachment_name, attachment_type, created_at')
    .eq('sender_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// TƏK MƏKTUB (fayl əlavəsi daxil, endirmək üçün)
router.get('/:id', verifyToken, async (req, res) => {
  const { data: letter, error } = await supabase.from('letters').select('*').eq('id', req.params.id).single();
  if (error || !letter) return res.status(404).json({ error: 'Məktub tapılmadı' });
  if (!(await canAccessLetter(req.user, letter))) return res.status(403).json({ error: 'İcazə yoxdur' });
  res.json(letter);
});

// MƏKTUBU SİL (göndərən özü, ya admin)
router.delete('/:id', verifyToken, async (req, res) => {
  const { data: letter } = await supabase.from('letters').select('*').eq('id', req.params.id).single();
  if (!letter) return res.status(404).json({ error: 'Məktub tapılmadı' });
  if (letter.sender_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Yalnız göndərən və ya admin silə bilər' });
  const { error } = await supabase.from('letters').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// OXUNDU KİMİ İŞARƏLƏ
router.patch('/:id/read', verifyToken, async (req, res) => {
  const { error } = await supabase.from('letters').update({ is_read: true }).eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// ŞƏRHLƏR — siyahı
router.get('/:id/comments', verifyToken, async (req, res) => {
  const { data: letter } = await supabase.from('letters').select('*').eq('id', req.params.id).single();
  if (!letter) return res.status(404).json({ error: 'Məktub tapılmadı' });
  if (!(await canAccessLetter(req.user, letter))) return res.status(403).json({ error: 'İcazə yoxdur' });

  const { data, error } = await supabase
    .from('letter_comments')
    .select('id, letter_id, author_id, content, created_at, updated_at, employees(full_name, photo_url)')
    .eq('letter_id', req.params.id).order('created_at');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ŞƏRH ƏLAVƏ ET
router.post('/:id/comments', verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Şərh mətni boş ola bilməz' });

  const { data: letter } = await supabase.from('letters').select('*').eq('id', req.params.id).single();
  if (!letter) return res.status(404).json({ error: 'Məktub tapılmadı' });
  if (!(await canAccessLetter(req.user, letter))) return res.status(403).json({ error: 'İcazə yoxdur' });

  const { data, error } = await supabase
    .from('letter_comments')
    .insert([{ letter_id: req.params.id, author_id: req.user.id, content: content.trim() }])
    .select('id, letter_id, author_id, content, created_at, updated_at, employees(full_name, photo_url)')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ŞƏRHİ REDAKTƏ ET (yalnız öz şərhini)
router.patch('/:id/comments/:commentId', verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Şərh mətni boş ola bilməz' });

  const { data: comment } = await supabase.from('letter_comments').select('*').eq('id', req.params.commentId).single();
  if (!comment) return res.status(404).json({ error: 'Şərh tapılmadı' });
  if (comment.author_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Yalnız öz şərhinizi redaktə edə bilərsiniz' });

  const { data, error } = await supabase
    .from('letter_comments')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', req.params.commentId)
    .select('id, letter_id, author_id, content, created_at, updated_at, employees(full_name, photo_url)')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ŞƏRHİ SİL (yalnız öz şərhini, ya admin)
router.delete('/:id/comments/:commentId', verifyToken, async (req, res) => {
  const { data: comment } = await supabase.from('letter_comments').select('*').eq('id', req.params.commentId).single();
  if (!comment) return res.status(404).json({ error: 'Şərh tapılmadı' });
  if (comment.author_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'İcazə yoxdur' });

  const { error } = await supabase.from('letter_comments').delete().eq('id', req.params.commentId);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
