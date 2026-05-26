import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { data: notifications, error: fetchErr } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (fetchErr) throw fetchErr;

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

    res.status(200).json({ notifications: notifications || [], unreadCount });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 * Quick endpoint for the bell badge — returns only the count
 */
router.get('/unread-count', requireAuth, async (req, res, next) => {
  try {
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { count, error: countErr } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    if (countErr) throw countErr;

    res.status(200).json({ unreadCount: count || 0 });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Ensure the notification belongs to this user
    const { data: notification, error: fetchErr } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.user_id !== profile.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (updateErr) throw updateErr;

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', requireAuth, async (req, res, next) => {
  try {
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    if (updateErr) throw updateErr;

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
