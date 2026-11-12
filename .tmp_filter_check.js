const assert = require('assert');
const cases = [
    { currency: 'USD', country: 'IN', expected: false },
    { currency: 'INR', country: 'IN', expected: true },
    { currency: 'USD', country: 'US', expected: true },
    { currency: 'INR', country: 'US', expected: false },
    { currency: 'USD', country: 'ALL', expected: true },
    { currency: 'INR', country: 'ALL', expected: true }
];
for (const test of cases) {
    const countryTags = (test.country || '').toLowerCase().split(',').map((tag) => tag.trim());
    const forIndia = countryTags.some((tag) => ['in', 'india', 'inr'].includes(tag));
    const forUS = countryTags.some((tag) => ['us', 'usa', 'usd'].includes(tag));
    const forAll = countryTags.some((tag) => ['all', 'both', 'global', ''].includes(tag));
    const show = forAll || (test.currency === 'INR' ? forIndia : forUS);
    assert.equal(show, test.expected, JSON.stringify(test));
}
console.log('country filter logic checks passed');
