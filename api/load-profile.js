import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing user id' });
    }

    const response = await supabaseFetch(
      `users?select=*&id=eq.${encodeURIComponent(id)}`
    );

    const data = await response.json();

    return res.status(200).json(data[0] || null);

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
