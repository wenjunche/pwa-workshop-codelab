/*
 Copyright 2021 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { openDB } from 'idb';

// Capture the registration for later use, if needed
let swRegistration;
const requestNotificationPermission = async() => {
  const permission = await window.Notification.requestPermission();
  // value of permission can be 'granted', 'default', 'denied'
  // granted: user has accepted the request
  // default: user has dismissed the notification permission popup by clicking on x
  // denied: user has denied the request.
  if (permission !== "granted") {
    throw new Error("Permission not granted for Notification");
  }
};

// Register the service worker
if ('serviceWorker' in navigator) {
  // Wait for the 'load' event to not block other work
  window.addEventListener('load', async () => {
    // Try to register the service worker.
    try {
      await requestNotificationPermission();
      // import.meta.env.DEV is a special environment variable injected by Vite to let us know we're in development mode. Here, we can use the JS Module form of our service worker because we can control our browsers in dev.
      if (import.meta.env.DEV) {
        swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
          type: 'module',
        });
      } else {
        // In production, we use the normal service worker registration
        swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      }

      console.log('Service worker registered! 😎', swRegistration);
    } catch (err) {
      console.log('😥 Service worker registration failed: ', err);
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  // Set up the database
  const db = await openDB('settings-store', 1, {
    upgrade(db) {
      db.createObjectStore('settings');
    },
  });

  // Set up the editor
  const { Editor } = await import('./app/editor.js');
  const editor = new Editor(document.body);

  // Set up the menu
  const { Menu } = await import('./app/menu.js');
  new Menu(document.querySelector('.actions'), editor);

  // Save content to database on edit
  editor.onUpdate(async (content) => {
    await db.put('settings', content, 'content');
  });

  // Set the initial state in the editor
  const defaultText = `PWA with Web Push.`;

  editor.setContent((await db.get('settings', 'content')) || defaultText);

  // Set up night mode toggle
  const { NightMode } = await import('./app/night-mode.js');
  new NightMode(
    document.querySelector('#mode'),
    async (mode) => {
      editor.setTheme(mode);
      await db.put('settings', mode, 'night-mode');
    },
    await db.get('settings', 'night-mode'),
  );

  // Set up install prompt
  const { Install } = await import('./lib/install.js');
  const install = new Install(document.querySelector('#install'));

  window.addEventListener('beforeinstallprompt', async (e) => {
    console.log('beforeinstallprompt', e);
    e.preventDefault();
    install.toggleInstallButton('show', e);
  });

  window.addEventListener('appinstalled', async (e) => {
    console.log('appinstalled', e);
    e.preventDefault();
    install.toggleInstallButton('hide', undefined);
  });

  window.launchQueue.setConsumer((launchParams) => {
    console.log('launchQueue', launchParams);
  });  

});
