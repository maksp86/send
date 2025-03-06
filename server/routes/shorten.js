const fetch = require('node-fetch');
const config = require('../config');
const storage = require('../storage');

module.exports = async function(req, res) {
  if (config.yourls_api_url && config.yourls_signature && req.body.key) {
    try {
      const id = req.params.id;
      const key = req.body.key;
      const ttl = await storage.ttl(req.params.id);

      let data = {
        action: 'shorturl',
        signature: config.yourls_signature,
        format: 'json',
        url: `${config.deriveBaseUrl(req)}/download/${id}/#${key}`,
        expiry: 'clock',
        ageMod: 'min',
        age: Math.ceil(ttl / 60000)
      };

      const fetchres = await fetch(config.yourls_api_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      });

      let fetchres_json = await fetchres.json();
      if (fetchres_json.shorturl)
        res.json({
          url: fetchres_json.shorturl
        });
      else res.sendStatus(500);
    } catch (e) {
      res.sendStatus(404);
    }
  } else res.sendStatus(400);
};
