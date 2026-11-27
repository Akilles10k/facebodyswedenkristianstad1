import assert from "node:assert/strict";
import { slotsForDate } from "./slots.ts";

const saturday = new Date(2026, 10, 28, 9, 0, 0);
const beforeWeekend = new Date(2026, 10, 27, 12, 0, 0);
const openSaturday = slotsForDate(saturday, 60, [], beforeWeekend);
assert.deepEqual(openSaturday[0], "12:00");
assert.deepEqual(openSaturday.at(-1), "15:00");
assert.equal(openSaturday.includes("11:30"), false);
assert.equal(openSaturday.includes("15:30"), false);

const blocked = slotsForDate(saturday, 60, [{ time: "12:00", minutes: 60 }], beforeWeekend);
assert.equal(blocked.includes("12:00"), false);
assert.equal(blocked.includes("12:30"), false);
assert.equal(blocked[0], "13:00");

const friday = new Date(2026, 10, 27, 10, 0, 0);
const afternoon = new Date(2026, 10, 27, 16, 0, 0);
const laterToday = slotsForDate(friday, 30, [], afternoon);
assert.equal(laterToday[0], "17:00");
assert.equal(laterToday.at(-1), "18:30");

const tooLong = slotsForDate(saturday, 300, [], beforeWeekend);
assert.deepEqual(tooLong, []);

const yesterday = new Date(2026, 10, 26);
assert.deepEqual(slotsForDate(yesterday, 30, [], beforeWeekend), []);

console.log("slots ok", openSaturday.length, "saturday starts");
