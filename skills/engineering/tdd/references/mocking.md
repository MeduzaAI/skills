# Where to mock

Fake only what crosses a system boundary: the network, third-party services, the clock, randomness, and sometimes the filesystem or database. Prefer the repo's own fakes, in-memory adapters and test databases over a hand-written mock.

Everything you own runs for real: your modules, classes and internal collaborators. A mock there makes the test pass whatever that code does.

## Mocking the unit under test

```typescript
// BAD: the module under test is mocked, so the test checks the mock
vi.mock("./pricing", () => ({ priceFor: () => 1200 }));
test("priceFor returns the list price", () => {
  expect(priceFor("A1")).toBe(1200);
});
```

## Inject the boundary

```typescript
// Hard to fake: the boundary is created inside
async function sendReceipt(order: Order) {
  const client = new MailClient(process.env.MAIL_KEY);
  await client.send(order.email, render(order));
}

// Easy to fake: the boundary is passed in
async function sendReceipt(order: Order, mail: Mailer) {
  await mail.send(order.email, render(order));
}
```

## Wrap what you don't own

Put a thin interface you own in front of a third-party SDK, one function per operation, and fake that interface. The fake returns one shape per function, with no branching on the request.

```typescript
// GOOD: narrow, owned interface; the fake records what was sent
interface Mailer { send(to: string, body: string): Promise<void> }

class FakeMailer implements Mailer {
  sent: { to: string; body: string }[] = [];
  async send(to: string, body: string) { this.sent.push({ to, body }); }
}

test("a paid order emails its receipt to the buyer", async () => {
  const mail = new FakeMailer();
  await sendReceipt(paidOrder({ email: "a@example.com", totalCents: 1200 }), mail);
  expect(mail.sent).toEqual([{ to: "a@example.com", body: "Total: $12.00" }]);
});

// BAD: one generic fetch mock that switches on the URL
vi.mocked(fetch).mockImplementation((url) =>
  url.includes("/users") ? userResponse : url.includes("/orders") ? orderResponse : notFound);
```

Asserting what a fake at the boundary received (the email sent, the request made) is the behaviour itself and is fine. Asserting how often your own code called itself is not.

## Time and randomness

Inject a clock or seed, or use the runner's fake timers. A test that sleeps or reads the real date is slow and flaky.

```typescript
test("a coupon expires at the end of its last day", () => {
  const clock = fixedClock("2026-03-01T00:00:00Z");
  expect(isValid(coupon({ lastDay: "2026-02-28" }), clock)).toBe(false);
});
```
