import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export const getUserChats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
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

    const { data, error } = await supabase
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

    const { data, error } = await supabase
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
