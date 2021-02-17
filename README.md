# Meet speaking time tracker chrome extension

## How to develop locally

Prerequisites:
- node
- yarn
- npm

If you want to develop this extension locally, you need to:
- clone this repo
- install dependencies: `yarn install`
- run `yarn watch` for unix
- run `yarn watch-win` for windows

This will create a dist folder that you can load as a `Unpacked extension` in your chrome: https://developer.chrome.com/docs/extensions/mv2/getstarted/#manifest.

Whenever you change some code, webpack will automatically re-build the package but you have to **manually** reload the extension in Chrome's settings page. After this you may need to refresh the Google meet page in order to restart the scripts.