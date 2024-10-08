# airbitz-cli

## Unreleased

## 2.0.0 (2024-10-03)

- changed: The `lobby-login-fetch` command shows `displayImageDarkUrl` and `displayImageLightUrl` instead of the deprecated `displayImageUrl`.
- removed: `exchange-convert` command. The core no longer supports exchange rate plugins.
- removed: Deprecated `account-remove` command.

## 1.1.3 (2024-03-21)

- changed: Use cleaners for the config file, to better report errors.

## 1.1.2 (2024-03-12)

- fixed: Bump our edge-core-js dependency to v1.14.0.

## 1.1.1 (2024-03-12)

- fixed: Clean the `auth-fetch` payload to avoid data corruption.

## 1.1.0 (2023-09-14)

- added: Look up the loginId during the `username-hash` command.
- changed: Upgrade to edge-core-js v1.4.2, which fixes PIN changes on light accounts.

## 1.0.2 (2023-08-10)

- fixed: Correctly mark the `airbitz-cli` executable as being CommonJS.

## 1.0.1 (2023-07-31)

- fixed: Modernize package structure to work with the latest Node.js and TypeScript versions.

## 1.0.0 (2023-07-31)

- changed: Upgrade to edge-core-js v1.3.3.
- changed: The `key-list` command no longer shows private keys, just info.
- added: The new `key-get` command shows raw private keys.

## 0.4.7 (2022-01-03)

- fixed: Do not crash the CLI when individual commands fail.

## 0.4.6 (2020-09-21)

- changed: Upgrade to edge-core-js v0.18.6.
- fixed: Prevent core logging from spamming the console in interactive mode.

## 0.4.5 (2021-09-08)

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
