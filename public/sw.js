if (!self.define) {
  const e = e => {
      'require' !== e && (e += '.js');
      let i = Promise.resolve();
      return (
        s[e] ||
          (i = new Promise(async i => {
            if ('document' in self) {
              const s = document.createElement('script');
              (s.src = e), document.head.appendChild(s), (s.onload = i);
            } else importScripts(e), i();
          })),
        i.then(() => {
          if (!s[e]) throw new Error(`Module ${e} didn’t register its module`);
          return s[e];
        })
      );
    },
    i = (i, s) => {
      Promise.all(i.map(e)).then(e => s(1 === e.length ? e[0] : e));
    },
    s = { require: Promise.resolve(i) };
  self.define = (i, c, r) => {
    s[i] ||
      (s[i] = Promise.resolve().then(() => {
        let s = {};
        const a = { uri: location.origin + i.slice(1) };
        return Promise.all(
          c.map(i => {
            switch (i) {
              case 'exports':
                return s;
              case 'module':
                return a;
              default:
                return e(i);
            }
          })
        ).then(e => {
          const i = r(...e);
          return s.default || (s.default = i), s;
        });
      }));
  };
}
define('./sw.js', ['./workbox-947205ca'], function (e) {
  'use strict';
  self.addEventListener('message', e => {
    e.data && 'SKIP_WAITING' === e.data.type && self.skipWaiting();
  }),
    e.precacheAndRoute(
      [
        { url: '404.html', revision: '0a27a4163254fc8fce870c8cc3a3f94f' },
        { url: 'favicon.ico', revision: '2cab47d9e04d664d93c8d91aec59e812' },
        {
          url: 'help/index.html',
          revision: 'e6cd6ab86597dcdfb40c2b4e502a5d35',
        },
        { url: 'index.html', revision: '65a233cf5e8ac334bb5a7305a443c6f8' },
        { url: 'manifest.json', revision: '360dc829f679616dc3adecbab8ab4731' },
        { url: 'offline.html', revision: '30280fedecc4c463f735357851a3a831' },
        {
          url: 'service-worker.js',
          revision: 'b9da4fefead3b45532fd4bd754f44eec',
        },
        {
          url: 'src/css/app.css',
          revision: 'a5e824c131b444b152772109bd336652',
        },
        {
          url: 'src/css/feed.css',
          revision: '55a3dbd320b555f8ced3f9a0de5ea1f9',
        },
        {
          url: 'src/css/help.css',
          revision: '81922f16d60bd845fd801a889e6acbd7',
        },
        {
          url: 'src/images/icons/app-icon-144x144.png',
          revision: '83011e228238e66949f0aa0f28f128ef',
        },
        {
          url: 'src/images/icons/app-icon-192x192.png',
          revision: 'f927cb7f94b4104142dd6e65dcb600c1',
        },
        {
          url: 'src/images/icons/app-icon-256x256.png',
          revision: '86c18ed2761e15cd082afb9a86f9093d',
        },
        {
          url: 'src/images/icons/app-icon-384x384.png',
          revision: 'fbb29bd136322381cc69165fd094ac41',
        },
        {
          url: 'src/images/icons/app-icon-48x48.png',
          revision: '45eb5bd6e938c31cb371481b4719eb14',
        },
        {
          url: 'src/images/icons/app-icon-512x512.png',
          revision: 'd42d62ccce4170072b28e4ae03a8d8d6',
        },
        {
          url: 'src/images/icons/app-icon-96x96.png',
          revision: '56420472b13ab9ea107f3b6046b0a824',
        },
        {
          url: 'src/images/icons/apple-icon-114x114.png',
          revision: '74061872747d33e4e9f202bdefef8f03',
        },
        {
          url: 'src/images/icons/apple-icon-120x120.png',
          revision: 'abd1cfb1a51ebe8cddbb9ada65cde578',
        },
        {
          url: 'src/images/icons/apple-icon-144x144.png',
          revision: 'b4b4f7ced5a981dcd18cb2dc9c2b215a',
        },
        {
          url: 'src/images/icons/apple-icon-152x152.png',
          revision: '841f96b69f9f74931d925afb3f64a9c2',
        },
        {
          url: 'src/images/icons/apple-icon-180x180.png',
          revision: '2e5e6e6f2685236ab6b0c59b0faebab5',
        },
        {
          url: 'src/images/icons/apple-icon-57x57.png',
          revision: 'cc93af251fd66d09b099e90bfc0427a8',
        },
        {
          url: 'src/images/icons/apple-icon-60x60.png',
          revision: '18b745d372987b94d72febb4d7b3fd70',
        },
        {
          url: 'src/images/icons/apple-icon-72x72.png',
          revision: 'b650bbe358908a2b217a0087011266b5',
        },
        {
          url: 'src/images/icons/apple-icon-76x76.png',
          revision: 'bf10706510089815f7bacee1f438291c',
        },
        {
          url: 'src/images/main-image-lg.jpg',
          revision: '31b19bffae4ea13ca0f2178ddb639403',
        },
        {
          url: 'src/images/main-image-sm.jpg',
          revision: 'c6bb733c2f39c60e3c139f814d2d14bb',
        },
        {
          url: 'src/images/main-image.jpg',
          revision: '5c66d091b0dc200e8e89e56c589821fb',
        },
        {
          url: 'src/images/sf-boat.jpg',
          revision: '0f282d64b0fb306daf12050e812d6a19',
        },
        { url: 'src/js/app.js', revision: '803da043b1c101a59db11ee38a8dbc9e' },
        { url: 'src/js/feed.js', revision: '7f57c79e558e21d0a405c3854de55ea4' },
        { url: 'src/js/idb.js', revision: '87b065e68ea6670b4640ab214c631699' },
        {
          url: 'src/js/material.min.js',
          revision: '70b1ef4dc0c66f8f6b40bd96032650f2',
        },
        {
          url: 'src/js/utils.js',
          revision: 'c3c55b32e28bd671b0a0d3ffdaf3e159',
        },
      ],
      {}
    );
});
//# sourceMappingURL=sw.js.map
