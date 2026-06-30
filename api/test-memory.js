import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  try {
    const response = await supabaseFetch('users', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        name: 'Test User',
        household_size: 4,
        dietary: 'kosher'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      success: true,
      saved: data
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
