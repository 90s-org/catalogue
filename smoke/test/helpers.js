// Base URL defaults to in-cluster service DNS in the roboshop-prod namespace.
// Override it (e.g. to a pod IP, since the Jenkins agent can't resolve
// *.svc.cluster.local) when running from the pipeline.
const CATALOGUE_URL = process.env.CATALOGUE_URL || 'http://catalogue.roboshop-prod.svc.cluster.local:8080';

async function getJSON(url) {
    const res = await fetch(url);
    const text = await res.text();
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        parsed = text;
    }
    return { status: res.status, body: parsed };
}

// A pod can briefly report unhealthy right after a rolling deploy while it finishes
// connecting to MongoDB — poll instead of failing on the very first request.
async function waitUntilHealthy(timeoutMs = 30000, intervalMs = 2000) {
    const deadline = Date.now() + timeoutMs;
    let last;
    while (Date.now() < deadline) {
        last = await getJSON(`${CATALOGUE_URL}/health`);
        if (last.status === 200 && last.body.app === 'OK' && last.body.mongo === true) {
            return last;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error(`${CATALOGUE_URL}/health did not report healthy within ${timeoutMs}ms. Last response: ${JSON.stringify(last)}`);
}

module.exports = { CATALOGUE_URL, getJSON, waitUntilHealthy };
