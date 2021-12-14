import { Record, Map, Set } from "immutable";

type StringSet = Set<string>;
type SetsMap = Map<string, StringSet>;
type SetSet = Set<StringSet>;
export type Pair = [string, string];

type RankerProps = {
  greater_than: SetsMap;
  remaining_pairs: SetSet;
  all_items: StringSet;
};
const defaultValues: RankerProps = {
  greater_than: Map({}),
  remaining_pairs: Set([]),
  all_items: Set([]),
};

function pair(a: string, b: string): StringSet {
  return Set([a, b]);
}

function combinations(items: Iterable<string>) {
  let combinations: SetSet = Set([]);
  for (let a of items) {
    for (let b of items) {
      if (a !== b) {
        combinations = combinations.add(pair(a, b));
      }
    }
  }
  return combinations;
}

class Ranker extends Record(defaultValues) {
  static make(items?: Iterable<string>): Ranker {
    items = !items ? Set([]) : items;
    return new Ranker({
      remaining_pairs: combinations(items),
      all_items: Set(items),
    });
  }

  set_items(items?: Iterable<string>): Ranker {
    let self = this;
    const item_set = !items ? Set([]) : Set(items);
    const all_items = this.get("all_items");

    // Figure out which items to add/remove and which are unchanged
    const to_remove = all_items.subtract(item_set);
    const to_add = item_set.subtract(all_items);
    const overlap = item_set.intersect(all_items);

    let remaining_pairs = self.get("remaining_pairs");

    // Add missing pairs, remove pairs which are now invalid
    remaining_pairs = remaining_pairs.union(
      combinations(overlap.union(to_add))
    );
    remaining_pairs = remaining_pairs.filter(
      (val) => val.intersect(to_remove).size === 0
    );

    // Remove any relationships contianing removed items
    const greater_than = self
      .get("greater_than")
      .deleteAll(to_remove)
      .map((val) => val.subtract(to_remove));

    return self.merge({
      greater_than: greater_than,
      remaining_pairs: remaining_pairs,
      all_items: item_set,
    });
  }

  num_remaining_items(): number {
    return this.get("remaining_pairs").size;
  }

  is_complete(): boolean {
    return this.get("remaining_pairs").size === 0;
  }

  add_ranking(larger: any, smaller: string): Ranker {
    const key: StringSet = pair(larger, smaller);
    let self: Ranker = this;

    if (self.get("all_items").intersect([larger, smaller]).size !== 2) {
      throw new Error(`Not expecting to set ${larger} or ${smaller}`);
    }

    // Check that we've not already set smaller > larger
    if (self.compare(smaller, larger) > 0) {
      throw new Error(`smaller is already greater than larger`);
    }

    if (!self.get("remaining_pairs").includes(key)) {
      return self;
    }

    self = self.removeIn(["remaining_pairs", key]);

    if (!self.hasIn(["greater_than", larger])) {
      self = self.setIn(["greater_than", larger], Set([]));
    }

    // Set 'larger' as being greater than 'smaller'
    self = self.updateIn(["greater_than", larger], (s) => s.add(smaller));
    self = self.update("all_items", (s) => s.union([larger, smaller]));

    // Set 'larger' as being greater than everything which 'smaller' is greater than
    for (let item of self.everything_less_than(smaller)) {
      self = self.add_ranking(larger, item);
    }

    // Set everything larger than 'larger' as being greater than 'smaller'
    for (let item of self.everything_greater_than(larger)) {
      self = self.add_ranking(item, smaller);
    }
    return self;
  }

  everything_less_than(item: string): StringSet {
    const result = this.getIn(["greater_than", item]);
    return result ? result : Set();
  }

  everything_greater_than(item: string): StringSet {
    return Set(
      this.get("greater_than")
        .filter((v) => v.has(item))
        .keys()
    );
  }

  sample(): Pair | null {
    let lowest: StringSet | null = null;
    let lowest_size = Infinity;

    for (let item of this.get("remaining_pairs").values()) {
      const pair = item.toArray();
      const size1 = this.add_ranking(pair[0], pair[1]).num_remaining_items();
      const size2 = this.add_ranking(pair[1], pair[0]).num_remaining_items();
      const expected_size = size1 + size2 / 2.0;

      if (expected_size < lowest_size) {
        lowest = item;
        lowest_size = expected_size;
      }
    }
    if (!!lowest) {
      const pair = lowest.toArray();
      return [pair[0], pair[1]];
    }
    return null;
  }

  compare(a: string, b: string): number {
    // Return 1 if a > b, 0 if a == b, -1 if a < b
    const greater_than = this.get("greater_than");
    if (greater_than.get(a, Set()).includes(b)) {
      return 1;
    }
    if (greater_than.get(b, Set()).includes(a)) {
      return -1;
    }
    return 0;
  }
}

export default Ranker;
