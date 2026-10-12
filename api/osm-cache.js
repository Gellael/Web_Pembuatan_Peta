import { Pool } from 'pg';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'GET') {
        const { area } = req.query;
        try {
            const result = await pool.query('SELECT osm_json FROM osm_cache WHERE area_id = $1 LIMIT 1', [area]);
            
            if (result.rows.length > 0) {
                return res.status(200).json({ success: true, data: result.rows[0].osm_json });
            }
            return res.status(404).json({ success: false, message: "Cache not found" });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    } 
    
    else if (method === 'POST') {
        const { area, osm_json } = req.body;
        try {
            await pool.query(`
                INSERT INTO osm_cache (area_id, osm_json) 
                VALUES ($1, $2)
                ON CONFLICT (area_id) 
                DO UPDATE SET osm_json = EXCLUDED.osm_json, created_at = CURRENT_TIMESTAMP
            `, [area, osm_json]);
            
            return res.status(200).json({ success: true, message: "Saved to Aiven cache" });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(405).json({ message: "Method Not Allowed" });
}