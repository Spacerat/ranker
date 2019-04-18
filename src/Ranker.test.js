// @flow

const { Set, Range } = require('immutable');

import React from 'react';
import ReactDOM from 'react-dom';
import Ranker from './Ranker';

it('instantiates', () => {
    Ranker.make(["foo", "bar", "baz"])
});

it('adds rankings correctly', () => {
    let r = Ranker.make(["foo", "bar", "baz"]);

    expect(r.is_complete()).toBe(false);

    r = r.add_ranking("bar", "baz");
    expect(r.is_complete()).toBe(false);

    r = r.add_ranking("foo", "bar")
    expect(r.is_complete()).toBe(true);

    expect(r.compare("foo", "foo")).toBe(0);
    expect(r.compare("bar", "bar")).toBe(0);
    expect(r.compare("baz", "baz")).toBe(0);

    expect(r.compare("foo", "bar")).toBe(1);
    expect(r.compare("foo", "baz")).toBe(1);
    expect(r.compare("bar", "baz")).toBe(1);

    expect(r.compare("baz", "bar")).toBe(-1);
    expect(r.compare("baz", "foo")).toBe(-1);
    expect(r.compare("bar", "foo")).toBe(-1);

    expect(r.everything_less_than("foo")).toEqual(Set(["bar", "baz"]))
    expect(r.everything_less_than("bar")).toEqual(Set(["baz"]))
    expect(r.everything_less_than("baz")).toEqual(Set([]))

    expect(r.everything_greater_than("foo")).toEqual(Set([]))
    expect(r.everything_greater_than("bar")).toEqual(Set(["foo"]))
    expect(r.everything_greater_than("baz")).toEqual(Set(["foo", "bar"]))
});

it('accepts random rankings when sampled', () => {
    let r = Ranker.make(Range(0, 10).map(v => v.toString()));
    while (!r.is_complete()) {
        const sample = r.sample();
        const choice = Math.round(Math.random());
        r = r.add_ranking(sample[choice], sample[1 - choice])
    }
});

it('fails to set inconsistent ordering', () => {
    let r = Ranker.make(['a', 'b', 'c'])
    r = r.add_ranking('a', 'b')
    r = r.add_ranking('b', 'c')

    expect(() => {
        r = r.add_ranking('c', 'a')
    }).toThrow();


});


it('allows item set to be modified', () => {
    let r = Ranker.make(['a', 'b', 'c'])
    r = r.add_ranking('b', 'c')
    r = r.set_items(['a', 'b', 'd'])
    r = r.set_items(['a', 'b', 'c', 'd'])
    r = r.add_ranking('c', 'b')
});

it('adds rankings immutably', () => {
    const r1 = Ranker.make(["foo", "bar"]);
    const r2 = r1.add_ranking("foo", "bar");

    expect(r1.compare("foo", "bar")).toBe(0);
    expect(r2.compare("foo", "bar")).toBe(1);
});

