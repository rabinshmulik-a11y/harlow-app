import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const { email, phone, primary_address } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        error: 'Email or phone is required'
      });
    }

    const field = email ? 'email' : 'phone';
    const value = email || phone;

    const findResponse = await supabaseFetch(
      `users?select=*&${field}=eq.${encodeURIComponent(value)}`
    );

    const existing = await findResponse.json();

    if (existing && existing.length > 0) {
      return res.status(200).json({
        success: true,
        user: existing[0],
        created: false
      });
    }

    const createResponse = await supabaseFetch('users', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        name: 'New User',
        email: email || null,
        phone: phone || null,
        primary_address: primary_address || null
      })
    });

    const created = await createResponse.json();

    return res.status(200).json({
      success: true,
      user: created[0],
      created: true
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
