import { Request, Response, NextFunction } from 'express';
import { supabase, getAuthSupabase } from '../lib/supabase';

const getClient = (req: Request) => {
  const token = req.headers.authorization?.split(' ')[1];
  return token ? getAuthSupabase(token) : supabase;
};

export const getUserChats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const client = getClient(req);
    const { data, error } = await client
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, title } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }

    const client = getClient(req);
    const { data, error } = await client
      .from('chats')
      .insert([{ user_id: userId, title }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getChatMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    const client = getClient(req);
    const { data, error } = await client
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getUserMastery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const client = getClient(req);
    const { data, error } = await client
      .from('user_topic_mastery')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getCohortAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Analytics is global across all users, using service-level RPC
    const { data, error } = await supabase.rpc('get_cohort_analytics');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const client = getClient(req);
    const { data, error } = await client
      .from('user_topic_mastery')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Filter to at least 1 attempt, sort by masteryScore ascending, take top 3
    const recommendations = (data || [])
      .filter(t => (t.verified_count + t.flagged_count) > 0)
      .map(t => {
        const total = t.verified_count + t.flagged_count;
        const score = Math.round((t.verified_count / total) * 100);
        return { ...t, masteryScore: score, totalAttempts: total };
      })
      .sort((a, b) => a.masteryScore - b.masteryScore)
      .slice(0, 3);

    res.json(recommendations);
  } catch (err) {
    next(err);
  }
};

export const flagForReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, chatId, messageId, question, criticNotes } = req.body;
    
    if (!userId || !question) {
      return res.status(400).json({ error: 'userId and question are required' });
    }

    const client = getClient(req);
    const { data, error } = await client
      .from('review_queue')
      .insert([{
        user_id: userId,
        chat_id: chatId,
        message_id: messageId,
        question: question,
        critic_notes: criticNotes
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};
