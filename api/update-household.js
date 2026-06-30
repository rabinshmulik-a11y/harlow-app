import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { action, user_id, member } = req.body;

    if (!action || !user_id) {
      return res.status(400).json({ success: false, error: 'Missing action or user_id' });
    }

    if (action === 'add_member') {
      if (!member || !member.name) {
        return res.status(400).json({ success: false, error: 'Missing member name' });
      }

      const response = await supabaseFetch('household_members', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          user_id,
          name: member.name,
          relationship: member.relationship || '',
          age: member.age || '',
          notes: member.notes || ''
        })
      });

      const data = await response.json();

      return res.status(200).json({
        success: true,
        action,
        saved: data[0]
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Unknown action'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
