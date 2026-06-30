import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const findResponse = await supabaseFetch(
      `users?select=*&email=eq.${encodeURIComponent(email)}`
    );

    const existing = await findResponse.json();

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'That email is already used. Please sign in instead.'
      });
    }

    const createResponse = await supabaseFetch('users', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        name: 'New User',
        email,
        password
      })
    });

    const created = await createResponse.json();

    return res.status(200).json({
      success: true,
      user: created[0]
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
