export default async function handler(req,res){

  const q = req.query.q;

  const r = await fetch(
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&json=1`
  );

  const data = await r.json();

  return res.status(200).json(data.products || []);
}
