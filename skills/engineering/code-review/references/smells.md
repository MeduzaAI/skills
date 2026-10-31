# Smell baseline

Fowler's code smells (_Refactoring_, ch. 3), checked against the diff even when the repo documents nothing.

- **The repo overrides.** Where a documented repo standard endorses something below, suppress the smell.
- **Always a judgement call.** Label it as a heuristic ("possible Feature Envy"), never a hard violation. Skip anything tooling already enforces.

Each reads what it is → how to fix:

- **Mysterious Name**: a function, variable or type whose name doesn't reveal what it does or holds. → Rename it; if no honest name comes, the design is murky.
- **Duplicated Code**: the same logic shape in more than one hunk or file of the change. → Extract the shared shape and call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → Move it onto the data it envies.
- **Data Clumps**: the same few fields or params travelling together. → Bundle them into one type and pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept. → Give the concept its own small type.
- **Repeated Switches**: the same `switch` or `if` cascade on the same type recurring across the change. → Polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forcing scattered edits across many files. → Gather what changes together into one module.
- **Divergent Change**: one file or module edited for several unrelated reasons. → Split it so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters or hooks for needs the spec doesn't have. → Delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → Hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly delegates onward. → Cut it and call the real target directly.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → Drop the inheritance and use composition.
