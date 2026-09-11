# AnyWork365

AnyWork365 is a simple landing page for a local help and moving service website. It is designed to be hosted on GitHub Pages with no build tools required.

## Files

- `index.html` - main page structure
- `styles.css` - page styling
- `script.js` - small interactions
- `assets/logo.svg` - logo graphic

## How to publish on GitHub

1. Create a new GitHub repository.
2. Upload these files to the root of the repository.
3. Go to the repository settings.
4. Open **Pages**.
5. Under **Source**, choose **Deploy from a branch**.
6. Select the **main** branch and the root folder.
7. Save. Your website will be available at a GitHub Pages URL.

## Custom domain launch checklist

1. Register a domain such as anywork365.com.
2. In the domain provider, add the GitHub Pages DNS records:
   - A record: point to GitHub Pages IPs
   - CNAME: www → your GitHub username.github.io
3. In GitHub repository settings, add the custom domain under Pages.
4. Wait for DNS propagation, then verify HTTPS is enabled.
5. If using the Express API on Render, connect the frontend to the live Render URL and keep all form submissions pointed to that API.
6. Test each form on the live site before sharing the link publicly.

## Render backend checklist

1. Deploy the Express app to Render.
2. Add environment variables:
   - PORT
   - RESEND_API_KEY
   - TO_EMAIL
   - FROM_EMAIL
3. Confirm the app starts without errors.
4. Verify your domain in Resend and set FROM_EMAIL to an email on that verified domain, such as hello@anywork365.com.
5. Test the public API route and form submission on the live domain.
6. Confirm the email is delivered to the target inbox.

> Resend is in sandbox mode by default. Until your custom domain is verified, emails can only be sent to your own verified address.

## Local preview

Open the project folder in a browser, or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.
