---
description: Guides for writing tests in Python. Use before writing, or reviewing Python tests (or planning, iff planning at the function level).
---

# Python tests

- Write tests with pytest
- Prefer test functions to classes
- Use parametrize to minimise the number of test functions required
- Write helper functions or fixtures for any re-used code between tests
- Store any values in constants either at the top of the module (if reused)
  or top of the function
