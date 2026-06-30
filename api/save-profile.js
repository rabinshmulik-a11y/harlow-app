import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      id,
      name = 'Shmuel',
      household_size,
      dietary,
      zip_code,
      street,
      city,
      state,
      memberships = [],
      delivery_preference,
      occasions = []
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing user id' });
    }

    const response = await supabaseFetch(`users?id=eq.${id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        name,
        household_size,
        dietary,
        zip_code,
        street,
        city,
        state,
        memberships,
        delivery_preference,
        occasions
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      success: true,
      saved: data[0]
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
