## 1.0.0 (2026-01-07)

### Features

* add ci/cd deploy workflow for production ([8116f8e](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/8116f8eb71a569cd33a0ba5ae112e2f8b8589608))
* add debug api endpoint for request inspection ([544003c](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/544003c9dba69df5ec401265c45e12ca9ddd63d0))
* add debug endpoint for troubleshooting ([f20c568](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/f20c5687272e3359904fa848b2e9dae1d586506a))
* add debug mode to php proxy and api routes for post troubleshooting ([7bf33dc](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/7bf33dc16cd6512846b85b0547c5528d3675dc76))
* add echo.php for post request debugging ([d66d418](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/d66d418151b18cb2ba9a399210a17419e3758123))
* add favicon, update readme with tools docs, add healthcheck script ([0fdf8c0](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/0fdf8c0da9630f1dcdaa29e2a214a2ec91c873eb))
* **ui:** add responsive mobile/tablet layout and fix ci/cd workflow ([a5873d1](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/a5873d12c0e2e8eb8620c69da69263333f25b91e))
* update to Next.js 15, AI SDK 4, Bun SQLite ([1f27bdd](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/1f27bddde749fc290a0c0fac9177374245ad2da7))

### Bug Fixes

* add php debug endpoint to troubleshoot post data ([46d6f69](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/46d6f696b29e3154927c33c138997d895b31cd91))
* add retry logic and loading state for first load ([728b578](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/728b578165c985ea2e3509eb3b7987ad8f9280c7))
* build better-sqlite3 in docker for glibc compatibility ([a5c652b](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/a5c652b35940a2ea7ed7c72d611115c66befd6a5))
* **ci:** disable husky hooks in semantic-release ([63895b4](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/63895b4d3dfb53fcd6b21ba972a9a22282a6a80d))
* clean up debug files and simplify php proxy ([d432db9](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/d432db9e9e0fc93a160ae8d809bfb40c3ac4c030))
* correct api response parsing in usethreads hook ([2741982](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/27419822ac293ef642dcb25acccd6ac1f0ee340b))
* **deploy:** auto-generate index.html for fastcgi workaround ([16a4f6b](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/16a4f6b7ef2fe3dda5a64f66aceccd7c8d8483ed))
* **deploy:** improve fastcgi compatibility and add pm2 save ([493fe6b](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/493fe6b79eb03dfd5918ab0c3a4b337ebc72ef7c))
* **deploy:** improve production deployment and fix hydration issues ([40f8c85](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/40f8c85fd562edb7a2f610788bbbaefa370c57e7))
* **deploy:** split deployment into smaller packages to avoid ssh timeout ([22700de](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/22700de82aa287d762fd1184a3b15cc897956d1b))
* **deploy:** use ftp instead of ssh to bypass ip blocking ([190f467](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/190f4671b35f5640c0350761ac6e49d93b6799d2))
* **deploy:** use ssh key instead of password for reliable auto-deploy ([2f1367f](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/2f1367f5fb4f039174f90233c2105ad51e3809ab))
* **deploy:** use sshpass with password instead of ssh key ([6023587](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/602358728edbe410e692a02916324bc68b503f1e))
* ensure deploy overwrites existing files correctly ([b17b1d9](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/b17b1d9e0aef87ceac84f3bccb116358117f0efc))
* fix property tests and database constructor ([87fb5fc](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/87fb5fc8251faf69fc3d80a11b791bc2dc404978))
* **healthcheck:** use direct pm2 path to avoid nvm loading issues ([b16b36f](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/b16b36fcb3cd33452fbaf5b782119bd9be409c34))
* **husky:** fallback to npm when bun is not available ([9ea30f6](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/9ea30f616ee0831659d2e60a7076927bb4d8c9c7))
* **husky:** fallback to npx for commit-msg hook ([dbd82cd](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/dbd82cd9eaefeff5091f0dcc967178bf60910efa))
* improve first load and php proxy stability ([06a72c2](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/06a72c2ebd6a973660b31f95cdb6ba40c78fdb23))
* improve php proxy post data handling ([b548bc2](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/b548bc205a80c53e740c5d0434e4c60ad9788970))
* improve pm2 startup and add port env var ([7e71e9e](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/7e71e9e9ee595434472c36af8a92ca4074266ddf))
* improve post data handling in php proxy ([1180c8e](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/1180c8e8615c5717f02253fd5632b8e62e186161))
* properly forward Content-Length and Content-Type headers in PHP proxy ([f0f0f9b](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/f0f0f9ba919accee0825d3918f5fefedaf800ced))
* read post data at script start before any other code ([1755f07](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/1755f07659a2d9430357fa4c4cdb04c1f4a50c51))
* replace bun:sqlite with better-sqlite3 for next.js 16 compatibility ([c17f8d2](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/c17f8d261138af6f5ad622c148eb2f69d7b34413))
* switch php proxy to curl and wrap htaccess in ifmodule ([b78a3b2](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/b78a3b258af31cd070b8129037a181d951b6f616))
* **ui:** center api key button vertically with header ([154717c](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/154717cb9757de36e7b78cf3ab50b2eec10dd640))
* **ui:** ensure api key button stays horizontal with flex-nowrap ([25cf6f5](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/25cf6f57ef96abaa9b7f556179750966d162c5f0))
* **ui:** fix api key required label horizontal layout ([2badf37](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/2badf371c2c173b776328f1df94de189e1ae2004))
* **ui:** force horizontal layout for api key label ([cb529c3](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/cb529c3b0920c2d977eb22b57ae03c20701d579a))
* **ui:** move api key required label to settings button ([0bcd34c](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/0bcd34c1e84700d93fc6ec4dc0115a48cd3532a5))
* **ui:** place api key required label to the left of button ([34bd880](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/34bd880b64e5b4a76d78f7eae80e0a0b17cf2c9f))
* update docker configuration for node.js instead of bun ([4d3d88a](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/4d3d88a605696090cc3170dc63722da9019e3bd7))
* update htaccess and simplify php proxy ([bbc5b26](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/bbc5b265e44980c4494b1d5f95b46244d82d339f))
* update htaccess to route all requests through php proxy ([d429d79](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/d429d79d86b1c8cf3b2200d723682b764a473b31))
* use stream for reading php input ([73b5719](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/73b571951b0eaabebea13f06ce21a6d3848cef7f))

### Documentation

* update readme with compliance table and docker instructions ([b6944a3](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/b6944a333bf4eb63f583bbf7b719f2b2b9a38d84))

### Tests

* migrate property tests from bun:test to vitest ([a9990c8](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/a9990c8a775cb494475709b628e6b3a57aa28a0c))

### Continuous Integration

* disable github pages workflow (app requires server) ([9dbd46c](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/9dbd46cfc66193ea0f7e4f6c0088487877f50074))
* fix semantic-release credentials for github token ([1cb2eb2](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/1cb2eb2eb6b7e91835ca6217b68e193078b01115))
* update github workflows from bun to node.js ([be3dc0b](https://github.com/ibuildrun/chatgpt-xlsx-analyzer/commit/be3dc0bf76b81afe8af0a5839070dc0f5cc2d326))
