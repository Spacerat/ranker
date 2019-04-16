// @flow

const { Record, Map, Set } = require('immutable');

type SetsMap<T> = Map<T, Set<T>>;
type SetSet<T> = Set<Set<T>>;


type RankerProps<T> = {
    greater_than: SetsMap<T>,
    remaining_pairs: SetSet<T>,
    all_items: Set<T>
};
const defaultValues: RankerProps<void> = {
    greater_than: Map({}),
    remaining_pairs: Set([]),
    all_items: Set([])
}
const RankerRecord = Record(defaultValues);

class Ranker<T> extends RankerRecord<RankerProps<T>> {
    static make(items: Array<T>): Ranker<T> {
        let remaining: SetSet<T> = Set([])
        for (let a of items) {
            for (let b of items) {
                if (a !== b) {
                    remaining = remaining.add(Set([a, b]))
                }
            }
        }
        return new Ranker({ remaining_pairs: remaining })
    }

    is_complete(): bool {
        return this.get('remaining_pairs').size === 0
    }

    add_ranking(larger: any, smaller: T): Ranker<T> {
        const key: Set<T> = Set([larger, smaller]);
        let self: Ranker<T> = this;

        if (!self.get('remaining_pairs').includes(key)) {
            return self;
        }

        // Check that we've not already set smaller > larger
        if (self.compare(smaller, larger) > 0) {
            throw new Error(`smaller is already greater than larger`);
        }


        self = self.removeIn(['remaining_pairs', key])

        if (!self.hasIn(['greater_than', larger])) {
            self = self.setIn(['greater_than', larger], Set([]))
        }

        // Set 'larger' as being greater than 'smaller'
        self = self.updateIn(['greater_than', larger], s => s.add(smaller));
        self = self.update('all_items', s => s.union([larger, smaller]));

        // Set 'larger' as being greater than everything which 'smaller' is greater than
        for (let item of self.everything_less_than(smaller)) {
            self = self.add_ranking(larger, item);
        }
        return self;
    }

    everything_less_than(item: T): Set<T> {
        return this.getIn(['greater_than', item], Set())
    }

    sample(): ?[T, T] {
        for (let item of this.get('remaining_pairs').values()) {
            const result = item.toJS().sort();
            return ((result: any): [T, T])
        }
    }

    compare(a: T, b: T): number {
        // Return 1 if a > b, 0 if a == b, -1 if a < b
        const greater_than = this.get('greater_than');
        if (greater_than.get(a, Set()).includes(b)) {
            return 1
        }
        if (greater_than.get(b, Set()).includes(a)) {
            return -1
        }
        return 0
    }

}


export default Ranker;