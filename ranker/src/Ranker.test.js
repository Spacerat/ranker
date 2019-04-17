const { Set } = require('immutable');

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
});

it('accepts random rankings when sampled', () => {
    let r = Ranker.make(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "12"]);
    while (!r.is_complete()) {
        const sample = r.sample();
        const choice = Math.round(Math.random());
        r = r.add_ranking(sample[choice], sample[1 - choice])
    }
});

it('adds rankings immutably', () => {
    const r1 = Ranker.make(["foo", "bar"]);
    const r2 = r1.add_ranking("foo", "bar");

    expect(r1.compare("foo", "bar")).toBe(0);
    expect(r2.compare("foo", "bar")).toBe(1);
});

