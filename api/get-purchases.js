import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  try {
    const response = await supabaseFetch(
      'purchase_history?select=*&order=purchased_at.desc'
    );

    const data = await response.json();

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
