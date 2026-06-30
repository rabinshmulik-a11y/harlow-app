import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, members } = req.body;

    if (!user_id || !Array.isArray(members)) {
      return res.status(400).json({ error: 'Missing user_id or members' });
    }

    await supabaseFetch(`household_members?user_id=eq.${user_id}`, {
      method: 'DELETE'
    });

    const rows = members
      .filter(m => m.name && m.name.trim())
      .map(m => ({
        user_id,
        name: m.name.trim(),
        relationship: m.relationship || '',
        age: m.age || '',
        notes: m.notes || ''
      }));

    if (rows.length === 0) {
      return res.status(200).json({ success: true, saved: [] });
    }

    const response = await supabaseFetch('household_members', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(rows)
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      saved: data
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
