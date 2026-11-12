---
description: Opinions on general code design. Use before designing, writing, or reviewing code solutions
---

# Code design opinons

I always ensure that all code is necessary and has a purpose. I hate to write
more code than necessary to complete a task well.

I like Strong typing and I prefer data-oriented declarative designs where
business rules are encoded in types and metadata rather than imperative control
flow.

For tests, I don't believe we need to 'test the universe'. I want unit tests
mostly for complex functions which are likely to have mistakes. I don't test
implementation details, but rather the outer product.

- Prefer more verbose variable names, purpose should be understood at a glance
- Ensure units are included in variable names where appropriate
- DRY - Don't repeat yourself.
- Focus on maintainability, scalability, extensibility.
- Strive for a single source of truth.
