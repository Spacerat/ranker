import { Record } from "immutable";
import Ranker from "./Ranker";
import { Pair } from "./Ranker";

/* eslint-disable no-use-before-define */
type AppStateProps = {
  sample: Pair | null;
  ranker: Ranker;
  prev_state: AppState | null;
};
/* eslint-enable no-use-before-define */

const defaultValues: AppStateProps = {
  ranker: Ranker.make([]),
  sample: null,
  prev_state: null,
};

class AppState extends Record(defaultValues) {
  /* AppState is basically a wrapper around Ranker which manages a sample */
  set_items(items?: Iterable<string>): AppState {
    let self = this;
    self = self.update("ranker", (ranker) => ranker.set_items(items));
    return self.update_sample();
  }

  get_sample(): Pair | null {
    return this.get("sample");
  }

  get_items(): Array<string> {
    const result = this.getIn(["ranker", "all_items"]);
    return result ? result.toArray() : [];
  }

  choose(idx: number): AppState {
    const old_state = this;
    let self = this;
    const sample = self.get_sample();
    if (!sample) return this;
    self = self.update("ranker", (ranker) =>
      ranker.add_ranking(sample[idx], sample[1 - idx])
    );
    self = self.set("prev_state", old_state);
    return self.set("sample", null).update_sample();
  }

  get_sorted_items(): Array<string> {
    const ranker = this.get("ranker");
    const all_items = ranker.get("all_items");
    return all_items.toArray().sort((a, b) => ranker.compare(a, b));
  }

  undo(): AppState {
    const prev_state = this.get("prev_state");
    return prev_state ? prev_state : this;
  }

  update_sample(): AppState {
    let self: AppState = this;
    const ranker = self.get("ranker");

    console.log(ranker.num_remaining_items());
    console.log(ranker.get("remaining_pairs").toJS());
    // If there's not enough items, clear the sample.
    if (ranker.num_remaining_items() < 1) {
      return self.set("sample", null);
    }

    // Otherwise, if the sample is null, create a sample
    const sample = self.get("sample");

    if (sample == null) {
      return self.set("sample", ranker.sample());
    }

    // If we have a sample but it's invalid, resample
    const all_items = ranker.get("all_items");

    if (!all_items.isSuperset(sample)) {
      return self.set("sample", ranker.sample());
    }
    return self;
  }
}

export default AppState;
