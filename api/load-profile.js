import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing user id' });
    }

    const userResponse = await supabaseFetch(
      `users?select=*&id=eq.${encodeURIComponent(id)}`
    );

    const users = await userResponse.json();
    const user = users[0] || null;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const membersResponse = await supabaseFetch(
      `household_members?select=*&user_id=eq.${encodeURIComponent(id)}&order=created_at.asc`
    );

    const members = await membersResponse.json();

    return res.status(200).json({
      ...user,
      members: members || []
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
