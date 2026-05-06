# The Federated Republic

Website for the Federated Republic constitutional project.

## To deploy on GitHub Pages

1. Create a new repository on GitHub (e.g. `federatedrepublic`)
2. Upload all files in this folder to the repository
3. Go to Settings → Pages → Source → Deploy from branch → main → / (root)
4. Your site will be live at `https://yourusername.github.io/federatedrepublic`

## Files

- `index.html` — the complete website (single file)
- `constitution-v109b.docx` — the downloadable constitution

## To use a custom domain (thefederatedrepublic.org)

1. Buy the domain from Namecheap, Cloudflare, or Google Domains
2. In your domain registrar, add these DNS records:
   - A record → 185.199.108.153
   - A record → 185.199.109.153
   - A record → 185.199.110.153
   - A record → 185.199.111.153
3. In GitHub Pages settings, add your custom domain
4. Check "Enforce HTTPS" once it activates (takes up to 24 hours)

## Newsletter

The newsletter form currently shows a confirmation message only.
To collect real emails, sign up for Mailchimp (free for under 500 subscribers),
create an audience, get the form action URL, and replace the `handleSubmit`
function with the Mailchimp embed code.
