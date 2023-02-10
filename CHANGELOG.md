# Changelog

### Unreleased

- Bump SDK to 1.0.70-alpha
- Bump SDK to 1.0.66-alpha
- Bump SDK to 1.0.60-alpha to include joinsplit processing after refund processing fix
- Add `START_BLOCK` and `RPC_URL` consts for overriding
- Bump sdk to 1.0.55-alpha
- Bump sdk to 1.0.50-alpha to include unawaited promises when processing refunds/joinsplits
- print error when `tryGetPreProofOperation` fails
- don't set default gas params when getting joinsplit inputs
- update SDK
- set node version in changelog to 18.12.1
- remove default `verificationGas` and `gasPrice`
- clean up resolutions
- fix missing await bugs
- Add permission to manifest for `snap_getBip44Entropy`.
- Remove `SnapDB` in place of `SnapKvStore` after sdk db refactor (remove inheritance)
- Update SDK after removing `toJSON` and `fromJSON` methods
- Move to separate repo and rename flax to nocturne
- Expose methods to sync notes, sync leaves, and provide web page with pre-proof spend tx inputs and proof inputs (currently points to hh local node and hardcode addresses)
- Start `snap` package
