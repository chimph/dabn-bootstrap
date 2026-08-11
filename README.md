# DABN bootstrap directory

This repository publishes DABN's machine-generated bootstrap discovery data.
It contains no signing secrets and is not an authority by itself: DABN clients
verify the directory's signature, schema, issue time, expiry, peer identities
and multiaddresses before using it.

Published endpoints:

- [`bootstrap/v2/directory.json`](https://chimph.github.io/dabn-bootstrap/bootstrap/v2/directory.json) — the signed, currently healthy bootstrap set used by clients.
- [`bootstrap/v2/health.json`](https://chimph.github.io/dabn-bootstrap/bootstrap/v2/health.json) — a non-authoritative health summary for operators.

Candidate admission and signing happen in a separate reviewed workflow. Direct
changes to generated files in this repository are overwritten and do not grant
a node admission to the directory.
