// Place this file at the ROOT of your frontend's public/ folder, i.e.
// public/service-worker.js (not inside a subfolder) — service workers
// only control pages within their own scope, and root scope is simplest.

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "MUTMLSA";
  const options = {
    body: data.body || "",
    icon: "/favicon.jpeg",
    badge: "/favicon.jpeg",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});