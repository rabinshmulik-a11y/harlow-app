import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id = 3, item_name, store, price, quantity = 1, unit = 'item' } = req.body;

    if (!item_name || !store || price == null) {
      return res.status(400).json({
        error: 'Missing item_name, store, or price'
      });
    }

    const response = await supabaseFetch('purchase_history', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id,
        item_name,
        store,
        price,
        quantity,
        unit
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
    return res.status(500).json({ error: err.message });
  }
}
