if (!self.define) {
  const e = e => {
      'require' !== e && (e += '.js');
      let s = Promise.resolve();
      return (
        r[e] ||
          (s = new Promise(async s => {
            if ('document' in self) {
              const r = document.createElement('script');
              (r.src = e), document.head.appendChild(r), (r.onload = s);
            } else importScripts(e), s();
          })),
        s.then(() => {
          if (!r[e]) throw new Error(`Module ${e} didn’t register its module`);
          return r[e];
        })
      );
    },
    s = (s, r) => {
      Promise.all(s.map(e)).then(e => r(1 === e.length ? e[0] : e));
    },
    r = { require: Promise.resolve(s) };
  self.define = (s, i, c) => {
    r[s] ||
      (r[s] = Promise.resolve().then(() => {
        let r = {};
        const a = { uri: location.origin + s.slice(1) };
        return Promise.all(
          i.map(s => {
            switch (s) {
              case 'exports':
                return r;
              case 'module':
                return a;
              default:
                return e(s);
            }
          })
        ).then(e => {
          const s = c(...e);
          return r.default || (r.default = s), r;
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
      ],
      {}
    );
});
//# sourceMappingURL=sw.js.map
