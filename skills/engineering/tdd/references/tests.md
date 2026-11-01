# Good and bad tests

Each pair shows a test that would miss a break, then one that catches it.

## Through the interface, not the internals

```typescript
// BAD: mirrors the implementation's calls; passes if the order is never confirmed
test("checkout calls paymentService.process", async () => {
  const process = vi.spyOn(paymentService, "process");
  await checkout(cart, card);
  expect(process).toHaveBeenCalledWith(cart.total);
});

// GOOD: asserts what the caller gets
test("checkout confirms an order for a valid cart", async () => {
  const result = await checkout(cartWith({ sku: "A1", price: 1200 }), validCard);
  expect(result).toEqual({ status: "confirmed", chargedCents: 1200 });
});
```

## Read back through the interface, not a side channel

```typescript
// BAD: reaches past the interface into storage, and only checks existence
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: the behaviour is "a created user can be fetched"
test("a created user can be fetched by id", async () => {
  const { id } = await createUser({ name: "Alice" });
  expect(await getUser(id)).toMatchObject({ id, name: "Alice" });
});
```

## Independent oracle

```typescript
// BAD: recomputes the answer the way the code does, so it can never disagree
test("calculateTotal sums line items", () => {
  const items = [{ price: 10, qty: 2 }, { price: 5, qty: 1 }];
  const expected = items.reduce((s, i) => s + i.price * i.qty, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// GOOD: a worked example from the spec
test("calculateTotal multiplies price by quantity and sums", () => {
  expect(calculateTotal([{ price: 10, qty: 2 }, { price: 5, qty: 1 }])).toBe(25);
});
```

## Assert the value, not that something came back

```typescript
// BAD: passes for any non-empty result, including the wrong one
test("parses the header", () => {
  const result = parseHeader("Retry-After: 120");
  expect(result).toBeTruthy();
  expect(() => parseHeader("Retry-After: 120")).not.toThrow();
});

// GOOD
test("reads Retry-After seconds", () => {
  expect(parseHeader("Retry-After: 120")).toEqual({ retryAfterSeconds: 120 });
});
```

## Name the behaviour

```typescript
// BAD: names the mechanism
test("uses the cache map", () => { /* ... */ });

// GOOD: names what the caller can rely on
test("returns the same price for a repeated lookup without refetching", () => { /* ... */ });
```

## Don't test what earns nothing

```typescript
// BAD: tests the type system and a getter
test("user has a name property", () => {
  expect(new User("Alice").name).toBe("Alice");
});
```

No replacement: delete it. Spend the test on a rule that can actually be wrong.
