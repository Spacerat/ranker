#! /usr/bin/env python

import sys
from collections import defaultdict
from functools import cmp_to_key
from itertools import combinations


class Ranker:
    def __init__(self, items):
        self._greater_than = defaultdict(set)
        self._remaining_pairs = {frozenset(x) for x in combinations(items, 2)}

    def sample(self):
        for item in self._remaining_pairs:
            return item

    def add_ranking(self, larger, smaller):
        """ Decide that 'larger' is greater than 'smaller' """
        key = frozenset([larger, smaller])

        if larger in self._greater_than[smaller]:
            raise ValueError(f"{smaller} is already greater than {larger}")

        if key not in self._remaining_pairs:
            return

        # Set larger as being greater than smaller
        self._remaining_pairs.remove(key)

        self._greater_than[larger].add(smaller)

        # Set larger as being greater than everything which smaller is greater than
        for item in self._greater_than[smaller]:
            self.add_ranking(larger, item)

    def sorted(self, items, *args, **kwargs):
        kwargs["key"] = self.key_func
        return sorted(items, *args, **kwargs)

    @property
    def key_func(self):
        return cmp_to_key(self.cmp_items)

    def cmp_items(self, a, b):
        if a not in self._greater_than:
            raise KeyError(f"Item {a} not found in ordering")
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

    r = Ranker(items)

    s = r.sample()
    while s:
        try:
            larger, smaller = pick_one(*list(s))
        except KeyboardInterrupt:
            break
        except Undo:
            continue
        r.add_ranking(larger, smaller)
        s = r.sample()

    for x in r.sorted(items, reverse=True):
        print(x)


if __name__ == "__main__":
    main()
