#! /usr/bin/env python

import sys
from functools import cmp_to_key
from itertools import combinations
from pyrsistent import pset, pmap_field, PSet, pset_field, PClass, field


class Ranker(PClass):
    _greater_than = pmap_field(str, PSet)
    _remaining_pairs = pset_field(PSet)
    _all_items = field(initial=pset())

    @classmethod
    def new(cls, items):
        remaining = pset({pset(x) for x in combinations(items, 2)})
        return cls(_remaining_pairs=remaining)

    def is_complete(self):
        return len(self._remaining_pairs) == 0

    def add_ranking(self, larger, smaller):
        """ Decide that 'larger' is greater than 'smaller' """
        key = pset([larger, smaller])

        slf = self

        if slf.has_item(smaller) and slf.has_item(larger) and slf.cmp_items(smaller, larger) > 0:
            raise ValueError(f"{smaller} is already greater than {larger}")

        if key not in slf._remaining_pairs:
            return slf

        # Set larger as being greater than smaller
        slf = slf.set(_remaining_pairs=slf._remaining_pairs.remove(key))
        if larger not in slf._greater_than:
            slf = slf.set(_greater_than=slf._greater_than.set(larger, pset()))
        if smaller not in slf._greater_than:
            slf = slf.set(_greater_than=slf._greater_than.set(smaller, pset()))

        slf = slf.set(
            _greater_than=slf._greater_than.set(larger, slf._greater_than[larger].add(smaller)),
            _all_items=slf._all_items.add(larger).add(smaller),
        )

        # Set larger as being greater than everything which smaller is greater than
        for item in slf.everying_less_than(larger):
            slf = slf.add_ranking(larger, item)

        return slf

    def sample(self):
        for item in self._remaining_pairs:
            return item

    def everying_less_than(self, item):
        return self._greater_than[item]

    def has_item(self, item):
        return item in self._all_items

    def sorted_items(self, *args, **kwargs):
        return self.sorted(self._all_items, *args, **kwargs)

    def sorted(self, items, *args, **kwargs):
        kwargs["key"] = self.key_func
        return sorted(items, *args, **kwargs)

    @property
    def key_func(self):
        return cmp_to_key(self.cmp_items)

    def cmp_items(self, a, b):
        if not self.has_item(a):
            raise KeyError(f"Item {a} not found")
        if not self.has_item(b):
            raise KeyError(f"Item {b} not found")
        a_greater_than_b = b in self._greater_than[a]
        return 1 if a_greater_than_b else -1


class Undo(Exception):
    """ Raised when we want to stop """


def pick_one(a, b):
    print("Which is greater?")
    print(f"1. {a}")
    print(f"2. {b}")
    while True:
        result = input("> ")
        if result == "1":
            return a, b
        if result == "2":
            return b, a
        if result == "u":
            raise Undo()


def main():
    items = set(sys.argv[1:])

    if not items:
        print("Warning: No items specified", file=sys.stderr)
        return

    r = Ranker.new(items)

    rankings = []

    s = r.sample()
    while s:
        print()
        print("List:", ", ".join(r.sorted_items(reverse=True)))
        print()
        try:
            larger, smaller = pick_one(*list(s))
        except KeyboardInterrupt:
            break
        except Undo:
            try:
                r = rankings.pop()
            except IndexError:
                pass
            continue
        rankings.append(r)
        r = r.add_ranking(larger, smaller)
        s = r.sample()

    if not r.is_complete():
        print("Warning: Ranking is incomplete")

    for x in r.sorted_items(reverse=True):
        print(x)


if __name__ == "__main__":
    main()
