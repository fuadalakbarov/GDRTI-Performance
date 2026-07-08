const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken } = require('../middleware/auth');
const { createNotification } = require('./notifications');

// Bütün postları gətir
router.get('/', verifyToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const { data: posts, error } = await supabase.from('feed_posts')
    .select('id,content,created_at,author_id')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return res.status(400).json({ error: error.message });

  const ids = (posts||[]).map(p => p.id);
  const authorIds = [...new Set((posts||[]).map(p => p.author_id))];

  const [{ data: authors }, { data: reactions }, { data: comments }] = await Promise.all([
    supabase.from('employees').select('id,full_name,photo_url,position').in('id', authorIds),
    ids.length ? supabase.from('feed_reactions').select('*').in('post_id', ids) : { data: [] },
    ids.length ? supabase.from('feed_comments').select('id,post_id,content,created_at,author_id').in('post_id', ids).order('created_at') : { data: [] },
  ]);

  const empMap = {};
  (authors || []).forEach(e => empMap[e.id] = e);

  // Comment author-larını da gətir
  const cmtAuthorIds = [...new Set((comments||[]).map(c => c.author_id))];
  const { data: cmtAuthors } = cmtAuthorIds.length
    ? await supabase.from('employees').select('id,full_name,photo_url').in('id', cmtAuthorIds)
    : { data: [] };
  (cmtAuthors || []).forEach(e => empMap[e.id] = empMap[e.id] || e);

  const result = (posts || []).map(p => ({
    ...p,
    author: empMap[p.author_id] || null,
    reactions: (reactions || []).filter(r => r.post_id === p.id),
    comments: (comments || []).filter(c => c.post_id === p.id).map(c => ({
      ...c, author: empMap[c.author_id] || null
    })),
  }));

  res.json(result);
});

// Post yarat
router.post('/', verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Məzmun boş ola bilməz' });

  const { data, error } = await supabase.from('feed_posts')
    .insert([{ author_id: req.user.id, content: content.trim() }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });

  // @mention-ları tap və bildiriş göndər
  const mentions = content.match(/@([a-zA-ZƏəİıÖöÜüĞğŞşÇç\w]+)/g) || [];
  // (sadə axtarış — real app-da daha mürəkkəb olardı)

  res.json(data);
});

// Post sil
router.delete('/:id', verifyToken, async (req, res) => {
  const { data: post } = await supabase.from('feed_posts').select('author_id').eq('id', req.params.id).single();
  const MANAGERS = ['admin','director','deputy'];
  if (post?.author_id !== req.user.id && !MANAGERS.includes(req.user.role))
    return res.status(403).json({ error: 'İcazə yoxdur' });
  await supabase.from('feed_posts').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// Reaksiya əlavə et / dəyiş / sil (toggle)
router.post('/:id/react', verifyToken, async (req, res) => {
  const { type } = req.body;
  const { data: existing } = await supabase.from('feed_reactions')
    .select('id,type').eq('post_id', req.params.id).eq('user_id', req.user.id).single();

  if (existing) {
    if (existing.type === type) {
      // Eyni reaksiya → sil (toggle off)
      await supabase.from('feed_reactions').delete().eq('id', existing.id);
    } else {
      // Fərqli reaksiya → dəyiş
      await supabase.from('feed_reactions').update({ type }).eq('id', existing.id);
    }
  } else {
    await supabase.from('feed_reactions').insert([{ post_id: req.params.id, user_id: req.user.id, type }]);
  }

  const { data: all } = await supabase.from('feed_reactions').select('*').eq('post_id', req.params.id);
  res.json(all || []);
});

// Şərh əlavə et
router.post('/:id/comments', verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Şərh boş ola bilməz' });

  const { data, error } = await supabase.from('feed_comments')
    .insert([{ post_id: req.params.id, author_id: req.user.id, content: content.trim() }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });

  // Post sahibinə bildiriş
  const { data: post } = await supabase.from('feed_posts').select('author_id,content').eq('id', req.params.id).single();
  if (post?.author_id && post.author_id !== req.user.id) {
    await createNotification(post.author_id, 'comment',
      `💬 Paylaşımınıza şərh yazıldı`,
      content.trim().slice(0, 60),
      '/whiteboard.html');
  }

  res.json(data);
});

// Şərh sil
router.delete('/comments/:id', verifyToken, async (req, res) => {
  const { data: c } = await supabase.from('feed_comments').select('author_id').eq('id', req.params.id).single();
  const MANAGERS = ['admin','director','deputy'];
  if (c?.author_id !== req.user.id && !MANAGERS.includes(req.user.role))
    return res.status(403).json({ error: 'İcazə yoxdur' });
  await supabase.from('feed_comments').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
