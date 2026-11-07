/**
 * Pushes the payment-related variables from .env to a Vercel project.
 *
 *   VERCEL_TOKEN=xxxx node scripts/push-vercel-env.mjs            # dry run
 *   VERCEL_TOKEN=xxxx node scripts/push-vercel-env.mjs --apply    # write
 *
 * The four callback URLs are rewritten to the deployed domains — the local
 * .env points them at localhost, which the gateway cannot reach.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const APPLY = process.argv.includes("--apply");
const TOKEN = process.env.VERCEL_TOKEN;
const PROJECT = process.env.VERCEL_PROJECT ?? "onnomart-api";
const TEAM = process.env.VERCEL_TEAM;

const API = process.env.PUBLIC_API_ORIGIN ?? "https://onnomart-api.vercel.app";
const SITE = process.env.PUBLIC_SITE_ORIGIN ?? "https://onno-mart.vercel.app";

const OVERRIDES = {
    SUCCESS_URL: `${API}/api/payment/payment-success`,
    FAIL_URL: `${API}/api/payment/payment-fail`,
    CANCEL_URL: `${API}/api/payment/payment-cancel`,
    CLIENT_URL: SITE,
    NODE_ENV: "production",
    RESET_PASS_LINK: `${SITE}/auth/change-password`,
};

const KEYS = [
    "NODE_ENV",
    "JWT_SECRET",
    "EXPIRES_IN",
    "REFRESH_TOKEN_SECRET",
    "REFRESH_TOKEN_EXPIRES_IN",
    "RESET_PASS_TOKEN",
    "RESET_PASS_TOKEN_EXPIRES_IN",
    "RESET_PASS_LINK",
    "EMAIL",
    "APP_PASS",
    "CLIENT_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STORE_ID",
    "STORE_PASS",
    "SUCCESS_URL",
    "FAIL_URL",
    "CANCEL_URL",
    "SSL_PAYMENT_API",
    "SSL_VALIDATIOIN_API",
    "AMARPAY_STORE_ID",
    "AMARPAY_SIGNATURE_KEY",
];

const env = Object.fromEntries(
    readFileSync(resolve(process.cwd(), ".env"), "utf8")
        .split("\n")
        .map((line) => line.match(/^([A-Z_]+)\s*=\s*(.*)$/))
        .filter(Boolean)
        .map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, "")])
);

const payload = KEYS.filter((key) => env[key] || OVERRIDES[key]).map((key) => ({
    key,
    value: OVERRIDES[key] ?? env[key],
    type: "encrypted",
    target: ["production", "preview"],
}));

if (!APPLY) {
    for (const item of payload) {
        const shown = item.value.length > 12 ? `${item.value.slice(0, 6)}…` : item.value;
        console.log(`${item.key.padEnd(28)} ${shown}`);
    }
    console.log(`\n${payload.length} variables ready. Re-run with --apply and VERCEL_TOKEN to push.`);
    process.exit(0);
}

if (!TOKEN) {
    console.error("VERCEL_TOKEN is required with --apply.");
    process.exit(1);
}

const query = TEAM ? `?teamId=${TEAM}` : "";
const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

const existing = await fetch(`https://api.vercel.com/v9/projects/${PROJECT}/env${query}`, { headers });
if (!existing.ok) {
    console.error(`Could not read project ${PROJECT}: ${existing.status} ${await existing.text()}`);
    process.exit(1);
}
const byKey = new Map((await existing.json()).envs.map((item) => [item.key, item.id]));

for (const item of payload) {
    const id = byKey.get(item.key);
    const response = id
        ? await fetch(`https://api.vercel.com/v9/projects/${PROJECT}/env/${id}${query}`, {
              method: "PATCH",
              headers,
              body: JSON.stringify({ value: item.value, target: item.target }),
          })
        : await fetch(`https://api.vercel.com/v10/projects/${PROJECT}/env${query}`, {
              method: "POST",
              headers,
              body: JSON.stringify(item),
          });

    console.log(`${response.ok ? "ok  " : "FAIL"} ${item.key}${id ? " (updated)" : " (created)"}`);
}

console.log("\nRedeploy the API for the new variables to take effect.");
