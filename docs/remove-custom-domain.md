# Remove Custom Domain — `muhurta.balaramansriram.com`

> Added 2026-09-06: `muhurta.balaramansriram.com → astro-cal` worker via Cloudflare Workers Custom Domain API.  
> Zone `balaramansriram.com` (`9470017d7cb0c05354dcf803ff4ca004`) · Account `e4ef7397b41565fb05127c14e5a967b4` · Domain ID `ab59784ecdad0df3da690875a644f4eb6f365abe`.

This domain lives **outside** `wrangler.toml` — no code change created it, so no code change removes it. `wrangler deploy` never deletes it. Remove it only when you actually want to retire the subdomain.

---

## 1. Dashboard (recommended)

1. https://dash.cloudflare.com → **Workers & Pages** → `astro-cal` → **Settings** → **Domains & Routes**
2. Find `muhurta.balaramansriram.com` → click `× Remove` / `Delete` → confirm
3. Cloudflare auto-removes the proxied DNS record. No `wrangler.toml` edit. No redeploy.

Verify: `nslookup muhurta.balaramansriram.com` should return `Non-existent domain`; `curl -I https://muhurta.balaramansriram.com` should fail; `https://astro-cal.srirambm.workers.dev` keeps serving.

---

## 2. API (same credential as `wrangler whoami` — `srirambm@gmail.com`)

Token is in `C:\Users\Sony\AppData\Roaming\xdg.config\.wrangler\config\default.toml` (`oauth_token`). You need `workers (write)` — already granted.

```powershell
# List (confirm ID)
python3 -c "
import re, pathlib, urllib.request, json
tok=re.search(r'oauth_token\s*=\s*\"([^\"]+)\"', pathlib.Path(r'C:\Users\Sony\AppData\Roaming\xdg.config\.wrangler\config\default.toml').read_text()).group(1)
import urllib.request, json
h={'Authorization': f'Bearer {tok}', 'Content-Type': 'application/json'}
with urllib.request.urlopen(urllib.request.Request('https://api.cloudflare.com/client/v4/accounts/e4ef7397b41565fb05127c14e5a967b4/workers/domains', headers=h)) as r:
    d=json.loads(r.read().decode())
    for x in d['result']:
        print(x['hostname'], x['id'], x['service'])
"

# Delete
python3 -c "
import re, pathlib, urllib.request
tok=re.search(r'oauth_token\s*=\s*\"([^\"]+)\"', pathlib.Path(r'C:\Users\Sony\AppData\Roaming\xdg.config\.wrangler\config\default.toml').read_text()).group(1)
h={'Authorization': f'Bearer {tok}'}
req=urllib.request.Request('https://api.cloudflare.com/client/v4/accounts/e4ef7397b41565fb05127c14e5a967b4/workers/domains/ab59784ecdad0df3da690875a644f4eb6f365abe', headers=h, method='DELETE')
with urllib.request.urlopen(req) as r:
    print(r.read().decode()[:2000])
"
```

Alternative with `curl` (bash):

```bash
TOKEN=$(python3 -c "import re,pathlib; print(re.search(r'oauth_token\s*=\s*\"([^\"]+)\"', pathlib.Path(r'C:\Users\Sony\AppData\Roaming\xdg.config\.wrangler\config\default.toml').read_text()).group(1))")
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  https://api.cloudflare.com/client/v4/accounts/e4ef7397b41565fb05127c14e5a967b4/workers/domains/ab59784ecdad0df3da690875a644f4eb6f365abe
```

---

## 3. What not to do

- Do **not** add a `routes` / `route` entry in `wrangler.toml` to “undo” it — that’s a different mechanism (zone routes) and is not used here.
- Do **not** manually delete the DNS record in **DNS → Records** alone — the Workers binding remains and will recreate it. Always delete via Workers → Domains & Routes (or the API above).
- No redeploy needed after removal; `balaramansriram.com` (portfolio worker `balaramansriram`) is untouched — only the `muhurta.` subdomain is affected.

---

## 4. Re-add later

```python
# Re-add (same as creation)
# PUT /accounts/{account_id}/workers/domains  body: {"hostname":"muhurta.balaramansriram.com","service":"astro-cal","zone_name":"balaramansriram.com"}
python3 -c "
import re, pathlib, urllib.request, json
tok=re.search(r'oauth_token\s*=\s*\"([^\"]+)\"', pathlib.Path(r'C:\Users\Sony\AppData\Roaming\xdg.config\.wrangler\config\default.toml').read_text()).group(1)
h={'Authorization': f'Bearer {tok}', 'Content-Type': 'application/json'}
body=json.dumps({'hostname':'muhurta.balaramansriram.com','service':'astro-cal','zone_name':'balaramansriram.com'}).encode()
req=urllib.request.Request('https://api.cloudflare.com/client/v4/accounts/e4ef7397b41565fb05127c14e5a967b4/workers/domains', data=body, headers=h, method='PUT')
with urllib.request.urlopen(req) as r:
    print(r.read().decode()[:2000])
"
```

Or dashboard: Workers & Pages → `astro-cal` → Settings → Domains & Routes → **Add Custom Domain** → `muhurta.balaramansriram.com` → Add.

---

## 5. Quick checks

```bash
nslookup muhurta.balaramansriram.com
curl -I https://muhurta.balaramansriram.com/
curl -I https://astro-cal.srirambm.workers.dev/
curl -I https://balaramansriram.com/
```

- Before removal: all three return `200`.
- After removal: `muhurta.` → `Non-existent` / error; the other two still `200`.

---

*Keep `wrangler.toml` as is (`assets directory="./public"` only). This file is the single reference for removing the custom domain.*
