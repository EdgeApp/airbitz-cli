# airbitz-cli

## 0.4.5 (2020-07-09)

- added: Include Typescript definitions for the CLI library.
- added: Include a native mjs entry point for modern Node versions.
- changed: Upgrade edge-core-js to v0.17.9.
- fixed: Many broken commands work again, thanks to type-checking.

## 0.4.4 (2020-07-09)

- Add commands:
  - `username-delete`
  - `account-key`
  - `key-login`
  - `pin-delete`
- Fix the `pin-setup` command.

## 0.4.3 (2020-01-09)

- Make the API key optional.

## 0.4.2

- Upgrade to edge-core-js v0.16.

## 0.4.1

- Stop login from hanging.
- Add commands:
  - `data-store-list`
  - `data-store-delete`
  - `data-store-get`
  - `data-store-set`
  - `lobby-reply`
  - `lobby-login-fetch`

## 0.4.0

- Upgrade to edge-core-js v0.15.
- Add commands:
  - `auth-fetch`
  - `filename-hash`
  - `key-undelete`
  - `lobby-fetch`
  - `lobby-login-approve`
  - `logout`
  - `messages-fetch`
  - `otp-disable`
  - `otp-enable`
  - `otp-reset-cancel`
  - `otp-reset-request`
  - `otp-status`
  - `username-hash`
  - `username-list`
  - `wallet-undelete`
- Remove `tx-*` commands.

## 0.3.2

- Export the CLI commands as a library.
- Add a `username-hash` command.

## 0.3.1

- Bump the core version so things actually work.

## 0.3.0

- Intial release
