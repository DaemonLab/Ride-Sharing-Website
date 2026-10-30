# Contact form delivery

The website contact page submits directly from the browser to FormSubmit over
HTTPS, addressed to `ershavait@gmail.com`. It does not use Render's SMTP ports,
application session credentials or an email API key. The public contact address
displayed on the page remains `support@rideshare.com`.

## One-time activation

1. Deploy the updated frontend when ready.
2. Submit a contact message from the deployed website.
3. Open the FormSubmit activation email in `ershavait@gmail.com` (check spam).
4. Activate the form, then submit a fresh message and confirm receipt.

Do not assume the first activation-triggering submission was delivered. Repeat
activation if FormSubmit requires it for a different sending site. The fetch
request sends only the site's origin as its referrer because FormSubmit needs
that origin for activation; page paths and query strings are not sent.

Only explicit provider acceptance shows success. Provider rejection, timeout,
rate limiting or non-JSON responses retain the user's form text. Provider error
details are not displayed. FormSubmit processes the supplied contact details;
the form includes a disclosure before sending. Application rate limits do not
apply to this external endpoint; spam handling and service limits belong to
FormSubmit. Do not disable the provider's spam protection.

The existing backend `/contact` endpoint remains available for previous clients
and still requires its SMTP configuration. It is not used by this contact page.
There is no new Brevo integration or account requirement.

Verification: `cd ride_frontend` then `node --test test/contact.test.mjs`.
Provider documentation: https://formsubmit.co/ajax-documentation

During setup on 30 October 2026, FormSubmit's public site returned HTTP 521.
Local tests mock provider responses and do not confirm live delivery. Activation
and inbox verification must be completed once its service is reachable.
