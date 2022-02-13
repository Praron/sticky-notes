**[Try online](https://praron.github.io/sticky-notes/)**

- [x] Create a new note of the specified size at the specified position.
- [x] Change note size by dragging.
- [x] Move a note by dragging.
- [x] Remove a note by dragging it over a predefined "trash".

Bonus:
- [ ] Entering/editing note text.
- [ ] Moving notes to front (in case of overlapping notes).
- [x] Saving notes to local storage (restoring them on page load).
- [x] Different note colors.
- [ ] Saving notes to REST API. Note: you're not required to implement the API, you can mock it, but the mocks should.

# Architecture
Main component of application is `<Board />`, it manages state of notes and interaction with user, all other components are stateless.

Primary states of `<Board />` is `notes` (position, dimension, and color of each note, stored as map `id->note`) and `action` (data, required for current, if any, interaction with user. For example, while user creates note by pressing-moving-releasing mouse, it stores position of initial mouse press and current mouse position).

# Build
```
yarn install
yarn star
```
