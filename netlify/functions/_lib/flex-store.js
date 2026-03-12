const state = globalThis.__flex4genzState || {
  drafts: new Map(),
  profileSaves: [],
  modelUsage: new Map()
};

globalThis.__flex4genzState = state;

export function addDraft(draft) {
  state.drafts.set(draft.id, draft);
  return draft;
}

export function listDrafts() {
  return Array.from(state.drafts.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function deleteDraftById(id) {
  return state.drafts.delete(id);
}

export function addProfileSave(item) {
  state.profileSaves.push(item);
  return item;
}

export function getUsage(model) {
  return state.modelUsage.get(model) || 0;
}

export function bumpUsage(model) {
  const next = getUsage(model) + 1;
  state.modelUsage.set(model, next);
  return next;
}
