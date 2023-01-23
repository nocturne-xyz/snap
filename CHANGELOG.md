# Changelog

### Unreleased

- remove default `verificationGas` and `gasPrice`
- clean up resolutions
- fix missing await bugs
- Add permission to manifest for `snap_getBip44Entropy`.
- Remove `SnapDB` in place of `SnapKvStore` after sdk db refactor (remove inheritance)
- Update SDK after removing `toJSON` and `fromJSON` methods
- Move to separate repo and rename flax to nocturne
- Expose methods to sync notes, sync leaves, and provide web page with pre-proof spend tx inputs and proof inputs (currently points to hh local node and hardcode addresses)
- Start `snap` package
