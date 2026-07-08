const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Oxunmamış bildirişlər sayı (bell icon üçün)
router.get('/count', verifyToken, async (req, res) => {
  const { count } = await supabase.from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.user.id).eq('is_read', false);
  res.json({ count: count || 0 });
});

// Bildirişlər siyahısı
router.get('/', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('notifications')
    .select('*').eq('user_id', req.user.id)
    .order('created_at', { ascending: false }).limit(30);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Hamısını oxunmuş et
router.patch('/read-all', verifyToken, async (req, res) => {
  await supabase.from('notifications').update({ is_read: true })
    .eq('user_id', req.user.id).eq('is_read', false);
  res.json({ success: true });
});

// Tək bildirişi oxunmuş et
router.patch('/:id/read', verifyToken, async (req, res) => {
  await supabase.from('notifications').update({ is_read: true })
    .eq('id', req.params.id).eq('user_id', req.user.id);
  res.json({ success: true });
});

// Bildiriş yarat (sistem daxili — digər route-lardan çağırılır)
async function createNotification(userId, type, title, body, link) {
  if (!userId) return;
  await supabase.from('notifications').insert([{ user_id: userId, type, title, body, link }]);
}

module.exports = router;
module.exports.createNotification = createNotification;
