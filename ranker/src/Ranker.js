// @flow

const { Record, Map, Set } = require('immutable');

type StringSet = Set<string>;
type SetsMap = Map<string, StringSet>;
type SetSet = Set<StringSet>;


type RankerProps = {
    greater_than: SetsMap,
    remaining_pairs: SetSet,
    all_items: StringSet
};
const defaultValues: RankerProps = {
    greater_than: Map({}),
    remaining_pairs: Set([]),
    all_items: Set([])
}
const RankerRecord = Record(defaultValues);

class Ranker extends RankerRecord<RankerProps> {
    static make(items: Array<string>): Ranker {
        let remaining: SetSet = Set([])
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

    add_ranking(larger: any, smaller: string): Ranker {
        const key: StringSet = Set([larger, smaller]);
        let self: Ranker = this;

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

    everything_less_than(item: string): StringSet {
        return this.getIn(['greater_than', item], Set())
    }

    sample(): ?[string, string] {
        for (let item of this.get('remaining_pairs').values()) {
            const result = item.toArray()
            return [result[0], result[1]]
        }
    }

    compare(a: string, b: string): number {
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