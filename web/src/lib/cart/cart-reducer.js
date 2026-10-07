export const MAX_ITEMS = 10;
export const MAX_QUANTITY = 10;

export const initialCartState = { items: [], lastRemoved: null };

export function clampQuantity(value) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, number));
}

const sameBooking = (a, b) =>
  a.productId === b.productId &&
  a.startDate === b.startDate &&
  a.endDate === b.endDate;

function mergeInto(items, targetId, extraQuantity, pricing) {
  return items.map((item) =>
    item.id === targetId
      ? {
          ...item,
          pricing: pricing ?? item.pricing,
          quantity: clampQuantity(item.quantity + extraQuantity),
        }
      : item,
  );
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "hydrate":
      return { items: action.items.slice(0, MAX_ITEMS), lastRemoved: null };

    case "add": {
      const incoming = {
        ...action.item,
        quantity: clampQuantity(action.item.quantity),
      };
      const twin = state.items.find((item) => sameBooking(item, incoming));
      if (twin) {
        return {
          ...state,
          items: mergeInto(state.items, twin.id, incoming.quantity, incoming.pricing),
        };
      }
      if (state.items.length >= MAX_ITEMS) return state;
      return { ...state, items: [...state.items, incoming] };
    }

    case "setQuantity":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, quantity: clampQuantity(action.quantity) }
            : item,
        ),
      };

    case "setDates": {
      const target = state.items.find((item) => item.id === action.id);
      if (!target) return state;
      const updated = {
        ...target,
        startDate: action.startDate,
        endDate: action.endDate,
      };
      const twin = state.items.find(
        (item) => item.id !== target.id && sameBooking(item, updated),
      );
      if (twin) {
        // les deux lignes sont devenues identiques : on les fusionne
        return {
          ...state,
          items: mergeInto(
            state.items.filter((item) => item.id !== target.id),
            twin.id,
            target.quantity,
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) => (item.id === target.id ? updated : item)),
      };
    }

    case "remove": {
      const index = state.items.findIndex((item) => item.id === action.id);
      if (index === -1) return state;
      return {
        items: state.items.filter((item) => item.id !== action.id),
        lastRemoved: { item: state.items[index], index },
      };
    }

    case "undoRemove": {
      if (!state.lastRemoved) return state;
      const { item, index } = state.lastRemoved;
      const twin = state.items.find((other) => sameBooking(other, item));
      if (twin) {
        return {
          items: mergeInto(state.items, twin.id, item.quantity),
          lastRemoved: null,
        };
      }
      const items = [...state.items];
      items.splice(Math.min(index, items.length), 0, item);
      return { items: items.slice(0, MAX_ITEMS), lastRemoved: null };
    }

    case "dismissUndo":
      return { ...state, lastRemoved: null };

    case "clear":
      return initialCartState;

    default:
      return state;
  }
}